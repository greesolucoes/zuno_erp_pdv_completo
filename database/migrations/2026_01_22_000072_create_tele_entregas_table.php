<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tele_entregas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('tipo_id')->nullable()->constrained('tipos_tele_entregas');
            $table->dateTime('datahora_entrega')->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->string('status', 20)->default('pendente');
            $table->text('observacao')->nullable();

            $table->string('rua', 100)->nullable();
            $table->string('numero', 20)->nullable();
            $table->string('cep', 9)->nullable();
            $table->string('bairro', 60)->nullable();
            $table->foreignId('cidade_id')->nullable()->constrained('cidades');
            $table->string('complemento', 80)->nullable();

            $table->string('motorista_nome', 120)->nullable();
            $table->boolean('foi_pago')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tele_entregas');
    }
};

