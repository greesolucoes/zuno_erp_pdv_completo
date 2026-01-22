<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vacinacoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('medico_id')->nullable()->constrained('petshop_medicos');
            $table->foreignId('attendance_id')->nullable()->constrained('petshop_vet_atendimentos')->nullOnDelete();
            $table->foreignId('sala_atendimento_id')->nullable()->constrained('petshop_salas_atendimento');
            $table->foreignId('protocolo_id')->nullable()->constrained('petshop_protocolos_vacina')->nullOnDelete();

            $table->string('codigo', 60)->nullable();
            $table->string('status', 40)->default('pendente');
            $table->dateTime('scheduled_at')->nullable();
            $table->foreignId('scheduled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('duration_minutes')->nullable();
            $table->json('reminders')->nullable();
            $table->json('checklist')->nullable();
            $table->longText('observacoes_planejamento')->nullable();
            $table->longText('observacoes_clinicas')->nullable();
            $table->longText('observacoes_logistica')->nullable();
            $table->longText('instrucoes_tutor')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_id', 'scheduled_at'], 'ps_vac_emp_sched_idx');
            $table->unique('codigo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vacinacoes');
    }
};
