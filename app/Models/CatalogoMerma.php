<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoMerma extends Model
{
    use HasFactory;

    protected $table = 'catalogo_mermas';

    protected $fillable = [
        'razon',
    ];

    // Una razón de merma puede estar presente en múltiples registros
    public function registros()
    {
        return $this->hasMany(RegistroMerma::class, 'catalogo_merma_id');
    }
}