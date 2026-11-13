<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
            $table->string('barcode')->unique()->nullable(); // Permitimos nullable por si algún producto no tiene código físico
            $table->string('sku')->nullable(); 
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('unidad_medida')->default('pza'); // pza, kg, litro, paq
            $table->decimal('precio_costo', 10, 2)->default(0); 
            $table->decimal('precio_venta', 10, 2)->default(0); 
            $table->integer('min_stock')->default(5); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};