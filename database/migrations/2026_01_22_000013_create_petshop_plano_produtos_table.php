<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_plano_produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_versao_id')->constrained('petshop_plano_versoes')->cascadeOnDelete();
            $table->foreignId('produto_id')->nullable()->constrained('produtos');
            $table->foreignId('variacao_id')->nullable()->constrained('produto_variacaos');
            $table->integer('qtd_por_ciclo')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['plano_versao_id', 'produto_id'], 'petshop_pl_prod_versao_produto_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_plano_produtos');
    }
};
