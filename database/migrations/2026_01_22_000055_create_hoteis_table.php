<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hoteis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('quarto_id')->nullable()->constrained('quartos');
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->foreignId('colaborador_id')->nullable()->constrained('funcionarios');
            $table->foreignId('plano_id')->nullable()->constrained('petshop_planos')->nullOnDelete();
            $table->foreignId('ordem_servico_id')->nullable()->constrained('ordem_servicos')->nullOnDelete();

            $table->integer('diarias')->default(1);
            $table->text('descricao')->nullable();
            $table->dateTime('checkin')->nullable();
            $table->dateTime('checkout')->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->string('estado', 40)->default('agendado');
            $table->boolean('situacao_checklist')->default(false);

            $table->timestamps();

            $table->index(['empresa_id', 'quarto_id'], 'hoteis_empresa_quarto_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hoteis');
    }
};
