<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_exame_anexos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exame_id')->constrained('petshop_vet_exames')->cascadeOnDelete();
            $table->string('context', 30)->default('request');
            $table->string('name', 255);
            $table->string('path', 255);
            $table->string('url', 255)->nullable();
            $table->string('extension', 20)->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('size_in_bytes')->nullable();
            $table->dateTime('uploaded_at')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_exame_anexos');
    }
};

