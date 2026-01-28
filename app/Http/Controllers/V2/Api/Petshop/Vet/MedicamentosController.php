<?php

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Petshop\Especie;
use App\Models\Petshop\Medicamento;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class MedicamentosController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Medicamento::query()
            ->where('empresa_id', $empresaId)
            ->with(['produto.estoque', 'produto.estoqueLocais', 'especies'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery->where('nome_comercial', 'like', "%{$busca}%")
                        ->orWhere('nome_generico', 'like', "%{$busca}%")
                        ->orWhere('indicacoes', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('classe_terapeutica'), fn ($q) => $q->where('classe_terapeutica', $request->string('classe_terapeutica')->toString()))
            ->when($request->filled('via_administracao'), fn ($q) => $q->where('via_administracao', $request->string('via_administracao')->toString()))
            ->orderBy('nome_comercial');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Medicamento $m) => $this->toV2Payload($m))->values(),
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

        $produtos = Produto::query()
            ->where('empresa_id', $empresaId)
            ->with(['estoque', 'estoqueLocais'])
            ->orderBy('nome')
            ->get(['id', 'nome', 'estoque_minimo', 'gerenciar_estoque', 'valor_unitario'])
            ->map(function (Produto $p) {
                [$atual, $minimo] = $this->resolverEstoque($p);

                return [
                    'id' => (string) $p->id,
                    'label' => (string) $this->formatarRotuloProduto($p),
                    'current_stock' => (float) $atual,
                    'minimum_stock' => (float) $minimo,
                ];
            })
            ->values();

        $especies = Especie::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($e) => ['id' => (string) $e->id, 'label' => (string) $e->nome])
            ->values();

        $classeTerapeuticaOptions = array_values(array_filter(array_keys(Medicamento::opcoesCategoriasTerapeuticas()), fn ($k) => $k !== '__custom__'));
        $viaAdministracaoOptions = array_values(array_filter(array_keys(Medicamento::opcoesViasAdministracao()), fn ($k) => $k !== '__custom__'));
        $apresentacaoOptions = array_values(array_filter(array_keys(Medicamento::opcoesApresentacoes()), fn ($k) => $k !== '__custom__'));
        $formaDispensacaoOptions = array_values(array_filter(array_keys(Medicamento::opcoesFormasDispensacao()), fn ($k) => $k !== '__custom__'));
        $restricaoIdadeOptions = array_values(array_filter(array_keys(Medicamento::opcoesRestricoesIdade()), fn ($k) => $k !== '__custom__'));
        $condicaoArmazenamentoOptions = array_values(array_filter(array_keys(Medicamento::opcoesCondicoesArmazenamento()), fn ($k) => $k !== '__custom__'));

        return response()->json([
            'produtos' => $produtos,
            'especies' => $especies,
            'classeTerapeuticaOptions' => $classeTerapeuticaOptions,
            'classificacaoControleQuickOptions' => ['Não controlado', 'Tarja vermelha', 'Tarja preta'],
            'viaAdministracaoOptions' => $viaAdministracaoOptions,
            'apresentacaoOptions' => $apresentacaoOptions,
            'formaDispensacaoOptions' => $formaDispensacaoOptions,
            'restricaoIdadeOptions' => $restricaoIdadeOptions,
            'condicaoArmazenamentoOptions' => $condicaoArmazenamentoOptions,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = Medicamento::query()
            ->where('empresa_id', $empresaId)
            ->with(['produto.estoque', 'produto.estoqueLocais', 'especies'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($m));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'produto_id' => ['nullable'],
            'nome_comercial' => ['required', 'string', 'max:255'],
            'nome_generico' => ['required', 'string', 'max:255'],
            'classe_terapeutica' => ['required', 'string', 'max:255'],
            'classe_farmacologica' => ['required', 'string', 'max:255'],
            'classificacao_controle' => ['nullable', 'string', 'max:255'],
            'via_administracao' => ['required', 'string', 'max:255'],
            'apresentacao' => ['required', 'string', 'max:255'],
            'concentracao' => ['required', 'string', 'max:255'],
            'forma_dispensacao' => ['required', 'string', 'max:255'],
            'dosagem' => ['required', 'string', 'max:255'],
            'frequencia' => ['required', 'string', 'max:255'],
            'duracao' => ['nullable', 'string', 'max:255'],
            'restricao_idade' => ['nullable', 'string', 'max:255'],
            'condicao_armazenamento' => ['required', 'string', 'max:255'],
            'validade' => ['nullable', 'string', 'max:255'],
            'fornecedor' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255'],
            'indicacoes' => ['required', 'string'],
            'contraindicacoes' => ['nullable', 'string'],
            'efeitos_adversos' => ['nullable', 'string'],
            'interacoes' => ['nullable', 'string'],
            'monitoramento' => ['nullable', 'string'],
            'orientacoes_tutor' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
            'status' => ['required', 'in:ativo,inativo'],
            'especies' => ['array'],
        ]);

        $produtoId = $this->normalizeProdutoId($request->input('produto_id'));
        $status = $request->input('status') === 'inativo' ? 'Inativo' : 'Ativo';

        try {
            DB::beginTransaction();

            $m = Medicamento::create(array_merge($validated, [
                'empresa_id' => $empresaId,
                'produto_id' => $produtoId,
                'status' => $status,
            ]));

            $m->especies()->sync($request->input('especies', []));

            if ($produtoId) {
                $produto = Produto::with('medicamentoVeterinario')->find($produtoId);
                if ($produto) {
                    $produto->medicamento_veterinario_id = $m->id;
                    $produto->save();
                }
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar o medicamento.'], 422);
        }

        return response()->json(['id' => (string) $m->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'produto_id' => ['nullable'],
            'nome_comercial' => ['required', 'string', 'max:255'],
            'nome_generico' => ['required', 'string', 'max:255'],
            'classe_terapeutica' => ['required', 'string', 'max:255'],
            'classe_farmacologica' => ['required', 'string', 'max:255'],
            'classificacao_controle' => ['nullable', 'string', 'max:255'],
            'via_administracao' => ['required', 'string', 'max:255'],
            'apresentacao' => ['required', 'string', 'max:255'],
            'concentracao' => ['required', 'string', 'max:255'],
            'forma_dispensacao' => ['required', 'string', 'max:255'],
            'dosagem' => ['required', 'string', 'max:255'],
            'frequencia' => ['required', 'string', 'max:255'],
            'duracao' => ['nullable', 'string', 'max:255'],
            'restricao_idade' => ['nullable', 'string', 'max:255'],
            'condicao_armazenamento' => ['required', 'string', 'max:255'],
            'validade' => ['nullable', 'string', 'max:255'],
            'fornecedor' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255'],
            'indicacoes' => ['required', 'string'],
            'contraindicacoes' => ['nullable', 'string'],
            'efeitos_adversos' => ['nullable', 'string'],
            'interacoes' => ['nullable', 'string'],
            'monitoramento' => ['nullable', 'string'],
            'orientacoes_tutor' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
            'status' => ['required', 'in:ativo,inativo'],
            'especies' => ['array'],
        ]);

        $produtoId = $this->normalizeProdutoId($request->input('produto_id'));
        $status = $request->input('status') === 'inativo' ? 'Inativo' : 'Ativo';

        $m = Medicamento::query()->where('empresa_id', $empresaId)->with('produto')->findOrFail($id);

        try {
            DB::beginTransaction();

            if ($m->produto && $produtoId && (int) $m->produto->id !== (int) $produtoId) {
                $m->produto->medicamento_veterinario_id = null;
                $m->produto->save();
            }

            $m->fill(array_merge($validated, [
                'produto_id' => $produtoId,
                'status' => $status,
            ]));
            $m->save();

            $m->especies()->sync($request->input('especies', []));

            if ($produtoId) {
                $produto = Produto::with('medicamentoVeterinario')->find($produtoId);
                if ($produto) {
                    $produto->medicamento_veterinario_id = $m->id;
                    $produto->save();
                }
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o medicamento.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Medicamento $m): array
    {
        return [
            'id' => (string) $m->id,
            'produto_id' => $m->produto_id ? (string) $m->produto_id : '',
            'nome_comercial' => (string) ($m->nome_comercial ?? ''),
            'nome_generico' => (string) ($m->nome_generico ?? ''),
            'classe_terapeutica' => (string) ($m->classe_terapeutica ?? ''),
            'classe_farmacologica' => (string) ($m->classe_farmacologica ?? ''),
            'classificacao_controle' => (string) ($m->classificacao_controle ?? ''),
            'via_administracao' => (string) ($m->via_administracao ?? ''),
            'apresentacao' => (string) ($m->apresentacao ?? ''),
            'concentracao' => (string) ($m->concentracao ?? ''),
            'forma_dispensacao' => (string) ($m->forma_dispensacao ?? ''),
            'dosagem' => (string) ($m->dosagem ?? ''),
            'frequencia' => (string) ($m->frequencia ?? ''),
            'duracao' => (string) ($m->duracao ?? ''),
            'restricao_idade' => (string) ($m->restricao_idade ?? ''),
            'condicao_armazenamento' => (string) ($m->condicao_armazenamento ?? ''),
            'validade' => (string) ($m->validade ?? ''),
            'fornecedor' => (string) ($m->fornecedor ?? ''),
            'sku' => (string) ($m->sku ?? ''),
            'especies' => $m->relationLoaded('especies') ? $m->especies->pluck('id')->map(fn ($id) => (string) $id)->values()->all() : [],
            'indicacoes' => (string) ($m->indicacoes ?? ''),
            'contraindicacoes' => (string) ($m->contraindicacoes ?? ''),
            'efeitos_adversos' => (string) ($m->efeitos_adversos ?? ''),
            'interacoes' => (string) ($m->interacoes ?? ''),
            'monitoramento' => (string) ($m->monitoramento ?? ''),
            'orientacoes_tutor' => (string) ($m->orientacoes_tutor ?? ''),
            'observacoes' => (string) ($m->observacoes ?? ''),
            'status' => strtolower((string) ($m->status ?? 'Ativo')) === 'inativo' ? 'inativo' : 'ativo',
            'created_at' => optional($m->created_at)->toISOString(),
        ];
    }

    private function normalizeProdutoId(mixed $value): ?int
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return null;

        $id = (int) $raw;
        return $id > 0 ? $id : null;
    }

    private function resolverEstoque(Produto $produto): array
    {
        $estoques = $produto->relationLoaded('estoqueLocais') ? $produto->estoqueLocais : collect();

        if ($estoques->isEmpty() && $produto->relationLoaded('estoque') && $produto->estoque) {
            $estoques = collect([$produto->estoque]);
        }

        $atual = (float) $estoques->sum(fn ($estoque) => (float) ($estoque->quantidade ?? 0));
        $minimo = (float) ($produto->estoque_minimo ?? 0);

        return [$atual, $minimo];
    }

    private function formatarRotuloProduto(Produto $produto): string
    {
        $rotulo = (string) ($produto->nome ?? '');

        if (! is_null($produto->valor_unitario)) {
            $rotulo .= ' - R$ ' . __moeda($produto->valor_unitario);
        }

        return trim($rotulo);
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

