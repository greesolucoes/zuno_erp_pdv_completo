<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api\Petshop\Creche;

use App\Http\Controllers\Controller;
use App\Models\Funcionario;
use App\Models\OrdemServico;
use App\Models\Petshop\Animal;
use App\Models\Petshop\Creche;
use App\Models\Petshop\Turma;
use App\Models\Produto;
use App\Models\ProdutoOs;
use App\Models\Servico;
use App\Models\ServicoOs;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ReservasController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Creche::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal.cliente', 'cliente', 'turma', 'colaborador', 'servicos.categoria', 'produtos', 'ordemServico'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($sub) use ($busca) {
                    $sub->whereHas('animal', fn ($qa) => $qa->where('animais.nome', 'like', "%{$busca}%"))
                        ->orWhereHas('cliente', fn ($qc) => $qc->where('clientes.razao_social', 'like', "%{$busca}%"))
                        ->orWhere('estado', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('turma_id'), fn ($q) => $q->where('turma_id', $request->string('turma_id')->toString()))
            ->when($request->filled('estado'), fn ($q) => $q->where('estado', $this->normalizeEstado($request->string('estado')->toString())))
            ->orderByDesc('created_at');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Creche $c) => $this->toV2Payload($c))->values(),
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

        $turmas = Turma::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (Turma $t) => ['id' => (string) $t->id, 'label' => (string) ($t->nome ?? ''), 'unidade' => ''])
            ->values();

        $servicos = Servico::query()
            ->where('empresa_id', $empresaId)
            ->with('categoria')
            ->whereHas('categoria', fn ($q) => $q->whereIn('nome', ['CRECHE', 'FRETE']))
            ->orderBy('nome')
            ->get(['id', 'nome', 'tempo_execucao', 'valor'])
            ->map(fn (Servico $s) => [
                'id' => (string) $s->id,
                'label' => (string) ($s->nome ?? ''),
                'categoria' => strtoupper((string) ($s->categoria?->nome ?? 'SERVICO')) === 'FRETE' ? 'frete' : 'servico',
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
            'turmas' => $turmas,
            'estados' => [
                ['value' => 'agendado', 'label' => 'Agendado'],
                ['value' => 'em_andamento', 'label' => 'Em andamento'],
                ['value' => 'finalizado', 'label' => 'Finalizado'],
                ['value' => 'cancelado', 'label' => 'Cancelado'],
            ],
            'servicos' => $servicos,
            'produtos' => $produtos,
            'servicoPrincipal' => [
                ['id' => 'diaria', 'label' => 'Diária'],
                ['id' => 'pacote', 'label' => 'Pacote'],
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = Creche::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal.cliente', 'cliente', 'turma', 'colaborador', 'servicos.categoria', 'produtos', 'ordemServico'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($c));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->findOrFail((int) $validated['animal_id']);

        $turma = Turma::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail((int) $validated['turma_id']);

        $colaboradorId = (int) $validated['colaborador_id'];

        try {
            DB::beginTransaction();

            $c = Creche::create([
                'empresa_id' => $empresaId,
                'animal_id' => $animal->id,
                'cliente_id' => $animal->cliente_id,
                'turma_id' => $turma->id,
                'colaborador_id' => $colaboradorId ?: null,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'estado' => $this->normalizeEstado((string) ($validated['estado'] ?? 'agendado')),
                'data_entrada' => $this->parseDateBrToYmd((string) $validated['data_entrada']),
                'data_saida' => $this->parseDateBrToYmdNullable((string) ($validated['data_saida'] ?? '')),
            ]);

            $this->syncServicosAndProdutos($c, $validated);
            $this->syncOrdemServico($c, $validated);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a reserva da creche.'], 422);
        }

        return response()->json(['id' => (string) $c->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $c = Creche::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal', 'cliente', 'turma', 'servicos', 'produtos', 'ordemServico'])
            ->findOrFail($id);

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->findOrFail((int) $validated['animal_id']);

        $turma = Turma::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail((int) $validated['turma_id']);

        $colaboradorId = (int) $validated['colaborador_id'];

        try {
            DB::beginTransaction();

            $c->update([
                'animal_id' => $animal->id,
                'cliente_id' => $animal->cliente_id,
                'turma_id' => $turma->id,
                'colaborador_id' => $colaboradorId ?: null,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'estado' => $this->normalizeEstado((string) ($validated['estado'] ?? $c->estado ?? 'agendado')),
                'data_entrada' => $this->parseDateBrToYmd((string) $validated['data_entrada']),
                'data_saida' => $this->parseDateBrToYmdNullable((string) ($validated['data_saida'] ?? '')),
            ]);

            $this->syncServicosAndProdutos($c, $validated);
            $this->syncOrdemServico($c, $validated);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a reserva da creche.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = Creche::query()
            ->where('empresa_id', $empresaId)
            ->with(['ordemServico'])
            ->findOrFail($id);

        try {
            DB::beginTransaction();
            $c->servicos()->detach();
            $c->produtos()->detach();
            $c->delete();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível remover a reserva da creche.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'animal_id' => ['required'],
            'colaborador_id' => ['required'],
            'turma_id' => ['required'],
            'estado' => ['required', 'in:agendado,em_andamento,finalizado,cancelado'],
            'descricao' => ['nullable', 'string', 'max:1000'],
            'data_entrada' => ['required', 'string'],
            'horario_entrada' => ['nullable', 'string'],
            'data_saida' => ['nullable', 'string'],
            'horario_saida' => ['nullable', 'string'],
            'servico_principal_id' => ['required', 'string'],
            'servico_principal_valor' => ['required', 'string'],
            'servicos_extras' => ['array'],
            'servicos_extras.*.servico_id' => ['nullable'],
            'servicos_extras.*.servico_data' => ['nullable', 'string'],
            'servicos_extras.*.servico_hora' => ['nullable', 'string'],
            'servicos_extras.*.servico_valor' => ['nullable', 'string'],
            'produtos' => ['array'],
            'produtos.*.produto_id' => ['nullable'],
            'produtos.*.qtd_produto' => ['nullable'],
            'frete' => ['array'],
        ]);
    }

    private function syncServicosAndProdutos(Creche $c, array $payload): void
    {
        $empresaId = (int) $c->empresa_id;

        $attach = [];

        $principalId = $this->normalizeServicoId($payload['servico_principal_id'] ?? '');
        $principalValor = $this->parseMoneyBr((string) ($payload['servico_principal_valor'] ?? ''));
        if ($principalId) {
            $servico = Servico::query()->where('empresa_id', $empresaId)->find($principalId);
            if ($servico) {
                $attach[$principalId] = [
                    'data_servico' => $c->data_entrada,
                    'hora_servico' => $this->normalizeTime((string) ($payload['horario_entrada'] ?? '00:00')),
                    'valor_servico' => $principalValor,
                ];
            }
        }

        foreach (($payload['servicos_extras'] ?? []) as $row) {
            if (! is_array($row)) continue;
            $sid = (int) ($row['servico_id'] ?? 0);
            if ($sid <= 0) continue;
            $servico = Servico::query()->where('empresa_id', $empresaId)->find($sid);
            if (! $servico) continue;

            $data = $this->parseDateBrToYmdNullable((string) ($row['servico_data'] ?? '')) ?? $c->data_entrada;
            $hora = $this->normalizeTime((string) ($row['servico_hora'] ?? '00:00'));
            $valor = $this->parseMoneyBr((string) ($row['servico_valor'] ?? ''));

            $attach[$sid] = [
                'data_servico' => $data,
                'hora_servico' => $hora,
                'valor_servico' => $valor,
            ];
        }

        $frete = is_array($payload['frete'] ?? null) ? $payload['frete'] : [];
        $freteId = (int) ($frete['servico_id'] ?? 0);
        if ($freteId > 0) {
            $servico = Servico::query()->where('empresa_id', $empresaId)->find($freteId);
            if ($servico) {
                $attach[$freteId] = [
                    'data_servico' => $c->data_entrada,
                    'hora_servico' => $this->normalizeTime((string) ($payload['horario_entrada'] ?? '00:00')),
                    'valor_servico' => $this->parseMoneyBr((string) ($frete['subtotal_servico'] ?? '')),
                ];
            }
        }

        $c->servicos()->sync($attach);

        $produtosAttach = [];
        foreach (($payload['produtos'] ?? []) as $row) {
            if (! is_array($row)) continue;
            $pid = (int) ($row['produto_id'] ?? 0);
            if ($pid <= 0) continue;
            $produto = Produto::query()->where('empresa_id', $empresaId)->find($pid);
            if (! $produto) continue;
            $qtd = max(1, (int) ($row['qtd_produto'] ?? 1));
            $produtosAttach[$pid] = ['quantidade' => $qtd];
        }

        $c->produtos()->sync($produtosAttach);

        $total = $this->computeValorTotal($c);
        $c->update(['valor' => $total]);
    }

    private function syncOrdemServico(Creche $c, array $payload): void
    {
        $empresaId = (int) $c->empresa_id;
        $animal = $c->relationLoaded('animal') ? $c->animal : $c->animal()->first();

        $dataInicio = $this->resolveDataInicio($c, (string) ($payload['horario_entrada'] ?? '00:00'));
        $dataEntrega = $this->resolveDataEntrega($c, (string) ($payload['horario_saida'] ?? ''));

        $valorTotal = (float) ($c->valor ?? $this->computeValorTotal($c));

        $ordem = $c->relationLoaded('ordemServico') ? $c->ordemServico : $c->ordemServico()->first();

        if ($ordem) {
            $ordem->update([
                'cliente_id' => $animal?->cliente_id,
                'empresa_id' => $empresaId,
                'funcionario_id' => $c->colaborador_id,
                'animal_id' => $c->animal_id,
                'creche_id' => $c->id,
                'valor' => $valorTotal,
                'total_sem_desconto' => $valorTotal,
                'data_inicio' => $dataInicio,
                'data_entrega' => $dataEntrega,
            ]);
        } else {
            $codigoSequencial = ((int) (OrdemServico::where('empresa_id', $empresaId)->max('codigo_sequencial') ?? 0)) + 1;

            $ordem = OrdemServico::create([
                'descricao' => 'Ordem de Serviço Creche',
                'cliente_id' => $animal?->cliente_id,
                'empresa_id' => $empresaId,
                'funcionario_id' => $c->colaborador_id,
                'animal_id' => $c->animal_id,
                'plano_id' => null,
                'modulos' => 'Creche',
                'modulo_ids' => ['Creche' => [$c->id]],
                'usuario_id' => Auth::id(),
                'codigo_sequencial' => $codigoSequencial,
                'valor' => $valorTotal,
                'total_sem_desconto' => $valorTotal,
                'data_inicio' => $dataInicio,
                'data_entrega' => $dataEntrega,
                'estado' => 'AF',
                'creche_id' => $c->id,
            ]);

            $c->update(['ordem_servico_id' => $ordem->id]);
        }

        if (! $ordem) return;

        ServicoOs::where('ordem_servico_id', $ordem->id)->delete();
        ProdutoOs::where('ordem_servico_id', $ordem->id)->delete();

        $servicos = $c->servicos()->with('categoria')->get();
        foreach ($servicos as $s) {
            $quantidade = 1;
            ServicoOs::create([
                'ordem_servico_id' => $ordem->id,
                'servico_id' => $s->id,
                'quantidade' => $quantidade,
                'valor' => (float) ($s->pivot->valor_servico ?? 0),
                'subtotal' => (float) ($s->pivot->valor_servico ?? 0) * $quantidade,
                'desconto' => 0,
            ]);
        }

        $produtos = $c->produtos()->get();
        foreach ($produtos as $p) {
            $quantidade = (int) ($p->pivot->quantidade ?? 1);
            $valor = (float) ($p->valor_unitario ?? 0);
            ProdutoOs::create([
                'ordem_servico_id' => $ordem->id,
                'produto_id' => $p->id,
                'quantidade' => $quantidade,
                'valor' => $valor,
                'subtotal' => $valor * $quantidade,
                'desconto' => 0,
            ]);
        }
    }

    private function toV2Payload(Creche $c): array
    {
        $ordem = $c->relationLoaded('ordemServico') ? $c->ordemServico : null;
        $animal = $c->relationLoaded('animal') ? $c->animal : null;
        $turma = $c->relationLoaded('turma') ? $c->turma : null;
        $colaborador = $c->relationLoaded('colaborador') ? $c->colaborador : null;

        $ordemCodigo = $ordem?->codigo_sequencial ? 'OS-' . (string) $ordem->codigo_sequencial : '';

        $dataEntrada = $c->data_entrada ? Carbon::parse($c->data_entrada)->format('d/m/Y') : '';
        $dataSaida = $c->data_saida ? Carbon::parse($c->data_saida)->format('d/m/Y') : '';

        $estado = $this->toUiEstado((string) ($c->estado ?? 'agendado'));

        $servicos = $c->relationLoaded('servicos') ? $c->servicos : collect();
        $principal = $servicos->first(function ($s) {
            return strtoupper((string) ($s->categoria?->nome ?? '')) === 'CRECHE';
        });

        $servicosExtras = $servicos
            ->filter(function ($s) {
                $cat = strtoupper((string) ($s->categoria?->nome ?? ''));
                return $cat !== 'CRECHE' && $cat !== 'FRETE';
            })
            ->values()
            ->map(function ($s) {
                return [
                    'servico_id' => (string) $s->id,
                    'servico_categoria' => 'servico',
                    'tempo_execucao' => (string) ($s->tempo_execucao ?? ''),
                    'servico_data' => $s->pivot?->data_servico ? Carbon::parse($s->pivot->data_servico)->format('d/m/Y') : '',
                    'servico_hora' => (string) ($s->pivot->hora_servico ?? ''),
                    'servico_valor' => $this->formatMoneyBr((float) ($s->pivot->valor_servico ?? 0)),
                ];
            })
            ->all();

        $freteServico = $servicos->first(function ($s) {
            return strtoupper((string) ($s->categoria?->nome ?? '')) === 'FRETE';
        });

        $frete = [
            'servico_id' => $freteServico ? (string) $freteServico->id : '',
            'servico_categoria' => 'frete',
            'tempo_execucao' => $freteServico ? (string) ($freteServico->tempo_execucao ?? '') : '',
            'subtotal_servico' => $this->formatMoneyBr((float) ($freteServico?->pivot->valor_servico ?? 0)),
            'endereco_cliente' => '',
        ];

        $produtos = $c->relationLoaded('produtos') ? $c->produtos : collect();
        $produtosPayload = $produtos->map(function ($p) {
            $qtd = (int) ($p->pivot->quantidade ?? 1);
            $valor = (float) ($p->valor_unitario ?? 0);
            return [
                'produto_id' => (string) $p->id,
                'qtd_produto' => (string) $qtd,
                'valor_unitario_produto' => $this->formatMoneyBr($valor),
                'subtotal_produto' => $this->formatMoneyBr($valor * $qtd),
            ];
        })->values()->all();

        $animalInfo = $animal ? json_encode([
            'especie_id' => (string) ($animal->especie_id ?? ''),
            'raca_id' => (string) ($animal->raca_id ?? ''),
            'pelagem_id' => (string) ($animal->pelagem_id ?? ''),
            'porte' => (string) ($animal->porte ?? ''),
            'observacao' => (string) ($animal->observacao ?? ''),
        ], JSON_UNESCAPED_UNICODE) : '';

        $valorTotal = $this->formatMoneyBr((float) ($c->valor ?? 0));

        return [
            'id' => (string) $c->id,
            'ordem_servico' => $ordemCodigo,
            'animal_id' => (string) ($c->animal_id ?? ''),
            'colaborador_id' => (string) ($c->colaborador_id ?? ''),
            'estado' => $estado,
            'descricao' => (string) ($c->descricao ?? ''),
            'animal_info' => (string) ($animalInfo ?? ''),
            'id_animal' => (string) ($c->animal_id ?? ''),
            'cliente_id' => (string) ($animal?->cliente_id ?? $c->cliente_id ?? ''),
            'nome_colaborador' => (string) ($colaborador?->nome ?? ''),
            'id_colaborador' => (string) ($c->colaborador_id ?? ''),
            'data_entrada' => $dataEntrada,
            'horario_entrada' => '',
            'data_saida' => $dataSaida,
            'horario_saida' => '',
            'turma_id' => (string) ($c->turma_id ?? ''),
            'nome_turma' => (string) ($turma?->nome ?? ''),
            'id_turma' => (string) ($c->turma_id ?? ''),
            'servico_principal_id' => $principal ? (string) $principal->id : '',
            'servico_principal_valor' => $this->formatMoneyBr((float) ($principal?->pivot->valor_servico ?? 0)),
            'servicos_extras' => $servicosExtras,
            'produtos' => $produtosPayload,
            'frete' => $frete,
            'created_at' => optional($c->created_at)->toISOString(),
            'updated_at' => optional($c->updated_at)->toISOString(),
            'valor_total' => $valorTotal,
        ];
    }

    private function toUiEstado(string $value): string
    {
        $normalized = $this->normalizeEstado($value);
        return $normalized === 'concluido' ? 'finalizado' : $normalized;
    }

    private function normalizeEstado(string $value): string
    {
        $v = strtolower(trim($value));
        if ($v === 'finalizado') return 'concluido';

        return match ($v) {
            'em_andamento', 'concluido', 'cancelado' => $v,
            default => 'agendado',
        };
    }

    private function normalizeServicoId(mixed $value): ?int
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return null;
        $id = (int) $raw;
        return $id > 0 ? $id : null;
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

    private function parseDateBrToYmdNullable(string $input): ?string
    {
        $trimmed = trim((string) $input);
        if ($trimmed === '') return null;
        return $this->parseDateBrToYmd($trimmed);
    }

    private function normalizeTime(string $input): string
    {
        $trimmed = trim($input);
        if ($trimmed === '') return '00:00';
        return strlen($trimmed) >= 5 ? substr($trimmed, 0, 5) : $trimmed;
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

    private function computeValorTotal(Creche $c): float
    {
        $total = 0.0;
        $servicos = $c->servicos()->get();
        foreach ($servicos as $s) $total += (float) ($s->pivot->valor_servico ?? 0);

        $produtos = $c->produtos()->get();
        foreach ($produtos as $p) {
            $qtd = (int) ($p->pivot->quantidade ?? 1);
            $total += (float) ($p->valor_unitario ?? 0) * $qtd;
        }

        return $total;
    }

    private function resolveDataInicio(Creche $c, string $horaEntrada): Carbon
    {
        $ymd = $c->data_entrada ? Carbon::parse($c->data_entrada)->format('Y-m-d') : date('Y-m-d');
        return Carbon::parse($ymd . ' ' . $this->normalizeTime($horaEntrada));
    }

    private function resolveDataEntrega(Creche $c, string $horaSaida): Carbon
    {
        $ymd = $c->data_saida ? Carbon::parse($c->data_saida)->format('Y-m-d') : ($c->data_entrada ? Carbon::parse($c->data_entrada)->format('Y-m-d') : date('Y-m-d'));
        $time = trim($horaSaida) !== '' ? $this->normalizeTime($horaSaida) : '00:00';
        return Carbon::parse($ymd . ' ' . $time);
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}
