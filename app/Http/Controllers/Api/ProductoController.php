<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    // GET: Obtener todos los productos con su categoría
    public function index()
    {
        return response()->json(Producto::with('categoria')->get(), 200);
    }

    // POST: Guardar un nuevo producto
    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'barcode'      => 'required|unique:productos,barcode',
            'nombre'       => 'required|string|max:255',
            'descripcion'  => 'nullable|string',
            'min_stock'    => 'required|integer|min:0',
        ]);

        $producto = Producto::create($validated);

        return response()->json([
            'message' => 'Producto creado con éxito',
            'data'    => $producto
        ], 201);
    }

    // GET {id}: Mostrar un producto específico
    public function show($id)
    {
        $producto = Producto::with('categoria')->find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto, 200);
    }

    // PUT/PATCH {id}: Actualizar producto
    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $validated = $request->validate([
            'categoria_id' => 'sometimes|exists:categorias,id',
            'barcode'      => 'sometimes|unique:productos,barcode,' . $id,
            'nombre'       => 'sometimes|string|max:255',
            'descripcion'  => 'nullable|string',
            'min_stock'    => 'sometimes|integer|min:0',
        ]);

        $producto->update($validated);

        return response()->json([
            'message' => 'Producto actualizado con éxito',
            'data'    => $producto
        ], 200);
    }

    // DELETE {id}: Eliminar producto
    public function destroy($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $producto->delete();

        return response()->json(['message' => 'Producto eliminado correctamente'], 200);
    }
}