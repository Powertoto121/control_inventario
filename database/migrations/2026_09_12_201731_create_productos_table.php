<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('productos', function (Blueprint $table) {
       $table->id();
    $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
    $table->string('barcode')->unique();
    $table->string('sku')->nullable(); // Añadido para compatibilidad con el frontend
    $table->string('nombre');
    $table->text('descripcion')->nullable();
    $table->string('unidad_medida')->default('pza'); // pza, kg, litro, paq
    $table->decimal('precio_costo', 10, 2)->default(0); // Costo de compra
    $table->decimal('precio_venta', 10, 2)->default(0); // Precio al público
    $table->integer('min_stock')->default(5); // Stock mínimo para alertas
    $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
