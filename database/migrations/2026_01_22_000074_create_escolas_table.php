<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escolas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('colaborador_id')->nullable()->constrained('funcionarios');
            $table->foreignId('sala_de_aula_id')->nullable()->constrained('sala_de_aulas');
            $table->foreignId('pedido_id')->nullable()->constrained('pedidos')->nullOnDelete();
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->text('descricao')->nullable();
            $table->dateTime('checkin')->nullable();
            $table->dateTime('checkout')->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->string('estado', 40)->default('agendado');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escolas');
    }
};

