<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vacinacao_sessao_doses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sessao_id')->constrained('petshop_vacinacao_sessoes')->cascadeOnDelete();
            $table->foreignId('dose_planejada_id')->nullable()->constrained('petshop_vacinacao_doses')->nullOnDelete();
            $table->dateTime('aplicada_em')->nullable();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('lote_id')->nullable();
            $table->decimal('quantidade_ml', 10, 2)->nullable();
            $table->string('via_aplicacao', 80)->nullable();
            $table->string('local_anatomico', 80)->nullable();
            $table->decimal('temperatura_pet', 10, 1)->nullable();
            $table->text('observacoes')->nullable();
            $table->string('resultado', 40)->nullable();
            $table->text('motivo_nao_aplicacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vacinacao_sessao_doses');
    }
};

