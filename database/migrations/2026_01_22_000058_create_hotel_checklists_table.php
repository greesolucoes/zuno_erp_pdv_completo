<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hoteis')->cascadeOnDelete();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->string('tipo', 60)->nullable();
            $table->json('checklist')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_checklists');
    }
};

