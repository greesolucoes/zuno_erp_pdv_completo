<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_vacinas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('produto_id')->nullable()->constrained('produtos');

            $table->string('codigo', 60)->nullable();
            $table->string('nome', 180);
            $table->string('status', 30)->default('ativa');
            $table->string('grupo_vacinal', 80)->nullable();
            $table->string('categoria', 80)->nullable();
            $table->string('fabricante', 80)->nullable();
            $table->string('registro_mapa', 80)->nullable();
            $table->string('apresentacao', 80)->nullable();
            $table->string('concentracao', 80)->nullable();
            $table->string('idade_minima', 80)->nullable();
            $table->string('intervalo_reforco', 80)->nullable();
            $table->string('dosagem', 80)->nullable();
            $table->string('via_administracao', 80)->nullable();
            $table->string('local_aplicacao', 80)->nullable();

            $table->text('coberturas')->nullable();
            $table->text('protocolo_inicial')->nullable();
            $table->text('protocolo_reforco')->nullable();
            $table->text('protocolo_revacinar')->nullable();
            $table->text('requisitos_pre_vacinacao')->nullable();
            $table->text('orientacoes_pos_vacinacao')->nullable();
            $table->text('efeitos_adversos')->nullable();
            $table->text('contraindicacoes')->nullable();

            $table->string('validade_fechada', 80)->nullable();
            $table->string('validade_aberta', 80)->nullable();
            $table->string('condicao_armazenamento', 120)->nullable();
            $table->string('temperatura_armazenamento', 80)->nullable();
            $table->text('alertas_armazenamento')->nullable();
            $table->integer('limite_perdas')->nullable();
            $table->integer('tempo_reposicao')->nullable();
            $table->json('documentos')->nullable();
            $table->json('tags')->nullable();
            $table->text('observacoes')->nullable();

            $table->timestamps();

            $table->index(['empresa_id', 'produto_id'], 'ps_vet_vac_emp_prod_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_vacinas');
    }
};
