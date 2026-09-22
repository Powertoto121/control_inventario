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
    Schema::create('registro_mermas', function (Blueprint $table) {
        $table->id();
        $table->foreignId('inventario_id')->constrained('inventario')->onDelete('cascade');
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('catalogo_merma_id')->constrained('catalogo_mermas')->onDelete('cascade');
        $table->integer('cantidad');
        $table->decimal('costo_total_perdida', 10, 2);
        $table->text('notas')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registro_mermas');
    }
};
