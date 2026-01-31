<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api\Petshop\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Funcionario;
use App\Models\OrdemServico;
use App\Models\Petshop\Animal;
use App\Models\Petshop\Hotel;
use App\Models\Petshop\Quarto;
use App\Models\Produto;
use App\Models\ProdutoOs;
use App\Models\Servico;
use App\Models\ServicoOs;
use App\Services\QuartoService;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class ReservasController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Hotel::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal.cliente', 'cliente', 'quarto', 'colaborador', 'servicos.categoria', 'produtos', 'ordemServico'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($sub) use ($busca) {
                    $sub->whereHas('animal', fn ($qa) => $qa->where('animais.nome', 'like', "%{$busca}%"))
                        ->orWhereHas('cliente', fn ($qc) => $qc->where('clientes.razao_social', 'like', "%{$busca}%"))
                        ->orWhereHas('quarto', fn ($qq) => $qq->where('quartos.nome', 'like', "%{$busca}%"))
                        ->orWhere('estado', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('quarto_id'), fn ($q) => $q->where('quarto_id', $request->string('quarto_id')->toString()))
            ->when($request->filled('estado'), fn ($q) => $q->where('estado', $this->normalizeEstado($request->string('estado')->toString())))
            ->orderByDesc('created_at');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Hotel $h) => $this->toV2Payload($h))->values(),
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

        $quartos = Quarto::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (Quarto $q) => ['id' => (string) $q->id, 'label' => (string) ($q->nome ?? ''), 'unidade' => ''])
            ->values();

        $servicos = Servico::query()
            ->where('empresa_id', $empresaId)
            ->with('categoria')
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

        $servicosHotel = Servico::query()
            ->where('empresa_id', $empresaId)
            ->with('categoria')
            ->whereHas('categoria', fn ($q) => $q->where('nome', 'HOTEL'))
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (Servico $s) => ['id' => (string) $s->id, 'label' => (string) ($s->nome ?? '')])
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
            'quartos' => $quartos,
            'estados' => [
                ['value' => 'agendado', 'label' => 'Agendado'],
                ['value' => 'hospedado', 'label' => 'Hospedado'],
                ['value' => 'finalizado', 'label' => 'Finalizado'],
                ['value' => 'cancelado', 'label' => 'Cancelado'],
            ],
            'servicos' => $servicos,
            'produtos' => $produtos,
            'servicoPrincipal' => $servicosHotel,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $h = Hotel::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal.cliente', 'cliente', 'quarto', 'colaborador', 'servicos.categoria', 'produtos', 'ordemServico'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($h));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->findOrFail((int) $validated['animal_id']);

        $quarto = Quarto::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail((int) $validated['quarto_id']);

        $colaboradorId = (int) $validated['colaborador_id'];

        try {
            DB::beginTransaction();

            $checkin = $this->parseDateTimeBrToCarbon((string) $validated['checkin'], (string) $validated['timecheckin']);
            $checkout = $this->parseDateTimeBrToCarbonNullable((string) ($validated['checkout'] ?? ''), (string) ($validated['timecheckout'] ?? ''));

            if ($checkout && $checkout->lt($checkin)) {
                return response()->json(['message' => 'Check-out não pode ser anterior ao check-in.'], 422);
            }

            $diarias = $checkout ? max(1, $checkin->copy()->startOfDay()->diffInDays($checkout->copy()->startOfDay())) : 1;

            $this->assertQuartoDisponivel($empresaId, (int) $quarto->id, $checkin, $checkout, null);

            $h = Hotel::create([
                'empresa_id' => $empresaId,
                'animal_id' => $animal->id,
                'cliente_id' => $animal->cliente_id,
                'quarto_id' => $quarto->id,
                'colaborador_id' => $colaboradorId ?: null,
                'checkin' => $checkin,
                'checkout' => $checkout,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'diarias' => $diarias,
                'estado' => $this->normalizeEstado((string) ($validated['estado'] ?? 'agendado')),
            ]);

            $this->syncServicosAndProdutos($h, $validated);
            $this->syncOrdemServico($h, $validated);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a reserva do hotel.'], 422);
        }

        return response()->json(['id' => (string) $h->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $h = Hotel::query()
            ->where('empresa_id', $empresaId)
            ->with(['animal', 'cliente', 'quarto', 'servicos', 'produtos', 'ordemServico'])
            ->findOrFail($id);

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with('cliente')
            ->findOrFail((int) $validated['animal_id']);

        $quarto = Quarto::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail((int) $validated['quarto_id']);

        $colaboradorId = (int) $validated['colaborador_id'];

        try {
            DB::beginTransaction();

            $checkin = $this->parseDateTimeBrToCarbon((string) $validated['checkin'], (string) $validated['timecheckin']);
            $checkout = $this->parseDateTimeBrToCarbonNullable((string) ($validated['checkout'] ?? ''), (string) ($validated['timecheckout'] ?? ''));

            if ($checkout && $checkout->lt($checkin)) {
                return response()->json(['message' => 'Check-out não pode ser anterior ao check-in.'], 422);
            }

            $diarias = $checkout ? max(1, $checkin->copy()->startOfDay()->diffInDays($checkout->copy()->startOfDay())) : 1;

            $this->assertQuartoDisponivel($empresaId, (int) $quarto->id, $checkin, $checkout, (int) $h->id);

            $h->update([
                'animal_id' => $animal->id,
                'cliente_id' => $animal->cliente_id,
                'quarto_id' => $quarto->id,
                'colaborador_id' => $colaboradorId ?: null,
                'checkin' => $checkin,
                'checkout' => $checkout,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'diarias' => $diarias,
                'estado' => $this->normalizeEstado((string) ($validated['estado'] ?? $h->estado ?? 'agendado')),
            ]);

            $this->syncServicosAndProdutos($h, $validated);
            $this->syncOrdemServico($h, $validated);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a reserva do hotel.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $h = Hotel::query()
            ->where('empresa_id', $empresaId)
            ->with(['ordemServico'])
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $ordem = $h->ordemServico;
            if ($ordem) {
                ServicoOs::where('ordem_servico_id', $ordem->id)->delete();
                ProdutoOs::where('ordem_servico_id', $ordem->id)->delete();
                $ordem->delete();
            }

            $h->servicos()->detach();
            $h->produtos()->detach();
            $h->delete();

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a reserva do hotel.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Hotel $h): array
    {
        $animal = $h->relationLoaded('animal') ? $h->animal : null;
        $colaborador = $h->relationLoaded('colaborador') ? $h->colaborador : null;
        $quarto = $h->relationLoaded('quarto') ? $h->quarto : null;
        $ordem = $h->relationLoaded('ordemServico') ? $h->ordemServico : null;
        $ordemCodigo = $ordem?->codigo_sequencial ? 'OS-' . (string) $ordem->codigo_sequencial : '';

        $estado = $this->toUiEstado((string) ($h->estado ?? 'agendado'));

        $checkinDate = $h->checkin ? Carbon::parse($h->checkin)->format('d/m/Y') : '';
        $checkinTime = $h->checkin ? Carbon::parse($h->checkin)->format('H:i') : '';
        $checkoutDate = $h->checkout ? Carbon::parse($h->checkout)->format('d/m/Y') : '';
        $checkoutTime = $h->checkout ? Carbon::parse($h->checkout)->format('H:i') : '';

        $servicos = $h->relationLoaded('servicos') ? $h->servicos : collect();

        $principal = $servicos->first(function ($s) {
            return strtoupper((string) ($s->categoria?->nome ?? '')) === 'HOTEL';
        });

        $servicosExtras = $servicos
            ->filter(function ($s) use ($principal) {
                if ($principal && (string) $s->id === (string) $principal->id) {
                    return false;
                }
                return strtoupper((string) ($s->categoria?->nome ?? '')) !== 'FRETE';
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

        $produtos = $h->relationLoaded('produtos') ? $h->produtos : collect();
        $produtosPayload = $produtos
            ->map(function ($p) {
                $qtd = (int) ($p->pivot->quantidade ?? 1);
                $valor = (float) ($p->valor_unitario ?? 0);
                return [
                    'produto_id' => (string) $p->id,
                    'qtd_produto' => (string) $qtd,
                    'valor_unitario_produto' => $this->formatMoneyBr($valor),
                    'subtotal_produto' => $this->formatMoneyBr($valor * $qtd),
                ];
            })
            ->values()
            ->all();

        $animalInfo = $animal ? json_encode([
            'especie_id' => (string) ($animal->especie_id ?? ''),
            'raca_id' => (string) ($animal->raca_id ?? ''),
            'pelagem_id' => (string) ($animal->pelagem_id ?? ''),
            'porte' => (string) ($animal->porte ?? ''),
            'observacao' => (string) ($animal->observacao ?? ''),
        ], JSON_UNESCAPED_UNICODE) : '';

        $valorTotal = $this->formatMoneyBr((float) ($h->valor ?? 0));

        return [
            'id' => (string) $h->id,
            'ordem_servico' => $ordemCodigo,
            'animal_id' => (string) ($h->animal_id ?? ''),
            'colaborador_id' => (string) ($h->colaborador_id ?? ''),
            'estado' => $estado,
            'descricao' => (string) ($h->descricao ?? ''),
            'animal_info' => (string) ($animalInfo ?? ''),
            'id_animal' => (string) ($h->animal_id ?? ''),
            'cliente_id' => (string) ($animal?->cliente_id ?? $h->cliente_id ?? ''),
            'nome_colaborador' => (string) ($colaborador?->nome ?? ''),
            'id_colaborador' => (string) ($h->colaborador_id ?? ''),
            'checkin' => $checkinDate,
            'timecheckin' => $checkinTime,
            'checkout' => $checkoutDate,
            'timecheckout' => $checkoutTime,
            'quarto_id' => (string) ($h->quarto_id ?? ''),
            'nome_quarto' => (string) ($quarto?->nome ?? ''),
            'id_quarto' => (string) ($h->quarto_id ?? ''),
            'servico_principal_id' => $principal ? (string) $principal->id : '',
            'servico_principal_valor' => $this->formatMoneyBr((float) ($principal?->pivot->valor_servico ?? 0)),
            'servicos_extras' => $servicosExtras,
            'produtos' => $produtosPayload,
            'frete' => $frete,
            'created_at' => optional($h->created_at)->toISOString(),
            'updated_at' => optional($h->updated_at)->toISOString(),
            'valor_total' => $valorTotal,
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'animal_id' => ['required', 'integer'],
            'quarto_id' => ['required', 'integer'],
            'colaborador_id' => ['nullable', 'integer'],
            'estado' => ['nullable', 'string', 'max:40'],
            'descricao' => ['nullable', 'string', 'max:1000'],
            'checkin' => ['required', 'string'],
            'timecheckin' => ['required', 'string'],
            'checkout' => ['nullable', 'string'],
            'timecheckout' => ['nullable', 'string'],
            'servico_principal_id' => ['nullable', 'string'],
            'servico_principal_valor' => ['nullable', 'string'],
            'servicos_extras' => ['nullable', 'array'],
            'servicos_extras.*.servico_id' => ['nullable', 'string'],
            'servicos_extras.*.servico_data' => ['nullable', 'string'],
            'servicos_extras.*.servico_hora' => ['nullable', 'string'],
            'servicos_extras.*.servico_valor' => ['nullable', 'string'],
            'produtos' => ['nullable', 'array'],
            'produtos.*.produto_id' => ['nullable', 'string'],
            'produtos.*.qtd_produto' => ['nullable', 'string'],
            'frete' => ['nullable', 'array'],
            'frete.servico_id' => ['nullable', 'string'],
            'frete.subtotal_servico' => ['nullable', 'string'],
        ]);
    }

    private function syncServicosAndProdutos(Hotel $h, array $validated): void
    {
        $checkin = $h->checkin ? Carbon::parse($h->checkin) : null;

        $syncServicos = [];
        $valorServicos = 0.0;

        $principalId = trim((string) ($validated['servico_principal_id'] ?? ''));
        if ($principalId !== '') {
            $principal = Servico::query()->where('empresa_id', $h->empresa_id)->findOrFail((int) $principalId);
            $valor = $this->parseMoneyBr((string) ($validated['servico_principal_valor'] ?? ''));
            $valorServicos += $valor;
            $syncServicos[(int) $principal->id] = [
                'data_servico' => $checkin ? $checkin->format('Y-m-d') : null,
                'hora_servico' => $checkin ? $checkin->format('H:i') : null,
                'valor_servico' => $valor,
            ];
        }

        $extras = is_array($validated['servicos_extras'] ?? null) ? $validated['servicos_extras'] : [];
        foreach ($extras as $row) {
            $id = trim((string) ($row['servico_id'] ?? ''));
            if ($id === '') {
                continue;
            }

            $s = Servico::query()->where('empresa_id', $h->empresa_id)->findOrFail((int) $id);
            $valor = $this->parseMoneyBr((string) ($row['servico_valor'] ?? ''));
            $valorServicos += $valor;

            $syncServicos[(int) $s->id] = [
                'data_servico' => $this->parseDateBrToYmdNullable((string) ($row['servico_data'] ?? '')),
                'hora_servico' => $this->normalizeTime((string) ($row['servico_hora'] ?? '')),
                'valor_servico' => $valor,
            ];
        }

        $freteId = trim((string) (($validated['frete']['servico_id'] ?? '') ?: ''));
        if ($freteId !== '') {
            $frete = Servico::query()->where('empresa_id', $h->empresa_id)->findOrFail((int) $freteId);
            $valor = $this->parseMoneyBr((string) ($validated['frete']['subtotal_servico'] ?? ''));
            $valorServicos += $valor;

            $syncServicos[(int) $frete->id] = [
                'data_servico' => $checkin ? $checkin->format('Y-m-d') : null,
                'hora_servico' => $checkin ? $checkin->format('H:i') : null,
                'valor_servico' => $valor,
            ];
        }

        $h->servicos()->sync($syncServicos);

        $syncProdutos = [];
        $valorProdutos = 0.0;

        $produtos = is_array($validated['produtos'] ?? null) ? $validated['produtos'] : [];
        foreach ($produtos as $row) {
            $id = trim((string) ($row['produto_id'] ?? ''));
            if ($id === '') {
                continue;
            }

            $p = Produto::query()->where('empresa_id', $h->empresa_id)->findOrFail((int) $id);
            $qtd = max(1, (int) preg_replace('/[^0-9]/', '', (string) ($row['qtd_produto'] ?? '1')));

            $valorProdutos += ((float) ($p->valor_unitario ?? 0)) * $qtd;

            if (isset($syncProdutos[(int) $p->id])) {
                $syncProdutos[(int) $p->id]['quantidade'] += $qtd;
            } else {
                $syncProdutos[(int) $p->id] = ['quantidade' => $qtd];
            }
        }

        $h->produtos()->sync($syncProdutos);

        $h->update(['valor' => $valorServicos + $valorProdutos]);
    }

    private function syncOrdemServico(Hotel $h, array $validated): void
    {
        $ordem = $h->ordemServico;

        $codigoSequencial = (int) ((OrdemServico::where('empresa_id', $h->empresa_id)->max('codigo_sequencial') ?? 0) + 1);
        $estadoKey = $this->normalizeEstado((string) ($validated['estado'] ?? 'agendado'));

        if (!$ordem) {
            $ordem = OrdemServico::create([
                'descricao' => 'Ordem de Serviço Avulso',
                'cliente_id' => $h->cliente_id,
                'empresa_id' => $h->empresa_id,
                'funcionario_id' => $h->colaborador_id,
                'animal_id' => $h->animal_id,
                'plano_id' => null,
                'hotel_id' => $h->id,
                'usuario_id' => auth()->id(),
                'codigo_sequencial' => $codigoSequencial,
                'valor' => (float) ($h->valor ?? 0),
                'data_inicio' => $h->checkin,
                'data_entrega' => $h->checkout,
                'estado' => $this->toOrdemServicoEstado($estadoKey),
            ]);

            $h->update(['ordem_servico_id' => $ordem->id]);
        } else {
            $ordem->update([
                'valor' => (float) ($h->valor ?? 0),
                'funcionario_id' => $h->colaborador_id,
                'animal_id' => $h->animal_id,
                'cliente_id' => $h->cliente_id,
                'data_inicio' => $h->checkin,
                'data_entrega' => $h->checkout,
                'estado' => $this->toOrdemServicoEstado($estadoKey),
            ]);
        }

        ServicoOs::where('ordem_servico_id', $ordem->id)->delete();
        ProdutoOs::where('ordem_servico_id', $ordem->id)->delete();

        $servicoCounts = [];
        foreach ($h->servicos as $s) {
            $sid = (int) $s->id;
            $servicoCounts[$sid] = ($servicoCounts[$sid] ?? 0) + 1;
        }

        foreach ($h->servicos as $s) {
            $sid = (int) $s->id;
            $qtd = (int) ($servicoCounts[$sid] ?? 1);
            $valor = (float) ($s->pivot->valor_servico ?? 0);
            ServicoOs::create([
                'ordem_servico_id' => $ordem->id,
                'servico_id' => $sid,
                'quantidade' => $qtd,
                'valor' => $valor,
                'subtotal' => $valor * $qtd,
                'desconto' => 0,
            ]);
        }

        foreach ($h->produtos as $p) {
            $qtd = (int) ($p->pivot->quantidade ?? 1);
            $valor = (float) ($p->valor_unitario ?? 0);
            ProdutoOs::create([
                'ordem_servico_id' => $ordem->id,
                'produto_id' => (int) $p->id,
                'quantidade' => $qtd,
                'valor' => $valor,
                'subtotal' => $valor * $qtd,
                'desconto' => 0,
            ]);
        }
    }

    private function assertQuartoDisponivel(int $empresaId, int $quartoId, Carbon $checkin, ?Carbon $checkout, ?int $reservaId): void
    {
        $qtService = new QuartoService();
        $payload = (object) [
            'quarto_id' => $quartoId,
            'empresa_id' => $empresaId,
            'checkin' => $checkin,
            'checkout' => $checkout ?? $checkin->copy()->addDay(),
            'reserva_id' => $reservaId,
        ];

        if ($qtService->checkIfQuartoIsBusy($payload)) {
            throw new HttpResponseException(response()->json([
                'message' => 'Não há vagas disponíveis nesse quarto para as datas selecionadas.',
            ], 422));
        }
    }

    private function toUiEstado(string $value): string
    {
        $normalized = $this->normalizeEstado($value);
        if ($normalized === 'em_andamento') {
            return 'hospedado';
        }
        if ($normalized === 'concluido') {
            return 'finalizado';
        }
        return $normalized === 'cancelado' ? 'cancelado' : 'agendado';
    }

    private function normalizeEstado(string $value): string
    {
        $v = strtolower(trim($value));
        $v = str_replace([' ', '-'], '_', $v);
        if ($v === 'hospedado') {
            return 'em_andamento';
        }
        if ($v === 'finalizado') {
            return 'concluido';
        }
        if (str_contains($v, 'andamento')) {
            return 'em_andamento';
        }
        if (str_contains($v, 'conclu')) {
            return 'concluido';
        }
        if (str_contains($v, 'cancel')) {
            return 'cancelado';
        }
        return 'agendado';
    }

    private function toOrdemServicoEstado(string $estadoKey): string
    {
        $key = $this->normalizeEstado($estadoKey);
        return match ($key) {
            'agendado' => 'AG',
            'em_andamento' => 'EA',
            'concluido' => 'FZ',
            'cancelado' => 'CC',
            default => 'AG',
        };
    }

    private function parseMoneyBr(string $input): float
    {
        $normalized = preg_replace('/[^0-9,.-]/', '', $input);
        $normalized = str_replace('.', '', (string) $normalized);
        $normalized = str_replace(',', '.', (string) $normalized);
        return is_numeric($normalized) ? (float) $normalized : 0.0;
    }

    private function formatMoneyBr(float $value): string
    {
        return number_format($value, 2, ',', '.');
    }

    private function parseDateBrToYmdNullable(string $dateBr): ?string
    {
        $dateBr = trim($dateBr);
        if ($dateBr === '') {
            return null;
        }
        return $this->parseDateBrToYmd($dateBr);
    }

    private function parseDateBrToYmd(string $dateBr): string
    {
        $dateBr = trim($dateBr);
        $dt = Carbon::createFromFormat('d/m/Y', $dateBr);
        return $dt->format('Y-m-d');
    }

    private function normalizeTime(string $time): string
    {
        $t = trim($time);
        if ($t === '') {
            return '';
        }
        if (preg_match('/^\\d{2}:\\d{2}$/', $t)) {
            return $t;
        }
        if (preg_match('/^(\\d{2}:\\d{2}):\\d{2}$/', $t, $m)) {
            return $m[1];
        }
        return $t;
    }

    private function parseDateTimeBrToCarbon(string $dateBr, string $time): Carbon
    {
        $date = Carbon::createFromFormat('d/m/Y', trim($dateBr))->format('Y-m-d');
        $t = $this->normalizeTime($time);
        return Carbon::parse($date . ' ' . ($t !== '' ? $t : '00:00'));
    }

    private function parseDateTimeBrToCarbonNullable(string $dateBr, string $time): ?Carbon
    {
        $d = trim($dateBr);
        if ($d === '') {
            return null;
        }
        return $this->parseDateTimeBrToCarbon($d, $time);
    }

    private function getEmpresaId(): int
    {
        return (int) (Auth::user()?->empresa?->empresa_id ?? 0);
    }
}
