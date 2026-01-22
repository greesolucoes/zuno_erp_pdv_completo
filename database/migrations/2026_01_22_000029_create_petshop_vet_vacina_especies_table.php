<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_vacina_especies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacina_id')->constrained('petshop_vet_vacinas')->cascadeOnDelete();
            $table->foreignId('especie_id')->constrained('animais_especies')->cascadeOnDelete();
            $table->timestamps();

            // MySQL identifier limit (64 chars) - use a short explicit name.
            $table->unique(['vacina_id', 'especie_id'], 'ps_vac_especie_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_vacina_especies');
    }
};
