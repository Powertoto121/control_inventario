<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Inventario;
use App\Models\Categoria;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        return response()->json(Producto::with(['categoria', 'inventarios'])->orderBy('id', 'asc')->get());
    }

    private function resolverCategoriaId(Request $request, $default = 1)
    {
        if ($request->filled('categoria_id')) {
            return $request->categoria_id;
        }

        $nombreCat = $request->categoria ?? $request->category;
        if (!empty($nombreCat) && is_string($nombreCat)) {
            $cat = Categoria::firstOrCreate(
                ['nombre' => trim($nombreCat)],
                ['descripcion' => 'Categoría ' . trim($nombreCat)]
            );
            return $cat->id;
        }

        return $default;
    }

    public function store(Request $request)
    {
        $categoriaId = $this->resolverCategoriaId($request, 1);
        $costo = $request->costoCompra ?? $request->precio_costo ?? 0;
        $venta = $request->precioVenta ?? $request->precio_venta ?? 0;

        $producto = Producto::create([
            'nombre' => $request->nombre,
            'barcode' => $request->barcode ?? $request->codigoBarras ?? $request->codigo_barras ?? 'SIN-CODIGO',
            'sku' => $request->sku ?? $request->barcode ?? null,
            'categoria_id' => $categoriaId,
            'unidad_medida' => $request->unidad_medida ?? $request->unidadMedida ?? 'pza',
            'descripcion' => $request->descripcion ?? '',
            'precio_costo' => $costo,
            'precio_venta' => $venta,
            'min_stock' => $request->stockMinimo ?? $request->min_stock ?? $request->stock_minimo ?? 5,
        ]);

        Inventario::create([
            'producto_id' => $producto->id,
            'codigo_lote' => 'LOTE-' . time(),
            'stock' => $request->stockActual ?? $request->stock ?? 10,
            'precio_costo' => $costo,
            'precio_venta' => $venta,
            'fecha_ingreso' => now()->toDateString(),
            'fecha_caducidad' => $request->fecha_caducidad ?: null,
        ]);

        return response()->json([
            'message' => 'Producto creado con éxito',
            'producto' => $producto->load(['categoria', 'inventarios'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);
        $categoriaId = $this->resolverCategoriaId($request, $producto->categoria_id);
        $costo = $request->costoCompra ?? $request->precio_costo ?? $producto->precio_costo;
        $venta = $request->precioVenta ?? $request->precio_venta ?? $producto->precio_venta;

        $producto->update([
            'nombre' => $request->nombre ?? $producto->nombre,
            'barcode' => $request->barcode ?? $request->codigoBarras ?? $request->codigo_barras ?? $producto->barcode,
            'sku' => $request->sku ?? $request->barcode ?? $producto->sku,
            'categoria_id' => $categoriaId,
            'unidad_medida' => $request->unidad_medida ?? $request->unidadMedida ?? $producto->unidad_medida,
            'descripcion' => $request->descripcion ?? $producto->descripcion,
            'precio_costo' => $costo,
            'precio_venta' => $venta,
            'min_stock' => $request->stockMinimo ?? $request->min_stock ?? $request->stock_minimo ?? $producto->min_stock,
        ]);

        $inventario = Inventario::where('producto_id', $producto->id)->first();
        if ($inventario) {
            $inventario->update([
                'stock' => $request->stockActual ?? $request->stock ?? $inventario->stock,
                'precio_costo' => $costo,
                'precio_venta' => $venta,
                'fecha_caducidad' => $request->has('fecha_caducidad')
                    ? ($request->fecha_caducidad ?: null)
                    : $inventario->fecha_caducidad,
            ]);
        } else {
            Inventario::create([
                'producto_id' => $producto->id,
                'codigo_lote' => 'LOTE-' . time(),
                'stock' => $request->stockActual ?? $request->stock ?? 0,
                'precio_costo' => $costo,
                'precio_venta' => $venta,
                'fecha_ingreso' => now()->toDateString(),
                'fecha_caducidad' => $request->fecha_caducidad ?: null,
            ]);
        }

        return response()->json([
            'message' => 'Producto actualizado',
            'producto' => $producto->load(['categoria', 'inventarios'])
        ]);
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);
        $producto->inventarios()->delete();
        $producto->delete();

        return response()->json(['message' => 'Producto eliminado correctamente']);
    }
}