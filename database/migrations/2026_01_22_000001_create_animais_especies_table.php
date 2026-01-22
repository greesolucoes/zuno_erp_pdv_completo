<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animais_especies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->string('nome', 120);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animais_especies');
    }
};

