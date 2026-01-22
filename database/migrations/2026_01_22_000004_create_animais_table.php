<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animais', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('especie_id')->nullable()->constrained('animais_especies');
            $table->foreignId('raca_id')->nullable()->constrained('animais_racas');
            $table->foreignId('pelagem_id')->nullable()->constrained('animais_pelagens');

            $table->string('nome', 120);
            $table->string('cor', 80)->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('peso', 20)->nullable();
            $table->string('sexo', 20)->nullable();
            $table->text('observacao')->nullable();
            $table->integer('idade')->nullable();
            $table->string('chip', 60)->nullable();
            $table->boolean('tem_pedigree')->default(false);
            $table->string('pedigree', 120)->nullable();
            $table->string('porte', 40)->nullable();
            $table->string('origem', 80)->nullable();

            $table->timestamps();

            $table->index(['empresa_id', 'cliente_id'], 'animais_empresa_cliente_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animais');
    }
};
