<?php

namespace App\Services\Petshop;

use App\Models\Petshop\Hotel;
use App\Models\Petshop\HotelClienteEndereco;
use Illuminate\Support\Facades\Log;

class HotelService
{
    public function updateOrCreateHotelClienteEndereco(int $hotelId, array $data): void
    {
        HotelClienteEndereco::query()->updateOrCreate(
            ['hotel_id' => $hotelId],
            $data
        );
    }

    public function updateValorTotal(int $hotelId): void
    {
        $hotel = Hotel::with(['servicos', 'produtos', 'ordemServico'])->find($hotelId);
        if (! $hotel) {
            return;
        }

        $totalServicos = (float) $hotel->servicos->sum(function ($servico) {
            return (float) ($servico->pivot->valor_servico ?? 0);
        });

        $totalProdutos = (float) $hotel->produtos->sum(function ($produto) {
            return ((float) ($produto->valor_unitario ?? 0)) * ((float) ($produto->pivot->quantidade ?? 0));
        });

        $total = $totalServicos + $totalProdutos;

        $hotel->update(['valor' => $total]);

        if ($hotel->ordemServico) {
            $hotel->ordemServico->update(['valor' => $total]);
        }
    }

    public function updateContaReceberDataVencimento(int $hotelId): void
    {
        // No-op (ver EsteticaService::updateContaReceberDataVencimento).
        Log::debug('[HotelService] updateContaReceberDataVencimento noop', ['hotel_id' => $hotelId]);
    }
}

