<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turmas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('colaborador_id')->nullable()->constrained('funcionarios');
            $table->string('nome', 150);
            $table->text('descricao')->nullable();
            $table->string('tipo', 80)->nullable();
            $table->integer('capacidade')->default(1);
            $table->string('status', 30)->default('disponivel');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turmas');
    }
};

