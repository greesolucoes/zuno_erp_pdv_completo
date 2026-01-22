<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_assinaturas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cliente_id')->nullable()->constrained('clientes');
            $table->foreignId('plano_id')->nullable()->constrained('petshop_planos');
            $table->foreignId('plano_versao_id')->nullable()->constrained('petshop_plano_versoes');

            $table->string('status', 40)->default('ativa');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('trial_end')->nullable();
            $table->dateTime('cancel_at')->nullable();
            $table->dateTime('canceled_at')->nullable();
            $table->string('billing_interval', 20)->nullable();
            $table->integer('interval_count')->default(1);
            $table->string('currency', 10)->default('BRL');
            $table->decimal('amount', 10, 2)->default(0);
            $table->dateTime('next_renewal_at')->nullable();
            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['cliente_id', 'plano_id'], 'petshop_assin_cliente_plano_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_assinaturas');
    }
};
