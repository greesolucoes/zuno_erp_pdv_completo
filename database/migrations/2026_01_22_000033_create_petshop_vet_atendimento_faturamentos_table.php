<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_atendimento_faturamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('atendimento_id')->constrained('petshop_vet_atendimentos')->cascadeOnDelete();
            $table->decimal('total_servicos', 10, 2)->default(0);
            $table->decimal('total_produtos', 10, 2)->default(0);
            $table->decimal('total_geral', 10, 2)->default(0);
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_atendimento_faturamentos');
    }
};

