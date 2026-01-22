<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creches_clientes_enderecos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creche_id')->constrained('creches')->cascadeOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('cidade_id')->nullable()->constrained('cidades');
            $table->string('cep', 9)->nullable();
            $table->string('rua', 100)->nullable();
            $table->string('bairro', 60)->nullable();
            $table->string('numero', 20)->nullable();
            $table->string('complemento', 80)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creches_clientes_enderecos');
    }
};

