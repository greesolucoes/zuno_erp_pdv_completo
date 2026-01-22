<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estetica_produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estetica_id')->constrained('esteticas')->cascadeOnDelete();
            $table->foreignId('produto_id')->nullable()->constrained('produtos');
            $table->integer('quantidade')->default(1);
            $table->decimal('valor', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['estetica_id', 'produto_id'], 'estetica_produtos_estetica_produto_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estetica_produtos');
    }
};
