<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Categoria;
use App\Models\CatalogoMerma;
use App\Models\Producto;docker compose exec laravel.test npm run build
use App\Models\Inventario;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear usuarios esenciales (Admin y Cajero)
        User::create([
            'name' => 'Administrador',
            'username' => 'admin',
            'email' => 'admin@latiendita.com',
            'password' => Hash::make('1234'),
            'rol' => 'administrador',
        ]);

        User::create([
            'name' => 'Carlos Cajero',
            'username' => 'carlos',
            'email' => 'carlos@latiendita.com',
            'password' => Hash::make('123'),
            'rol' => 'cajero',
        ]);

        // 2. Categorías básicas
        $catLacteos = Categoria::create(['nombre' => 'Lácteos', 'descripcion' => 'Lácteos y frescos']);
        $catAbarrotes = Categoria::create(['nombre' => 'Abarrotes', 'descripcion' => 'No perecederos']);

        // 3. Catálogo de mermas esencial
        CatalogoMerma::create(['razon' => 'Producto Caducado']);
        CatalogoMerma::create(['razon' => 'Empaque Dañado / Roto']);

        // 4. Producto de prueba 1 (Leche)
        $prod1 = Producto::create([
            'categoria_id' => $catLacteos->id,
            'nombre' => 'Leche Entera 1L',
            'barcode' => '7501055310123',
            'unidad_medida' => 'litro',
            'min_stock' => 5,
        ]);
        
        Inventario::create([
            'producto_id' => $prod1->id,
            'stock' => 14,
            'precio_costo' => 22.50,
            'precio_venta' => 28.00,
            'fecha_caducidad' => '2026-12-31',
            'fecha_ingreso' => now(),
        ]);

        // 5. Producto de prueba 2 (Pan)
        $prod2 = Producto::create([
            'categoria_id' => $catAbarrotes->id,
            'nombre' => 'Pan de Caja Integral',
            'barcode' => '750103420581',
            'unidad_medida' => 'pza',
            'min_stock' => 4,
        ]);
        
        Inventario::create([
            'producto_id' => $prod2->id,
            'stock' => 3,
            'precio_costo' => 35.00,
            'precio_venta' => 45.00,
            'fecha_caducidad' => '2026-10-15',
            'fecha_ingreso' => now(),
        ]);
    }
}