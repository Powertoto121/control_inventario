<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Inventario;
use App\Models\Categoria;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        // Buscamos las categorías que creamos antes
        $abarrotes = Categoria::where('nombre', 'Abarrotes')->first();
        $lacteos = Categoria::where('nombre', 'Lácteos')->first();
        $bebidas = Categoria::where('nombre', 'Bebidas')->first();

        // Producto 1: Leche Entera
        $prod1 = Producto::create([
            'categoria_id' => $lacteos ? $lacteos->id : 1,
            'nombre' => 'Leche Entera 1L',
            'codigo_barras' => '7501055310123',
            'unidad_medida' => 'litro',
            'stock_minimo' => 5,
        ]);
        Inventario::create([
            'producto_id' => $prod1->id,
            'stock' => 14,
            'precio_costo' => 22.50,
            'precio_venta' => 28.00,
            'fecha_caducidad' => '2026-12-31',
        ]);

        // Producto 2: Pan de Caja
        $prod2 = Producto::create([
            'categoria_id' => $abarrotes ? $abarrotes->id : 1,
            'nombre' => 'Pan de Caja Integral',
            'codigo_barras' => '750103420581',
            'unidad_medida' => 'pza',
            'stock_minimo' => 4,
        ]);
        Inventario::create([
            'producto_id' => $prod2->id,
            'stock' => 3,
            'precio_costo' => 35.00,
            'precio_venta' => 45.00,
            'fecha_caducidad' => '2026-10-15',
        ]);
    }
}