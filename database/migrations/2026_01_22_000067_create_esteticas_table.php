<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('esteticas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('colaborador_id')->nullable()->constrained('funcionarios');
            $table->foreignId('plano_id')->nullable()->constrained('petshop_planos')->nullOnDelete();
            $table->foreignId('ordem_servico_id')->nullable()->constrained('ordem_servicos')->nullOnDelete();

            $table->text('descricao')->nullable();
            $table->date('data_agendamento')->nullable();
            $table->time('horario_agendamento')->nullable();
            $table->time('horario_saida')->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->string('estado', 40)->default('agendado');

            $table->timestamps();

            $table->index(['empresa_id', 'data_agendamento'], 'esteticas_empresa_data_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('esteticas');
    }
};
