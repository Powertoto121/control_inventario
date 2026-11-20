<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CatalogoMerma;
use App\Models\Inventario;
use App\Models\RegistroMerma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MermaController extends Controller
{
    public function catalogo()
    {
        return response()->json(CatalogoMerma::all());
    }

    public function index()
    {
        $mermas = RegistroMerma::with(['inventario.producto.categoria', 'catalogoMerma', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'productoId' => $m->inventario->producto_id ?? null,
                    'productoNombre' => $m->inventario->producto->nombre ?? 'Producto eliminado',
                    'categoria' => $m->inventario->producto->categoria->nombre ?? 'General',
                    'unidadMedida' => $m->inventario->producto->unidad_medida ?? 'pza',
                    'cantidad' => (float) $m->cantidad,
                    'motivoId' => $m->catalogo_merma_id,
                    'motivo' => $m->catalogoMerma->razon ?? 'Fecha Vencida / Caducidad',
                    'motivoNombre' => $m->catalogoMerma->razon ?? 'Fecha Vencida / Caducidad',
                    'costoUnitario' => (float) ($m->inventario->precio_costo ?? 0),
                    'costoTotalPerdida' => (float) $m->costo_total_perdida,
                    'responsable' => $m->user->nombre ?? $m->user->name ?? 'Administrador',
                    'fecha' => $m->created_at ? $m->created_at->format('Y-m-d') : date('Y-m-d'),
                    'hora' => $m->created_at ? $m->created_at->format('H:i') : '',
                    'notas' => $m->notas,
                    'imagenEvidencia' => $m->imagen_evidencia ? Storage::url($m->imagen_evidencia) : null,
                ];
            });

        return response()->json($mermas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cantidad' => 'required|numeric|min:0.1',
            'imagen_evidencia' => 'nullable|image|max:5120',
        ]);

        $inventarioId = $request->inventario_id;

        if (!$inventarioId && $request->has('productoId')) {
            $inventario = Inventario::where('producto_id', $request->productoId)->first();
            if ($inventario) {
                $inventarioId = $inventario->id;
            }
        }

        $lote = Inventario::with('producto')->findOrFail($inventarioId);

        if ($lote->stock < $request->cantidad) {
            return response()->json([
                'message' => 'No hay suficiente stock en este lote para registrar la merma.'
            ], 400);
        }

        $razonRecibida = trim((string) $request->input('motivo_nombre', ''));
        if ($razonRecibida !== '') {
            $catalogo = CatalogoMerma::firstOrCreate(
                ['razon' => $razonRecibida],
                ['descripcion' => 'Motivo registrado desde mostrador']
            );
            $catalogoId = $catalogo->id;
        } else {
            $catalogoId = $request->catalogo_merma_id;
            if (!$catalogoId || !CatalogoMerma::find($catalogoId)) {
                $catalogoDefault = CatalogoMerma::firstOrCreate(
                    ['razon' => 'Fecha Vencida / Caducidad'],
                    ['descripcion' => 'Producto vencido o en mal estado']
                );
                $catalogoId = $catalogoDefault->id;
            }
        }

        $rutaImagen = null;
        if ($request->hasFile('imagen_evidencia')) {
            $rutaImagen = $request->file('imagen_evidencia')->store('mermas', 'public');
        }

        $costoTotalPerdida = $request->cantidad * $lote->precio_costo;

        $merma = RegistroMerma::create([
            'inventario_id' => $lote->id,
            'user_id' => $request->user_id ?? 1,
            'catalogo_merma_id' => $catalogoId,
            'cantidad' => $request->cantidad,
            'costo_total_perdida' => $costoTotalPerdida,
            'imagen_evidencia' => $rutaImagen,
            'notas' => $request->notas ?? 'Merma rápida de mostrador',
        ]);

        $lote->stock -= $request->cantidad;
        $lote->save();

        return response()->json([
            'message' => 'Merma registrada correctamente',
            'merma' => $merma,
            'imagenUrl' => $rutaImagen ? Storage::url($rutaImagen) : null,
            'producto' => $lote->producto->load(['categoria', 'inventarios'])
        ], 201);
    }
}