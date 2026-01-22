<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petshop_vet_atendimento_faturamento_servicos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('faturamento_id');
            $table->foreignId('empresa_id')->nullable()->constrained('empresas');
            $table->foreignId('servico_id')->nullable()->constrained('servicos');
            $table->string('nome_servico', 180)->nullable();
            $table->string('categoria_servico', 180)->nullable();
            $table->date('data_servico')->nullable();
            $table->string('hora_servico', 10)->nullable();
            $table->decimal('valor', 10, 2)->default(0);
            $table->timestamps();

            // MySQL identifier limit (64 chars) - use short explicit FK names.
            $table->foreign('faturamento_id', 'ps_vet_fat_serv_fat_fk')
                ->references('id')
                ->on('petshop_vet_atendimento_faturamentos')
                ->cascadeOnDelete();

            $table->index(['faturamento_id', 'servico_id'], 'ps_vet_fat_serv_fat_serv_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petshop_vet_atendimento_faturamento_servicos');
    }
};
