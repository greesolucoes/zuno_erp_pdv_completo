<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estetica_servicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estetica_id')->constrained('esteticas')->cascadeOnDelete();
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['estetica_id', 'servico_id'], 'estetica_servicos_estetica_servico_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estetica_servicos');
    }
};
