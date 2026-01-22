<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_plano_servicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_versao_id')->constrained('petshop_plano_versoes')->cascadeOnDelete();
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->integer('qtd_por_ciclo')->default(1);
            $table->decimal('valor_servico', 10, 2)->default(0);
            $table->string('coparticipacao_tipo', 30)->nullable();
            $table->decimal('coparticipacao_valor', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['plano_versao_id', 'servico_id'], 'petshop_pl_serv_versao_servico_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_plano_servicos');
    }
};
