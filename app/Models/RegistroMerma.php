<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistroMerma extends Model
{
    use HasFactory;

    protected $table = 'registro_mermas';

    protected $fillable = [
        'inventario_id',
        'user_id',
        'catalogo_merma_id',
        'cantidad',
        'costo_total_perdida',
        'imagen_evidencia',
        'notas',
    ];

    public function inventario()
    {
        return $this->belongsTo(Inventario::class, 'inventario_id');
    }

    public function catalogoMerma()
    {
        return $this->belongsTo(CatalogoMerma::class, 'catalogo_merma_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}