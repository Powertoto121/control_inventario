<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categoria;
use App\Models\CatalogoMerma;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatosInicialesSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario Administrador de prueba
        User::firstOrCreate(
            ['email' => 'admin@tienda.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password123'),
            ]
        );

        // Categorías básicas
        $categorias = ['Abarrotes', 'Lácteos', 'Bebidas', 'Limpieza', 'Snacks'];
        foreach ($categorias as $cat) {
            Categoria::firstOrCreate(['nombre' => $cat]);
        }

        // Catálogo de Motivos de Merma
        $motivos = [
            'Producto Caducado',
            'Empaque Dañado / Roto',
            'Defecto de Fábrica',
            'Robo / Extravío',
            'Deterioro por Almacenamiento'
        ];
        foreach ($motivos as $motivo) {
            CatalogoMerma::firstOrCreate(['razon' => $motivo]);
        }
    }
}