<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_medicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('funcionario_id')->nullable()->constrained('funcionarios');
            $table->string('crmv', 40)->nullable();
            $table->string('especialidade', 120)->nullable();
            $table->string('telefone', 30)->nullable();
            $table->string('email', 120)->nullable();
            $table->text('observacoes')->nullable();
            $table->string('status', 20)->default('ativo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_medicos');
    }
};

