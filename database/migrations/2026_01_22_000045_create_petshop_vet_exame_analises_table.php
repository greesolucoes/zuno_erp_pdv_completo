<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_exame_analises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exame_id')->constrained('petshop_vet_exames')->cascadeOnDelete();
            $table->foreignId('attachment_id')->nullable()->constrained('petshop_vet_exame_anexos')->nullOnDelete();
            $table->json('tool_state')->nullable();
            $table->json('viewport_state')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_exame_analises');
    }
};

