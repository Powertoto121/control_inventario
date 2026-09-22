<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventario extends Model
{
    use HasFactory;

    protected $table = 'inventario';

    protected $fillable = [
        'producto_id',
        'codigo_lote',
        'precio_costo',
        'precio_venta',
        'stock',
        'fecha_caducidad',
        'fecha_ingreso',
    ];

    // Un lote de inventario pertenece a un producto
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    // Un lote de inventario puede tener muchos registros de mermas
    public function mermas()
    {
        return $this->hasMany(RegistroMerma::class, 'inventario_id');
    }
}