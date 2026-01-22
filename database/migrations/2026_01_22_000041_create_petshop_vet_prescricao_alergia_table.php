<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prescricao_alergia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescricao_id')->constrained('petshop_vet_prescricoes')->cascadeOnDelete();
            $table->foreignId('alergia_id')->constrained('petshop_vet_alergias')->cascadeOnDelete();
            $table->timestamps();
            // MySQL identifier limit (64 chars) - use a short explicit name.
            $table->unique(['prescricao_id', 'alergia_id'], 'ps_presc_alerg_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prescricao_alergia');
    }
};
