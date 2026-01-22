<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vacinacao_eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacinacao_id')->constrained('petshop_vacinacoes')->cascadeOnDelete();
            $table->string('tipo', 80);
            $table->json('payload')->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('registrado_em')->nullable();
            $table->timestamps();

            $table->index(['vacinacao_id', 'tipo'], 'ps_vac_evt_vac_tipo_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vacinacao_eventos');
    }
};
