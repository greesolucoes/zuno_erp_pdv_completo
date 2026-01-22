<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_internacoes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('tutor_id')->nullable()->constrained('clientes');
            $table->foreignId('atendimento_id')->nullable()->constrained('petshop_vet_atendimentos')->nullOnDelete();
            $table->foreignId('veterinario_id')->nullable()->constrained('petshop_medicos');
            $table->foreignId('sala_internacao_id')->nullable()->constrained('petshop_salas_internacao');

            $table->string('status', 40)->default('rascunho');
            $table->string('nivel_risco', 20)->nullable();
            $table->dateTime('internado_em')->nullable();
            $table->dateTime('previsao_alta_em')->nullable();
            $table->dateTime('alta_em')->nullable();
            $table->text('motivo')->nullable();
            $table->longText('observacoes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_id', 'status'], 'ps_vet_int_emp_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_internacoes');
    }
};
