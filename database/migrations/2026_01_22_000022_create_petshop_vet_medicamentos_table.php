<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_medicamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('produto_id')->nullable()->constrained('produtos');

            $table->string('nome_comercial', 180)->nullable();
            $table->string('nome_generico', 180)->nullable();
            $table->string('classe_terapeutica', 180)->nullable();
            $table->string('classe_farmacologica', 180)->nullable();
            $table->string('classificacao_controle', 180)->nullable();
            $table->string('via_administracao', 180)->nullable();
            $table->string('apresentacao', 180)->nullable();
            $table->string('concentracao', 180)->nullable();
            $table->string('forma_dispensacao', 180)->nullable();
            $table->string('dosagem', 180)->nullable();
            $table->string('frequencia', 180)->nullable();
            $table->string('duracao', 180)->nullable();
            $table->string('restricao_idade', 180)->nullable();
            $table->string('condicao_armazenamento', 180)->nullable();
            $table->date('validade')->nullable();
            $table->string('fornecedor', 180)->nullable();
            $table->string('sku', 80)->nullable();

            $table->longText('indicacoes')->nullable();
            $table->longText('contraindicacoes')->nullable();
            $table->longText('efeitos_adversos')->nullable();
            $table->longText('interacoes')->nullable();
            $table->longText('monitoramento')->nullable();
            $table->longText('orientacoes_tutor')->nullable();
            $table->longText('observacoes')->nullable();

            $table->string('status', 20)->default('ativo');

            $table->timestamps();

            $table->index(['empresa_id', 'produto_id'], 'ps_vet_medic_emp_prod_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_medicamentos');
    }
};
