<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_atendimento_faturamento_produtos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('faturamento_id');
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('produto_id')->nullable()->constrained('produtos');
            $table->string('nome_produto', 180)->nullable();
            $table->decimal('quantidade', 12, 3)->default(0);
            $table->decimal('valor_unitario', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->timestamps();

            // MySQL identifier limit (64 chars) - use short explicit FK names.
            $table->foreign('faturamento_id', 'ps_vet_fat_prod_fat_fk')
                ->references('id')
                ->on('petshop_vet_atendimento_faturamentos')
                ->cascadeOnDelete();

            $table->index(['faturamento_id', 'produto_id'], 'ps_vet_fat_prod_fat_prod_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_atendimento_faturamento_produtos');
    }
};
