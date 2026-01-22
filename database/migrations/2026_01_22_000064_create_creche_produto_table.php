<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creche_produto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creche_id')->constrained('creches')->cascadeOnDelete();
            $table->foreignId('produto_id')->nullable()->constrained('produtos');
            $table->decimal('quantidade', 12, 3)->default(1);
            $table->timestamps();

            $table->index(['creche_id', 'produto_id'], 'creche_produto_creche_produto_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creche_produto');
    }
};
