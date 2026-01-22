<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prontuario_evolucoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prontuario_id')->constrained('petshop_vet_prontuarios')->cascadeOnDelete();
            $table->string('categoria', 80)->nullable();
            $table->string('titulo', 180)->nullable();
            $table->longText('descricao')->nullable();
            $table->dateTime('registrado_em')->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->json('dados')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prontuario_evolucoes');
    }
};

