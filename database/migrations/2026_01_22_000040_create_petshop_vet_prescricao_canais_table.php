<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prescricao_canais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescricao_id')->constrained('petshop_vet_prescricoes')->cascadeOnDelete();
            $table->string('canal', 40);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prescricao_canais');
    }
};

