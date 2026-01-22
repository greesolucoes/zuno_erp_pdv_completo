<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prontuarios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('atendimento_id')->nullable()->constrained('petshop_vet_atendimentos')->nullOnDelete();
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('tutor_id')->nullable()->constrained('clientes');
            $table->foreignId('veterinario_id')->nullable()->constrained('petshop_medicos');
            $table->foreignId('modelo_avaliacao_id')->nullable()->constrained('petshop_vet_modelos_avaliacao')->nullOnDelete();

            $table->string('codigo', 40)->nullable();
            $table->string('status', 40)->default('draft');
            $table->string('tipo', 80)->nullable();
            $table->dateTime('data_registro')->nullable();

            $table->text('resumo_rapido')->nullable();
            $table->longText('resumo')->nullable();
            $table->text('queixa_principal')->nullable();
            $table->longText('historico_clinico')->nullable();
            $table->longText('avaliacao_fisica')->nullable();
            $table->longText('diagnostico_presuntivo')->nullable();
            $table->longText('diagnostico_definitivo')->nullable();
            $table->longText('plano_terapeutico')->nullable();
            $table->longText('orientacoes_tutor')->nullable();
            $table->longText('observacoes_adicionais')->nullable();

            $table->json('sinais_vitais')->nullable();
            $table->json('avaliacao_personalizada')->nullable();
            $table->json('campos_avaliacao')->nullable();
            $table->json('snapshot_paciente')->nullable();
            $table->json('snapshot_tutor')->nullable();
            $table->json('dados_triagem')->nullable();
            $table->json('lembretes')->nullable();
            $table->json('checklists')->nullable();
            $table->json('comunicacoes')->nullable();
            $table->json('anexos')->nullable();
            $table->json('metadata')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->unique('codigo');
            $table->index(['empresa_id', 'status'], 'ps_vet_pront_emp_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prontuarios');
    }
};
