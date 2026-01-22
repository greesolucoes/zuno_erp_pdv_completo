<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creche_servico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creche_id')->constrained('creches')->cascadeOnDelete();
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->date('data_servico')->nullable();
            $table->time('hora_servico')->nullable();
            $table->decimal('valor_servico', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['creche_id', 'servico_id'], 'creche_servico_creche_servico_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creche_servico');
    }
};
