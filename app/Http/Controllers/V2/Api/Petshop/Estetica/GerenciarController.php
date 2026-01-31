<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api\Petshop\Estetica;

use App\Http\Controllers\Controller;
use App\Models\Funcionario;
use App\Models\OrdemServico;
use App\Models\Petshop\Animal;
use App\Models\Petshop\Estetica;
use App\Models\Petshop\EsteticaProduto;
use App\Models\Petshop\EsteticaServico;
use App\Models\Produto;
use App\Models\ProdutoOs;
use App\Models\Servico;
use App\Models\ServicoOs;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class GerenciarController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Estetica::query()
            ->where('empresa_id', $empresaId)
            ->whereIn('estado', ['agendado', 'em_andamento', 'concluido', 'cancelado'])
            ->with([
                'animal.cliente',
                'colaborador',
                'servicos.servico',
                'produtos.produto',
                'ordemServico',
            ])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($sub) use ($busca) {
                    $sub->whereHas('animal', fn ($qa) => $qa->where('nome', 'like', "%{$busca}%"))
                        ->orWhereHas('cliente', fn ($qc) => $qc->where('nome_fantasia', 'like', "%{$busca}%"))
                        ->orWhere('estado', 'like', "%{$busca}%");
                });
            })
            ->orderByDesc('created_at');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Estetica $e) => $this->toV2Payload($e))->values(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function options()
    {
        $empresaId = $this->getEmpresaId();

        $pets = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->orderBy('nome')
            ->get(['id', 'nome', 'cliente_id', 'especie_id', 'raca_id', 'pelagem_id', 'porte', 'observacao'])
            ->map(function (Animal $a) {
                return [
                    'id' => (string) $a->id,
                    'label' => (string) ($a->nome ?? ''),
                    'cliente_id' => (string) ($a->cliente_id ?? ''),
                    'cliente_nome' => (string) ($a->cliente?->razao_social ?? $a->cliente?->nome_fantasia ?? ''),
                    'animal_info' => json_encode([
                        'especie_id' => (string) ($a->especie_id ?? ''),
                        'raca_id' => (string) ($a->raca_id ?? ''),
                        'pelagem_id' => (string) ($a->pelagem_id ?? ''),
                        'porte' => (string) ($a->porte ?? ''),
                        'observacao' => (string) ($a->observacao ?? ''),
                    ], JSON_UNESCAPED_UNICODE),
                ];
            })
            ->values();

        $colaboradores = Funcionario::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (Funcionario $f) => ['id' => (string) $f->id, 'label' => (string) ($f->nome ?? '')])
            ->values();

        $servicos = Servico::query()
            ->where('empresa_id', $empresaId)
            ->whereHas('categoria', fn ($q) => $q->where('nome', 'ESTETICA'))
            ->orderBy('nome')
            ->get(['id', 'nome', 'tempo_execucao', 'valor'])
            ->map(fn (Servico $s) => [
                'id' => (string) $s->id,
                'label' => (string) ($s->nome ?? ''),
                'tempo_execucao' => (string) ($s->tempo_execucao ?? ''),
                'valor' => $this->formatMoneyBr((float) ($s->valor ?? 0)),
            ])
            ->values();

        $produtos = Produto::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome', 'valor_unitario'])
            ->map(fn (Produto $p) => [
                'id' => (string) $p->id,
                'label' => (string) ($p->nome ?? ''),
                'valor_unitario' => $this->formatMoneyBr((float) ($p->valor_unitario ?? 0)),
            ])
            ->values();

        return response()->json([
            'pets' => $pets,
            'colaboradores' => $colaboradores,
            'estados' => [
                ['value' => 'agendado', 'label' => 'Agendado'],
                ['value' => 'em_andamento', 'label' => 'Em andamento'],
                ['value' => 'concluido', 'label' => 'Concluído'],
                ['value' => 'cancelado', 'label' => 'Cancelado'],
            ],
            'servicos' => $servicos,
            'produtos' => $produtos,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $e = Estetica::query()
            ->where('empresa_id', $empresaId)
            ->with([
                'animal.cliente',
                'colaborador',
                'servicos.servico',
                'produtos.produto',
                'ordemServico',
            ])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($e));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $animalId = (int) $validated['animal_id'];
        $colaboradorId = (int) $validated['colaborador_id'];

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->findOrFail($animalId);

        try {
            DB::beginTransaction();

            $e = Estetica::create([
                'empresa_id' => $empresaId,
                'animal_id' => $animal->id,
                'cliente_id' => $animal->cliente_id,
                'colaborador_id' => $colaboradorId ?: null,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'data_agendamento' => $this->parseDateBrToYmd((string) $validated['data_agendamento']),
                'horario_agendamento' => $this->normalizeTime((string) $validated['horario_agendamento']),
                'horario_saida' => $this->normalizeTime((string) $validated['horario_saida']),
                'estado' => $this->normalizeEstado((string) ($validated['estado'] ?? 'agendado')),
            ]);

            $this->syncServicos($e, $validated['servicos'] ?? []);
            $this->syncProdutos($e, $validated['produtos'] ?? []);

            $this->syncOrdemServico($e);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar o agendamento de estética.'], 422);
        }

        return response()->json(['id' => (string) $e->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $e = Estetica::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal', 'servicos', 'produtos', 'ordemServico'])
            ->findOrFail($id);

        $animalId = (int) $validated['animal_id'];
        $colaboradorId = (int) $validated['colaborador_id'];

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->findOrFail($animalId);

        try {
            DB::beginTransaction();

            $e->update([
                'animal_id' => $animal->id,
                'cliente_id' => $animal->cliente_id,
                'colaborador_id' => $colaboradorId ?: null,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'data_agendamento' => $this->parseDateBrToYmd((string) $validated['data_agendamento']),
                'horario_agendamento' => $this->normalizeTime((string) $validated['horario_agendamento']),
                'horario_saida' => $this->normalizeTime((string) $validated['horario_saida']),
                'estado' => $this->normalizeEstado((string) ($validated['estado'] ?? $e->estado ?? 'agendado')),
            ]);

            $this->syncServicos($e, $validated['servicos'] ?? []);
            $this->syncProdutos($e, $validated['produtos'] ?? []);

            $this->syncOrdemServico($e);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o agendamento de estética.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $e = Estetica::query()
            ->where('empresa_id', $empresaId)
            ->with(['servicos', 'produtos', 'esteticaClienteEndereco'])
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $e->servicos()->delete();
            $e->produtos()->delete();
            $e->esteticaClienteEndereco()?->delete();

            $e->delete();

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível remover o agendamento de estética.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'animal_id' => ['required'],
            'colaborador_id' => ['required'],
            'estado' => ['required', 'in:agendado,em_andamento,concluido,cancelado'],
            'descricao' => ['nullable', 'string', 'max:1000'],
            'data_agendamento' => ['required', 'string'],
            'horario_agendamento' => ['required', 'string'],
            'horario_saida' => ['required', 'string'],
            'servicos' => ['array'],
            'servicos.*.servico_id' => ['nullable'],
            'servicos.*.subtotal_servico' => ['nullable', 'string'],
            'produtos' => ['array'],
            'produtos.*.produto_id' => ['nullable'],
            'produtos.*.qtd_produto' => ['nullable'],
        ]);
    }

    private function syncServicos(Estetica $e, array $servicos): void
    {
        $empresaId = (int) $e->empresa_id;

        $e->servicos()->delete();

        foreach ($servicos as $row) {
            if (! is_array($row)) continue;
            $servicoId = (int) ($row['servico_id'] ?? 0);
            if ($servicoId <= 0) continue;

            $servico = Servico::query()->where('empresa_id', $empresaId)->find($servicoId);
            if (! $servico) continue;

            EsteticaServico::create([
                'estetica_id' => $e->id,
                'servico_id' => $servicoId,
                'subtotal' => $this->parseMoneyBr((string) ($row['subtotal_servico'] ?? '')),
            ]);
        }
    }

    private function syncProdutos(Estetica $e, array $produtos): void
    {
        $empresaId = (int) $e->empresa_id;

        $e->produtos()->delete();

        foreach ($produtos as $row) {
            if (! is_array($row)) continue;
            $produtoId = (int) ($row['produto_id'] ?? 0);
            if ($produtoId <= 0) continue;

            $produto = Produto::query()->where('empresa_id', $empresaId)->find($produtoId);
            if (! $produto) continue;

            $qtd = max(0, (int) ($row['qtd_produto'] ?? 1));
            if ($qtd <= 0) $qtd = 1;

            $valorUnit = (float) ($produto->valor_unitario ?? 0);
            $subtotal = $valorUnit * $qtd;

            EsteticaProduto::create([
                'estetica_id' => $e->id,
                'produto_id' => $produtoId,
                'quantidade' => $qtd,
                'valor' => $valorUnit,
                'subtotal' => $subtotal,
            ]);
        }
    }

    private function syncOrdemServico(Estetica $e): void
    {
        $empresaId = (int) $e->empresa_id;
        $animal = $e->relationLoaded('animal') ? $e->animal : $e->animal()->first();

        $data = $this->resolveDataInicio($e);
        $dataEntrega = $this->resolveDataEntrega($e, $data);
        $valorTotal = $this->computeValorTotal($e);

        $ordem = $e->relationLoaded('ordemServico') ? $e->ordemServico : $e->ordemServico()->first();

        if ($ordem) {
            $ordem->update([
                'cliente_id' => $animal?->cliente_id,
                'empresa_id' => $empresaId,
                'funcionario_id' => $e->colaborador_id,
                'animal_id' => $e->animal_id,
                'estetica_id' => $e->id,
                'valor' => $valorTotal,
                'total_sem_desconto' => $valorTotal,
                'data_inicio' => $data,
                'data_entrega' => $dataEntrega,
            ]);
        } else {
            $codigoSequencial = ((int) (OrdemServico::where('empresa_id', $empresaId)->max('codigo_sequencial') ?? 0)) + 1;

            $ordem = OrdemServico::create([
                'descricao' => 'Ordem de Serviço Estetica',
                'cliente_id' => $animal?->cliente_id,
                'empresa_id' => $empresaId,
                'funcionario_id' => $e->colaborador_id,
                'animal_id' => $e->animal_id,
                'plano_id' => null,
                'modulos' => 'Estetica',
                'modulo_ids' => ['Estetica' => [$e->id]],
                'usuario_id' => Auth::id(),
                'codigo_sequencial' => $codigoSequencial,
                'valor' => $valorTotal,
                'total_sem_desconto' => $valorTotal,
                'data_inicio' => $data,
                'data_entrega' => $dataEntrega,
                'estado' => 'AF',
                'estetica_id' => $e->id,
            ]);

            $e->update(['ordem_servico_id' => $ordem->id]);
        }

        if (! $ordem) return;

        ServicoOs::where('ordem_servico_id', $ordem->id)->delete();
        ProdutoOs::where('ordem_servico_id', $ordem->id)->delete();

        $servicos = $e->relationLoaded('servicos') ? $e->servicos : $e->servicos()->get();
        foreach ($servicos as $s) {
            ServicoOs::create([
                'ordem_servico_id' => $ordem->id,
                'servico_id' => $s->servico_id,
                'quantidade' => 1,
                'valor' => (float) ($s->subtotal ?? 0),
                'subtotal' => (float) ($s->subtotal ?? 0),
            ]);
        }

        $produtos = $e->relationLoaded('produtos') ? $e->produtos : $e->produtos()->get();
        foreach ($produtos as $p) {
            ProdutoOs::create([
                'ordem_servico_id' => $ordem->id,
                'produto_id' => $p->produto_id,
                'quantidade' => (int) ($p->quantidade ?? 1),
                'valor' => (float) ($p->valor ?? 0),
                'subtotal' => (float) ($p->subtotal ?? 0),
            ]);
        }
    }

    private function computeValorTotal(Estetica $e): float
    {
        $servicos = $e->relationLoaded('servicos') ? $e->servicos : $e->servicos()->get();
        $produtos = $e->relationLoaded('produtos') ? $e->produtos : $e->produtos()->get();

        $total = 0.0;
        foreach ($servicos as $s) $total += (float) ($s->subtotal ?? 0);
        foreach ($produtos as $p) $total += (float) ($p->subtotal ?? 0);

        return $total;
    }

    private function resolveDataInicio(Estetica $e): Carbon
    {
        $ymd = $e->data_agendamento ? $e->data_agendamento->format('Y-m-d') : date('Y-m-d');
        $time = $this->normalizeTime((string) ($e->horario_agendamento ?? '00:00'));

        return Carbon::parse($ymd . ' ' . $time);
    }

    private function resolveDataEntrega(Estetica $e, Carbon $inicio): Carbon
    {
        $minutes = 0;
        $servicos = $e->relationLoaded('servicos') ? $e->servicos : $e->servicos()->with('servico')->get();
        foreach ($servicos as $row) {
            $tempo = (int) ($row->servico?->tempo_execucao ?? 0);
            $minutes += max(0, $tempo);
        }
        return $inicio->copy()->addMinutes($minutes);
    }

    private function toV2Payload(Estetica $e): array
    {
        $animal = $e->relationLoaded('animal') ? $e->animal : null;
        $colaborador = $e->relationLoaded('colaborador') ? $e->colaborador : null;
        $ordem = $e->relationLoaded('ordemServico') ? $e->ordemServico : null;

        $ordemCodigo = $ordem?->codigo_sequencial ? 'OS-' . (string) $ordem->codigo_sequencial : '';

        $dataAg = $e->data_agendamento ? $e->data_agendamento->format('d/m/Y') : '';
        $horaIni = $e->horario_agendamento ? substr((string) $e->horario_agendamento, 0, 5) : '';
        $horaFim = $e->horario_saida ? substr((string) $e->horario_saida, 0, 5) : '';

        $animalInfo = $animal ? json_encode([
            'especie_id' => (string) ($animal->especie_id ?? ''),
            'raca_id' => (string) ($animal->raca_id ?? ''),
            'pelagem_id' => (string) ($animal->pelagem_id ?? ''),
            'porte' => (string) ($animal->porte ?? ''),
            'observacao' => (string) ($animal->observacao ?? ''),
        ], JSON_UNESCAPED_UNICODE) : '';

        $servicos = $e->relationLoaded('servicos') ? $e->servicos : collect();
        $servicosPayload = $servicos->map(function ($s) {
            $tempo = (string) ($s->servico?->tempo_execucao ?? '');
            return [
                'servico_id' => (string) ($s->servico_id ?? ''),
                'subtotal_servico' => $this->formatMoneyBr((float) ($s->subtotal ?? 0)),
                'tempo_execucao' => $tempo,
            ];
        })->values()->all();

        $produtos = $e->relationLoaded('produtos') ? $e->produtos : collect();
        $produtosPayload = $produtos->map(function ($p) {
            $valor = (float) ($p->valor ?? 0);
            return [
                'produto_id' => (string) ($p->produto_id ?? ''),
                'qtd_produto' => (string) ($p->quantidade ?? 1),
                'valor_unitario_produto' => $this->formatMoneyBr($valor),
                'subtotal_produto' => $this->formatMoneyBr((float) ($p->subtotal ?? ($valor * (int) ($p->quantidade ?? 1)))),
            ];
        })->values()->all();

        $total = $this->computeValorTotal($e);

        return [
            'id' => (string) $e->id,
            'ordem_servico' => $ordemCodigo,
            'animal_id' => (string) ($e->animal_id ?? ''),
            'colaborador_id' => (string) ($e->colaborador_id ?? ''),
            'estado' => (string) ($e->estado ?? 'agendado'),
            'descricao' => (string) ($e->descricao ?? ''),
            'animal_info' => (string) ($animalInfo ?? ''),
            'id_animal' => (string) ($e->animal_id ?? ''),
            'cliente_id' => (string) ($animal?->cliente_id ?? $e->cliente_id ?? ''),
            'nome_colaborador' => (string) ($colaborador?->nome ?? ''),
            'id_colaborador' => (string) ($e->colaborador_id ?? ''),
            'servicos' => $servicosPayload,
            'produtos' => $produtosPayload,
            'frete' => [
                'subtotal_servico' => '',
                'tempo_execucao' => '',
                'endereco_cliente' => '',
            ],
            'data_agendamento' => $dataAg,
            'horario_agendamento' => $horaIni,
            'horario_saida' => $horaFim,
            'created_at' => optional($e->created_at)->toISOString(),
            'updated_at' => optional($e->updated_at)->toISOString(),
            'valor_total' => $this->formatMoneyBr($total),
        ];
    }

    private function parseDateBrToYmd(string $input): string
    {
        $trimmed = trim($input);
        if ($trimmed === '') return date('Y-m-d');

        if (preg_match('/^(\\d{4})-(\\d{2})-(\\d{2})$/', $trimmed)) return $trimmed;

        if (preg_match('/^(\\d{2})\\/(\\d{2})\\/(\\d{4})$/', $trimmed, $m)) {
            return "{$m[3]}-{$m[2]}-{$m[1]}";
        }

        try {
            return Carbon::parse($trimmed)->format('Y-m-d');
        } catch (Throwable) {
            return date('Y-m-d');
        }
    }

    private function normalizeTime(string $input): string
    {
        $trimmed = trim($input);
        if ($trimmed === '') return '00:00';
        return strlen($trimmed) >= 5 ? substr($trimmed, 0, 5) : $trimmed;
    }

    private function normalizeEstado(string $value): string
    {
        return match ($value) {
            'em_andamento', 'concluido', 'cancelado' => $value,
            default => 'agendado',
        };
    }

    private function parseMoneyBr(string $input): float
    {
        $normalized = trim($input);
        if ($normalized === '') return 0.0;

        $normalized = str_replace(['.', 'R$', ' '], ['', '', ''], $normalized);
        $normalized = str_replace(',', '.', $normalized);
        $normalized = preg_replace('/[^0-9.]/', '', $normalized) ?? '0';

        return (float) ($normalized === '' ? '0' : $normalized);
    }

    private function formatMoneyBr(float $value): string
    {
        return number_format(max(0, $value), 2, ',', '.');
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

