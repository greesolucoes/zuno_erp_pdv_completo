<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vacinacao_sessoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacinacao_id')->constrained('petshop_vacinacoes')->cascadeOnDelete();
            $table->string('session_code', 80)->nullable();
            $table->dateTime('inicio_execucao_at')->nullable();
            $table->dateTime('termino_execucao_at')->nullable();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('assistentes_ids')->nullable();
            $table->string('status', 40)->default('em_execucao');
            $table->longText('observacoes_execucao')->nullable();
            $table->string('assinatura_tutor_path', 255)->nullable();
            $table->timestamps();

            $table->index(['vacinacao_id', 'status'], 'ps_vac_sess_vac_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vacinacao_sessoes');
    }
};
