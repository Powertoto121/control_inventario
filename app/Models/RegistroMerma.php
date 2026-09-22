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
        'notas',
    ];

    // La merma pertenece a un lote de inventario
    public function inventario()
    {
        return $this->belongsTo(Inventario::class, 'inventario_id');
    }

    // La merma fue registrada por un usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // La merma pertenece a una razón del catálogo
    public function razon()
    {
        return $this->belongsTo(CatalogoMerma::class, 'catalogo_merma_id');
    }
}