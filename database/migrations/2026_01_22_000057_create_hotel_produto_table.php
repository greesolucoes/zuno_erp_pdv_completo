<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_produto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hoteis')->cascadeOnDelete();
            $table->foreignId('produto_id')->nullable()->constrained('produtos');
            $table->decimal('quantidade', 12, 3)->default(1);
            $table->timestamps();

            $table->index(['hotel_id', 'produto_id'], 'hotel_produto_hotel_produto_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_produto');
    }
};
