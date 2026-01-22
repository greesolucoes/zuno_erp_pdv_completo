<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_prescricao_condicao_cronica', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prescricao_id');
            $table->unsignedBigInteger('condicao_cronica_id');
            $table->timestamps();

            // MySQL identifier limit (64 chars) - use short explicit names.
            $table->foreign('prescricao_id', 'ps_presc_cond_presc_fk')
                ->references('id')
                ->on('petshop_vet_prescricoes')
                ->cascadeOnDelete();
            $table->foreign('condicao_cronica_id', 'ps_presc_cond_cond_fk')
                ->references('id')
                ->on('petshop_vet_condicoes_cronicas')
                ->cascadeOnDelete();

            $table->unique(['prescricao_id', 'condicao_cronica_id'], 'ps_presc_cond_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_prescricao_condicao_cronica');
    }
};
