<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_plano_versoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plano_id')->constrained('petshop_planos')->cascadeOnDelete();
            $table->date('vigente_desde');
            $table->date('vigente_ate')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_plano_versoes');
    }
};

