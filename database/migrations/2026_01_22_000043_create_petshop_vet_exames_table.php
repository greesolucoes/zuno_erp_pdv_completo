<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_exames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('atendimento_id')->nullable()->constrained('petshop_vet_atendimentos')->nullOnDelete();
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('medico_id')->nullable()->constrained('petshop_medicos');
            $table->foreignId('exame_id')->nullable()->constrained('animais_exames');

            $table->date('data_prevista_coleta')->nullable();
            $table->string('laboratorio_parceiro', 180)->nullable();
            $table->string('prioridade', 30)->default('normal');
            $table->longText('observacoes_clinicas')->nullable();
            $table->longText('laudo')->nullable();
            $table->dateTime('data_conclusao')->nullable();
            $table->string('status', 40)->default('rascunho');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_id', 'status'], 'ps_vet_exames_emp_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_exames');
    }
};
