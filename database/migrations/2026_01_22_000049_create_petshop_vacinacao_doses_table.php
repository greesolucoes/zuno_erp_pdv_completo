<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vacinacao_doses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacinacao_id')->constrained('petshop_vacinacoes')->cascadeOnDelete();
            $table->foreignId('vacina_id')->nullable()->constrained('petshop_vet_vacinas')->nullOnDelete();
            $table->integer('dose_ordem')->default(1);

            $table->string('fabricante', 120)->nullable();
            $table->string('lote', 120)->nullable();
            $table->date('validade')->nullable();
            $table->string('dose', 80)->nullable();
            $table->string('via_administracao', 80)->nullable();
            $table->string('local_anatomico', 80)->nullable();
            $table->string('volume', 80)->nullable();
            $table->text('observacoes')->nullable();

            $table->decimal('dose_prevista_ml', 10, 2)->nullable();
            $table->string('via_aplicacao_prevista', 80)->nullable();
            $table->integer('reforco_intervalo_dias')->nullable();
            $table->json('alertas')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vacinacao_doses');
    }
};

