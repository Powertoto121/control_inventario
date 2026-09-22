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
    Schema::create('inventario', function (Blueprint $table) {
        $table->id(); 
        $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
        $table->string('codigo_lote')->nullable();
        $table->decimal('precio_costo', 10, 2);
        $table->decimal('precio_venta', 10, 2);
        $table->integer('stock');
        $table->date('fecha_caducidad')->nullable();
        $table->date('fecha_ingreso');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventario');
    }
};
