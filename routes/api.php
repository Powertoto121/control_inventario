<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Producto;
use App\Models\Inventario;
use App\Models\CatalogoMerma;
use App\Models\RegistroMerma;
use Illuminate\Support\Facades\Hash;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta de Autenticación / Login Manual
Route::post('/login', function (Request $request) {
    $request->validate([
        'username' => 'required',
        'password' => 'required',
    ]);

    $user = User::where('username', $request->username)->first();

    // Verificación flexible de contraseña (soporta texto plano para pruebas o Hasheada con Hash::check)
    if (!$user || ($request->password !== $user->password && !Hash::check($request->password, $user->password))) {
        return response()->json([
            'message' => 'Credenciales inválidas'
        ], 401);
    }

    return response()->json([
        'message' => 'Bienvenido al sistema',
        'user' => $user
    ]);
});

// Obtener Lista de Productos con su Inventario y Categoría
Route::get('/productos', function () {
    return response()->json(Producto::with(['categoria', 'inventarios'])->get());
});

// Crear o Actualizar un Producto desde el Frontend
Route::post('/productos', function (Request $request) {
    $producto = Producto::create([
        'nombre' => $request->nombre,
        'codigo_barras' => $request->codigo_barras ?? $request->barcode,
        'categoria_id' => $request->categoria_id ?? 1,
        'stock_minimo' => $request->stock_minimo ?? 5,
        'unidad_medida' => $request->unidad_medida ?? 'pza',
    ]);

    // Crear un inventario inicial por defecto si trae costo
    Inventario::create([
        'producto_id' => $producto->id,
        'stock' => $request->stock ?? 10,
        'precio_costo' => $request->costoCompra ?? $request->precio_costo ?? 10.00,
        'precio_venta' => $request->precioVenta ?? $request->precio_venta ?? 15.00,
    ]);

    return response()->json([
        'message' => 'Producto creado con éxito',
        'producto' => $producto->load(['categoria', 'inventarios'])
    ], 201);
});

Route::put('/productos/{id}', function (Request $request, $id) {
    $producto = Producto::findOrFail($id);
    $producto->update($request->all());

    return response()->json([
        'message' => 'Producto actualizado',
        'producto' => $producto->load(['categoria', 'inventarios'])
    ]);
});

Route::delete('/productos/{id}', function ($id) {
    $producto = Producto::findOrFail($id);
    $producto->delete();

    return response()->json(['message' => 'Producto eliminado correctamente']);
});

// Obtener Catálogo de Mermas
Route::get('/catalogo-mermas', function () {
    return response()->json(CatalogoMerma::all());
});

// Registrar una nueva Merma y descontar stock del inventario (Adaptado para React)
Route::post('/mermas', function (Request $request) {
    $request->validate([
        'cantidad' => 'required|numeric|min:0.1',
    ]);

    // Identificar el inventario o lote a afectar
    $inventarioId = $request->inventario_id;
    
    if (!$inventarioId && $request->has('productoId')) {
        // Si el frontend manda el productoId, buscamos su primer inventario o lote disponible
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

    // Corregido el operador de multiplicación (*)
    $costoTotalPerdida = $request->cantidad * $lote->precio_costo;

    // Crear el registro de merma
    $merma = RegistroMerma::create([
        'inventario_id' => $lote->id,
        'user_id' => $request->user_id ?? 1, // Por defecto usuario 1 si no viene especificado
        'catalogo_merma_id' => $request->catalogo_merma_id ?? 1,
        'cantidad' => $request->cantidad,
        'costo_total_perdida' => $costoTotalPerdida,
        'notas' => $request->notas ?? 'Merma rápida de mostrador',
    ]);

    // Descontar el stock del lote actual
    $lote->stock -= $request->cantidad;
    $lote->save();

    return response()->json([
        'message' => 'Merma registrada correctamente',
        'merma' => $merma,
        'producto' => $lote->producto->load(['categoria', 'inventarios'])
    ], 201);
});