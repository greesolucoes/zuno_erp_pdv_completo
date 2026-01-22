<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animais_consultas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('animal_id')->nullable()->constrained('animais');
            $table->foreignId('diagnostico_id')->nullable()->constrained('animais_diagnosticos');
            $table->foreignId('exame_id')->nullable()->constrained('animais_exames');

            $table->dateTime('datahora_consulta')->nullable();
            $table->string('status', 40)->default('pendente');
            $table->text('observacao')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['empresa_id', 'animal_id'], 'animais_consultas_empresa_animal_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animais_consultas');
    }
};
