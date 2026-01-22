<?php

namespace App\Services\Petshop;

use App\Models\Petshop\Creche;
use App\Models\Petshop\CrecheClienteEndereco;
use Illuminate\Support\Facades\Log;

class CrecheService
{
    public function updateOrCreateCrecheClienteEndereco(int $crecheId, array $data): void
    {
        CrecheClienteEndereco::query()->updateOrCreate(
            ['creche_id' => $crecheId],
            $data
        );
    }

    public function updateValorTotal(int $crecheId): void
    {
        $creche = Creche::with(['servicos', 'produtos', 'ordemServico'])->find($crecheId);
        if (! $creche) {
            return;
        }

        $totalServicos = (float) $creche->servicos->sum(function ($servico) {
            return (float) ($servico->pivot->valor_servico ?? 0);
        });

        $totalProdutos = (float) $creche->produtos->sum(function ($produto) {
            return ((float) ($produto->valor_unitario ?? 0)) * ((float) ($produto->pivot->quantidade ?? 0));
        });

        $total = $totalServicos + $totalProdutos;

        $creche->update(['valor' => $total]);

        if ($creche->ordemServico) {
            $creche->ordemServico->update(['valor' => $total]);
        }
    }

    public function updateContaReceberDataVencimento(int $crecheId): void
    {
        // No-op (ver EsteticaService::updateContaReceberDataVencimento).
        Log::debug('[CrecheService] updateContaReceberDataVencimento noop', ['creche_id' => $crecheId]);
    }
}

