<?php

namespace App\Services\Petshop;

use App\Models\Petshop\Assinatura;
use App\Models\Petshop\ConsumoServico;
use App\Models\Petshop\PlanoVersao;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PlanoLimiteService
{
    public function podeUsarServico($planoUser, int $servicoId): bool
    {
        try {
            $clienteId = $planoUser->cliente_id ?? null;
            $planoId = $planoUser->plano_id ?? ($planoUser->plano->id ?? null);

            if (! $clienteId || ! $planoId) {
                return true;
            }

            $assinatura = Assinatura::query()
                ->where('cliente_id', $clienteId)
                ->where('plano_id', $planoId)
                ->orderByDesc('started_at')
                ->first();

            if (! $assinatura) {
                return true;
            }

            $plano = $assinatura->plano;
            if (! $plano || ($plano->frequencia_tipo ?? null) !== 'limitado') {
                return true;
            }

            $versao = $assinatura->versao;
            if (! $versao) {
                $versao = PlanoVersao::query()
                    ->where('plano_id', $planoId)
                    ->whereDate('vigente_desde', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('vigente_ate')->orWhereDate('vigente_ate', '>=', now());
                    })
                    ->orderByDesc('vigente_desde')
                    ->first();
            }

            if (! $versao) {
                return true;
            }

            $planoServico = $versao->servicos()
                ->where('servico_id', $servicoId)
                ->first();

            $limitePorCiclo = (int) ($planoServico->qtd_por_ciclo ?? 0);
            if ($limitePorCiclo <= 0) {
                return true;
            }

            [$inicio, $fim] = $this->getCicloAtual($plano->periodo ?? 'mes');

            $usado = (int) ConsumoServico::query()
                ->where('assinatura_id', $assinatura->id)
                ->where('servico_id', $servicoId)
                ->where('ciclo_inicio', $inicio)
                ->where('ciclo_fim', $fim)
                ->sum('quantidade_usada');

            return $usado < $limitePorCiclo;
        } catch (\Throwable $e) {
            Log::warning('[PlanoLimiteService] Falha ao validar limite, liberando por fallback.', [
                'servico_id' => $servicoId,
                'exception' => $e->getMessage(),
            ]);
            return true;
        }
    }

    public function registrarUsoServico($planoUser, int $servicoId, int $quantidade = 1, array $meta = []): void
    {
        try {
            $clienteId = $planoUser->cliente_id ?? null;
            $planoId = $planoUser->plano_id ?? ($planoUser->plano->id ?? null);

            if (! $clienteId || ! $planoId) {
                return;
            }

            $assinatura = Assinatura::query()
                ->where('cliente_id', $clienteId)
                ->where('plano_id', $planoId)
                ->orderByDesc('started_at')
                ->first();

            if (! $assinatura) {
                return;
            }

            $plano = $assinatura->plano;
            if (! $plano) {
                return;
            }

            [$inicio, $fim] = $this->getCicloAtual($plano->periodo ?? 'mes');

            ConsumoServico::query()->updateOrCreate(
                [
                    'assinatura_id' => $assinatura->id,
                    'servico_id' => $servicoId,
                    'ciclo_inicio' => $inicio,
                    'ciclo_fim' => $fim,
                ],
                [
                    'quantidade_usada' => (int) \DB::raw('COALESCE(quantidade_usada, 0) + ' . (int) $quantidade),
                    'used_at' => now(),
                    'meta' => $meta,
                ]
            );
        } catch (\Throwable $e) {
            Log::warning('[PlanoLimiteService] Falha ao registrar consumo.', [
                'servico_id' => $servicoId,
                'exception' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function getCicloAtual(string $periodo): array
    {
        $periodo = strtolower(trim($periodo));
        $now = now();

        return match ($periodo) {
            'dia' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'semana' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'ano' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            default => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
        };
    }
}

