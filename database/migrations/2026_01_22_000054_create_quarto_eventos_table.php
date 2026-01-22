<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quarto_eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quarto_id')->constrained('quartos')->cascadeOnDelete();
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->foreignId('prestador_id')->nullable()->constrained('funcionarios');
            $table->foreignId('fornecedor_id')->nullable()->constrained('fornecedors');
            $table->dateTime('inicio')->nullable();
            $table->dateTime('fim')->nullable();
            $table->text('descricao')->nullable();
            $table->timestamps();

            $table->index(['quarto_id', 'inicio'], 'quarto_evt_quarto_inicio_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quarto_eventos');
    }
};
