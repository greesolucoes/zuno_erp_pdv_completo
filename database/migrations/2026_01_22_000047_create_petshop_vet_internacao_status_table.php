<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_internacao_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('internacao_id')->constrained('petshop_vet_internacoes')->cascadeOnDelete();
            $table->string('status', 40)->nullable();
            $table->text('anotacao')->nullable();
            $table->string('evolucao', 20)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_internacao_status');
    }
};

