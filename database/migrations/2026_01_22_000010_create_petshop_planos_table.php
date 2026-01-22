<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_planos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('local_id')->nullable()->constrained('localizacaos');

            $table->string('slug', 100);
            $table->string('nome', 150);
            $table->text('descricao')->nullable();
            $table->boolean('ativo')->default(true);

            $table->string('periodo', 20);
            $table->string('frequencia_tipo', 20);
            $table->integer('frequencia_qtd')->nullable();

            $table->decimal('preco_plano', 10, 2)->default(0);
            $table->string('multa_noshow_tipo', 20)->nullable();
            $table->decimal('multa_noshow_valor', 10, 2)->default(0);
            $table->string('bloquear_por_inadimplencia', 10)->default('nao');
            $table->integer('dias_tolerancia_atraso')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['empresa_id', 'slug'], 'petshop_planos_empresa_slug_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_planos');
    }
};
