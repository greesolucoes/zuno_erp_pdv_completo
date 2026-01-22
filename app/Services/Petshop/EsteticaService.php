<?php

namespace App\Services\Petshop;

use App\Models\OrdemServico;
use App\Models\Petshop\Estetica;
use App\Models\Petshop\EsteticaClienteEndereco;
use App\Models\ProdutoOs;
use App\Models\ServicoOs;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EsteticaService
{
    public function updateOrCreateEsteticaClienteEndereco(int $esteticaId, array $data): void
    {
        EsteticaClienteEndereco::query()->updateOrCreate(
            ['estetica_id' => $esteticaId],
            $data
        );
    }

    public function criarOrdemServico(Estetica $estetica): bool
    {
        try {
            $estetica->loadMissing(['servicos', 'produtos', 'animal']);

            $empresaId = $estetica->empresa_id;
            $clienteId = $estetica->cliente_id;

            $inicio = $estetica->data_agendamento
                ? Carbon::parse($estetica->data_agendamento)->setTimeFromTimeString((string) $estetica->horario_agendamento)
                : now();

            $duracao = (int) $estetica->servicos->sum(function ($item) {
                return (int) ($item->servico->tempo_execucao ?? 0);
            });

            $fim = $inicio->copy()->addMinutes(max($duracao, 0));

            $valorServicos = (float) $estetica->servicos->sum(fn ($s) => (float) ($s->subtotal ?? 0));
            $valorProdutos = (float) $estetica->produtos->sum(fn ($p) => (float) ($p->subtotal ?? 0));
            $valorTotal = $valorServicos + $valorProdutos;

            $ordem = $estetica->ordemServico;
            if (! $ordem) {
                $codigoSequencial = (OrdemServico::where('empresa_id', $empresaId)->max('codigo_sequencial') ?? 0) + 1;

                $ordem = OrdemServico::create([
                    'descricao' => 'Ordem de Serviço Estetica',
                    'cliente_id' => $clienteId,
                    'empresa_id' => $empresaId,
                    'funcionario_id' => $estetica->colaborador_id,
                    'animal_id' => $estetica->animal_id,
                    'estetica_id' => $estetica->id,
                    'usuario_id' => Auth::id(),
                    'codigo_sequencial' => $codigoSequencial,
                    'valor' => $valorTotal,
                    'total_sem_desconto' => $valorTotal,
                    'data_inicio' => $inicio,
                    'data_entrega' => $fim,
                    'estado' => 'AG',
                ]);

                $estetica->update(['ordem_servico_id' => $ordem->id]);
            } else {
                $ordem->update([
                    'cliente_id' => $clienteId,
                    'empresa_id' => $empresaId,
                    'funcionario_id' => $estetica->colaborador_id,
                    'animal_id' => $estetica->animal_id,
                    'valor' => $valorTotal,
                    'total_sem_desconto' => $valorTotal,
                    'data_inicio' => $inicio,
                    'data_entrega' => $fim,
                ]);
            }

            ServicoOs::where('ordem_servico_id', $ordem->id)->delete();
            ProdutoOs::where('ordem_servico_id', $ordem->id)->delete();

            foreach ($estetica->servicos as $servico) {
                ServicoOs::create([
                    'ordem_servico_id' => $ordem->id,
                    'servico_id' => $servico->servico_id,
                    'quantidade' => 1,
                    'valor' => $servico->subtotal,
                    'subtotal' => $servico->subtotal,
                    'desconto' => 0,
                ]);
            }

            foreach ($estetica->produtos as $produto) {
                ProdutoOs::create([
                    'ordem_servico_id' => $ordem->id,
                    'produto_id' => $produto->produto_id,
                    'quantidade' => $produto->quantidade,
                    'valor' => $produto->valor,
                    'subtotal' => $produto->subtotal,
                    'desconto' => 0,
                ]);
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('[EsteticaService] Falha ao criar OS.', [
                'estetica_id' => $estetica->id ?? null,
                'exception' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function aprovar(Estetica $estetica): bool
    {
        $estetica->estado = 'agendado';
        $estetica->save();

        return $this->criarOrdemServico($estetica);
    }

    public function rejeitar(Estetica $estetica): bool
    {
        $estetica->estado = 'rejeitado';
        $estetica->save();

        return true;
    }

    public function updateValorTotal(int $esteticaId): void
    {
        $estetica = Estetica::with(['servicos', 'produtos'])->find($esteticaId);
        if (! $estetica) {
            return;
        }

        $valorServicos = (float) $estetica->servicos->sum(fn ($s) => (float) ($s->subtotal ?? 0));
        $valorProdutos = (float) $estetica->produtos->sum(fn ($p) => (float) ($p->subtotal ?? 0));
        $estetica->forceFill(['valor' => $valorServicos + $valorProdutos])->save();
    }

    public function updateContaReceberDataVencimento(int $esteticaId): void
    {
        // Este projeto não possui um vínculo claro/compatível entre Petshop e ContaReceber.
        // Mantém-se como no-op para evitar falhas quando o módulo estiver sendo integrado.
    }
}
