<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'barcode',
        'nombre',
        'descripcion',
        'min_stock',
    ];

    // Un producto pertenece a una categoría
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    // Un producto tiene muchos lotes en inventario
    public function inventarios()
    {
        return $this->hasMany(Inventario::class, 'producto_id');
    }
}