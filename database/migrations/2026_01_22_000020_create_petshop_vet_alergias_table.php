<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_alergias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->string('nome', 150);
            $table->text('descricao')->nullable();
            $table->text('orientacoes')->nullable();
            $table->string('status', 20)->default('ativo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_alergias');
    }
};

