<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prescricao_medicamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescricao_id')->constrained('petshop_vet_prescricoes')->cascadeOnDelete();
            $table->foreignId('medicamento_id')->nullable()->constrained('petshop_vet_medicamentos')->nullOnDelete();
            $table->string('nome', 180)->nullable();
            $table->string('dosagem', 120)->nullable();
            $table->string('frequencia', 120)->nullable();
            $table->string('duracao', 120)->nullable();
            $table->string('via', 120)->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['prescricao_id', 'medicamento_id'], 'ps_vet_presc_med_presc_medic_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prescricao_medicamentos');
    }
};
