<?php

namespace App\Services\Petshop;

use App\Models\Petshop\Plano;
use App\Models\Petshop\PlanoProduto;
use App\Models\Petshop\PlanoServico;
use App\Models\Petshop\PlanoVersao;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PlanoService
{
    public function paginate(?string $pesquisa = null): LengthAwarePaginator
    {
        $empresaId = request()->empresa_id;

        return Plano::query()
            ->where('empresa_id', $empresaId)
            ->when($pesquisa, function ($q) use ($pesquisa) {
                $q->where(function ($sub) use ($pesquisa) {
                    $sub->where('nome', 'like', "%{$pesquisa}%")
                        ->orWhere('slug', 'like', "%{$pesquisa}%");
                });
            })
            ->orderByDesc('id')
            ->paginate((int) env('PAGINACAO', 15))
            ->appends(['pesquisa' => $pesquisa]);
    }

    public function create(array $data): Plano
    {
        return DB::transaction(function () use ($data) {
            $versoes = $data['versoes'] ?? [];
            unset($data['versoes']);

            /** @var Plano $plano */
            $plano = Plano::create($data);

            $this->syncVersoes($plano, $versoes);

            return $plano;
        });
    }

    public function update(Plano $plano, array $data): Plano
    {
        return DB::transaction(function () use ($plano, $data) {
            $versoes = $data['versoes'] ?? [];
            unset($data['versoes']);

            $plano->update($data);
            $this->syncVersoes($plano, $versoes, true);

            return $plano;
        });
    }

    public function delete(Plano $plano): void
    {
        DB::transaction(function () use ($plano) {
            $plano->versoes()->delete();
            $plano->delete();
        });
    }

    private function syncVersoes(Plano $plano, array $versoes, bool $replace = false): void
    {
        if ($replace) {
            $plano->versoes()->delete();
        }

        foreach ($versoes as $versaoData) {
            $servicos = $versaoData['servicos'] ?? [];
            $produtos = $versaoData['produtos'] ?? [];

            unset($versaoData['servicos'], $versaoData['produtos']);

            /** @var PlanoVersao $versao */
            $versao = $plano->versoes()->create($versaoData);

            foreach ($servicos as $servicoData) {
                $versao->servicos()->create($servicoData);
            }

            foreach ($produtos as $produtoData) {
                $versao->produtos()->create($produtoData);
            }
        }
    }
}

