<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_consumos_servicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assinatura_id')->constrained('petshop_assinaturas')->cascadeOnDelete();
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->dateTime('ciclo_inicio');
            $table->dateTime('ciclo_fim');
            $table->integer('quantidade_usada')->default(0);
            $table->dateTime('used_at')->nullable();
            $table->json('meta')->nullable();

            $table->unique(['assinatura_id', 'servico_id', 'ciclo_inicio', 'ciclo_fim'], 'petshop_consumo_servico_periodo_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_consumos_servicos');
    }
};

