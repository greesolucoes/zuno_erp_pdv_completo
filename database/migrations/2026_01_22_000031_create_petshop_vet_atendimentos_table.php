<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_atendimentos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('tutor_id')->nullable()->constrained('clientes');
            $table->string('tutor_nome', 180)->nullable();
            $table->string('contato_tutor', 40)->nullable();
            $table->string('email_tutor', 120)->nullable();

            $table->foreignId('veterinario_id')->nullable()->constrained('petshop_medicos');
            $table->foreignId('sala_id')->nullable()->constrained('petshop_salas_atendimento');
            $table->foreignId('servico_id')->nullable()->constrained('servicos');

            $table->date('data_atendimento')->nullable();
            $table->string('horario', 10)->nullable();
            $table->string('status', 40)->default('agendado');
            $table->string('tipo_atendimento', 80)->nullable();
            $table->text('motivo_visita')->nullable();

            $table->decimal('peso', 10, 2)->nullable();
            $table->decimal('temperatura', 10, 2)->nullable();
            $table->integer('frequencia_cardiaca')->nullable();
            $table->integer('frequencia_respiratoria')->nullable();
            $table->text('observacoes_triagem')->nullable();
            $table->json('checklists')->nullable();

            $table->string('codigo', 30)->nullable();

            $table->timestamps();

            $table->index(['empresa_id', 'data_atendimento'], 'ps_vet_atd_emp_data_idx');
            $table->unique('codigo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_atendimentos');
    }
};
