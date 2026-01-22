<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('turma_id')->nullable()->constrained('turmas');
            $table->foreignId('colaborador_id')->nullable()->constrained('funcionarios');
            $table->foreignId('ordem_servico_id')->nullable()->constrained('ordem_servicos')->nullOnDelete();
            $table->text('descricao')->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->dateTime('data_entrada')->nullable();
            $table->dateTime('data_saida')->nullable();
            $table->string('estado', 40)->default('agendado');
            $table->boolean('situacao_checklist')->default(false);
            $table->timestamps();

            $table->index(['empresa_id', 'turma_id'], 'creches_empresa_turma_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creches');
    }
};
