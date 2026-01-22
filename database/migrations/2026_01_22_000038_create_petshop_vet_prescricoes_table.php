<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prescricoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('veterinario_id')->nullable()->constrained('petshop_medicos');
            $table->foreignId('atendimento_id')->nullable()->constrained('petshop_vet_atendimentos')->nullOnDelete();
            $table->foreignId('prontuario_id')->nullable()->constrained('petshop_vet_prontuarios')->nullOnDelete();
            $table->foreignId('modelo_prescricao_id')->nullable()->constrained('petshop_vet_modelos_prescricao')->nullOnDelete();

            $table->text('diagnostico')->nullable();
            $table->text('resumo')->nullable();
            $table->longText('observacoes')->nullable();
            $table->longText('orientacoes')->nullable();
            $table->unsignedBigInteger('dispensacao_id')->nullable();
            $table->text('dispensacao_observacoes')->nullable();
            $table->json('campos_personalizados')->nullable();
            $table->dateTime('emitida_em')->nullable();
            $table->string('status', 40)->default('rascunho');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['empresa_id', 'animal_id'], 'ps_vet_presc_emp_animal_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prescricoes');
    }
};
