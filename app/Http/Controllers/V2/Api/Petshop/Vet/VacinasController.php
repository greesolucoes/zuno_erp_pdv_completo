<?php

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Petshop\Especie;
use App\Models\Petshop\Vacina;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class VacinasController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Vacina::query()
            ->where('empresa_id', $empresaId)
            ->with(['produto.estoque', 'produto.estoqueLocais', 'especies'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery->where('nome', 'like', "%{$busca}%")
                        ->orWhere('codigo', 'like', "%{$busca}%")
                        ->orWhere('grupo_vacinal', 'like', "%{$busca}%")
                        ->orWhere('categoria', 'like', "%{$busca}%")
                        ->orWhere('coberturas', 'like', "%{$busca}%")
                        ->orWhere('tags', 'like', "%{$busca}%")
                        ->orWhere('fabricante', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('group'), fn ($q) => $q->where('grupo_vacinal', $request->string('group')->toString()))
            ->orderBy('nome');

        $speciesFilter = $this->normalizeArrayOfIds($request->input('species'));
        if (! empty($speciesFilter)) {
            $query->whereHas('especies', fn ($q) => $q->whereIn('animais_especies.id', $speciesFilter));
        }

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Vacina $v) => $this->toV2Payload($v))->values(),
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
            ->get(['id', 'nome', 'estoque_minimo', 'valor_unitario'])
            ->map(function (Produto $p) {
                [$atual, $minimo] = $this->resolverEstoque($p);

                return [
                    'id' => (string) $p->id,
                    'label' => (string) $this->formatarRotuloProduto($p),
                    'inventory_current_stock' => (float) $atual,
                    'inventory_minimum_stock' => (float) $minimo,
                    'inventory_safety_stock' => 0.0,
                    'inventory_reserved_doses' => 0.0,
                ];
            })
            ->values();

        $especies = Especie::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($e) => ['id' => (string) $e->id, 'label' => (string) $e->nome])
            ->values();

        return response()->json([
            'products' => $produtos,
            'species' => $especies,
            'statusOptions' => [
                ['value' => 'ativa', 'label' => 'Ativa'],
                ['value' => 'inativa', 'label' => 'Inativa'],
            ],
            'groupOptions' => array_values(Vacina::opcoesGrupos()),
            'categoryOptions' => array_values(Vacina::opcoesCategorias()),
            'manufacturerOptions' => array_values(Vacina::opcoesFabricantes()),
            'presentationOptions' => array_values(Vacina::opcoesApresentacoes()),
            'minimumAgeOptions' => array_values(Vacina::opcoesIdadesMinimas()),
            'boosterIntervalOptions' => array_values(Vacina::opcoesIntervalosReforco()),
            'routeOptions' => array_values(Vacina::opcoesViasAdministracao()),
            'applicationSiteOptions' => array_values(Vacina::opcoesLocaisAplicacao()),
            'storageConditionOptions' => array_values(Vacina::opcoesCondicoesArmazenamento()),
            'documentationOptions' => array_values(Vacina::opcoesDocumentos()),
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $v = Vacina::query()
            ->where('empresa_id', $empresaId)
            ->with(['produto.estoque', 'produto.estoqueLocais', 'especies'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($v));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'product_id' => ['required'],
            'species' => ['array', 'min:1'],
            'status' => ['required', 'in:ativa,inativa'],
            'group' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'registration' => ['nullable', 'string', 'max:255'],
            'presentation' => ['nullable', 'string', 'max:255'],
            'concentration' => ['nullable', 'string', 'max:255'],
            'minimum_age' => ['nullable', 'string', 'max:255'],
            'booster_interval' => ['nullable', 'string', 'max:255'],
            'route' => ['nullable', 'string', 'max:255'],
            'dosage' => ['nullable', 'string', 'max:255'],
            'application_site' => ['nullable', 'string', 'max:255'],
            'coverage' => ['required', 'string'],
            'protocol_primary' => ['nullable', 'string'],
            'protocol_booster' => ['nullable', 'string'],
            'protocol_revaccination' => ['nullable', 'string'],
            'pre_vaccination_requirements' => ['nullable', 'string'],
            'post_vaccination_guidance' => ['nullable', 'string'],
            'adverse_effects' => ['nullable', 'string'],
            'contraindications' => ['nullable', 'string'],
            'validity_closed' => ['nullable', 'string', 'max:255'],
            'validity_opened' => ['nullable', 'string', 'max:255'],
            'storage_condition' => ['nullable', 'string', 'max:255'],
            'storage_temperature' => ['nullable', 'string', 'max:255'],
            'inventory_wastage_limit' => ['nullable', 'string', 'max:255'],
            'inventory_lead_time' => ['nullable', 'string', 'max:255'],
            'storage_alerts' => ['nullable', 'string', 'max:255'],
            'documentation' => ['array'],
            'tags' => ['array'],
            'notes' => ['nullable', 'string'],
        ]);

        $produtoId = $this->normalizeProdutoId($validated['product_id'] ?? null);
        abort_unless($produtoId, 422, 'Produto inválido.');

        try {
            DB::beginTransaction();

            $v = Vacina::create([
                'empresa_id' => $empresaId,
                'produto_id' => $produtoId,
                'codigo' => (string) ($validated['code'] ?? ''),
                'nome' => $this->inferNomeFromProduto($produtoId),
                'status' => (string) ($validated['status'] ?? 'ativa'),
                'grupo_vacinal' => (string) ($validated['group'] ?? ''),
                'categoria' => (string) ($validated['category'] ?? ''),
                'fabricante' => (string) ($validated['manufacturer'] ?? ''),
                'registro_mapa' => (string) ($validated['registration'] ?? ''),
                'apresentacao' => (string) ($validated['presentation'] ?? ''),
                'concentracao' => (string) ($validated['concentration'] ?? ''),
                'idade_minima' => (string) ($validated['minimum_age'] ?? ''),
                'intervalo_reforco' => (string) ($validated['booster_interval'] ?? ''),
                'via_administracao' => (string) ($validated['route'] ?? ''),
                'dosagem' => (string) ($validated['dosage'] ?? ''),
                'local_aplicacao' => (string) ($validated['application_site'] ?? ''),
                'coberturas' => (string) ($validated['coverage'] ?? ''),
                'protocolo_inicial' => (string) ($validated['protocol_primary'] ?? ''),
                'protocolo_reforco' => (string) ($validated['protocol_booster'] ?? ''),
                'protocolo_revacinar' => (string) ($validated['protocol_revaccination'] ?? ''),
                'requisitos_pre_vacinacao' => (string) ($validated['pre_vaccination_requirements'] ?? ''),
                'orientacoes_pos_vacinacao' => (string) ($validated['post_vaccination_guidance'] ?? ''),
                'efeitos_adversos' => (string) ($validated['adverse_effects'] ?? ''),
                'contraindicacoes' => (string) ($validated['contraindications'] ?? ''),
                'validade_fechada' => (string) ($validated['validity_closed'] ?? ''),
                'validade_aberta' => (string) ($validated['validity_opened'] ?? ''),
                'condicao_armazenamento' => (string) ($validated['storage_condition'] ?? ''),
                'temperatura_armazenamento' => (string) ($validated['storage_temperature'] ?? ''),
                'limite_perdas' => (string) ($validated['inventory_wastage_limit'] ?? ''),
                'tempo_reposicao' => (string) ($validated['inventory_lead_time'] ?? ''),
                'alertas_armazenamento' => (string) ($validated['storage_alerts'] ?? ''),
                'documentos' => $this->normalizeStringArray($validated['documentation'] ?? []),
                'tags' => $this->normalizeStringArray($validated['tags'] ?? []),
                'observacoes' => (string) ($validated['notes'] ?? ''),
            ]);

            $v->especies()->sync($this->normalizeArrayOfIds($validated['species'] ?? []));

            $produto = Produto::find($produtoId);
            if ($produto) {
                $produto->vacina_veterinaria_id = $v->id;
                $produto->save();
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a vacina.'], 422);
        }

        return response()->json(['id' => (string) $v->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255'],
            'product_id' => ['required'],
            'species' => ['array', 'min:1'],
            'status' => ['required', 'in:ativa,inativa'],
            'group' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'registration' => ['nullable', 'string', 'max:255'],
            'presentation' => ['nullable', 'string', 'max:255'],
            'concentration' => ['nullable', 'string', 'max:255'],
            'minimum_age' => ['nullable', 'string', 'max:255'],
            'booster_interval' => ['nullable', 'string', 'max:255'],
            'route' => ['nullable', 'string', 'max:255'],
            'dosage' => ['nullable', 'string', 'max:255'],
            'application_site' => ['nullable', 'string', 'max:255'],
            'coverage' => ['required', 'string'],
            'protocol_primary' => ['nullable', 'string'],
            'protocol_booster' => ['nullable', 'string'],
            'protocol_revaccination' => ['nullable', 'string'],
            'pre_vaccination_requirements' => ['nullable', 'string'],
            'post_vaccination_guidance' => ['nullable', 'string'],
            'adverse_effects' => ['nullable', 'string'],
            'contraindications' => ['nullable', 'string'],
            'validity_closed' => ['nullable', 'string', 'max:255'],
            'validity_opened' => ['nullable', 'string', 'max:255'],
            'storage_condition' => ['nullable', 'string', 'max:255'],
            'storage_temperature' => ['nullable', 'string', 'max:255'],
            'inventory_wastage_limit' => ['nullable', 'string', 'max:255'],
            'inventory_lead_time' => ['nullable', 'string', 'max:255'],
            'storage_alerts' => ['nullable', 'string', 'max:255'],
            'documentation' => ['array'],
            'tags' => ['array'],
            'notes' => ['nullable', 'string'],
        ]);

        $produtoId = $this->normalizeProdutoId($validated['product_id'] ?? null);
        abort_unless($produtoId, 422, 'Produto inválido.');

        $v = Vacina::query()
            ->where('empresa_id', $empresaId)
            ->with('produto')
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            if ($v->produto && $produtoId && (int) $v->produto->id !== (int) $produtoId) {
                $v->produto->vacina_veterinaria_id = null;
                $v->produto->save();
            }

            $v->fill([
                'produto_id' => $produtoId,
                'codigo' => (string) ($validated['code'] ?? ''),
                'nome' => $this->inferNomeFromProduto($produtoId),
                'status' => (string) ($validated['status'] ?? 'ativa'),
                'grupo_vacinal' => (string) ($validated['group'] ?? ''),
                'categoria' => (string) ($validated['category'] ?? ''),
                'fabricante' => (string) ($validated['manufacturer'] ?? ''),
                'registro_mapa' => (string) ($validated['registration'] ?? ''),
                'apresentacao' => (string) ($validated['presentation'] ?? ''),
                'concentracao' => (string) ($validated['concentration'] ?? ''),
                'idade_minima' => (string) ($validated['minimum_age'] ?? ''),
                'intervalo_reforco' => (string) ($validated['booster_interval'] ?? ''),
                'via_administracao' => (string) ($validated['route'] ?? ''),
                'dosagem' => (string) ($validated['dosage'] ?? ''),
                'local_aplicacao' => (string) ($validated['application_site'] ?? ''),
                'coberturas' => (string) ($validated['coverage'] ?? ''),
                'protocolo_inicial' => (string) ($validated['protocol_primary'] ?? ''),
                'protocolo_reforco' => (string) ($validated['protocol_booster'] ?? ''),
                'protocolo_revacinar' => (string) ($validated['protocol_revaccination'] ?? ''),
                'requisitos_pre_vacinacao' => (string) ($validated['pre_vaccination_requirements'] ?? ''),
                'orientacoes_pos_vacinacao' => (string) ($validated['post_vaccination_guidance'] ?? ''),
                'efeitos_adversos' => (string) ($validated['adverse_effects'] ?? ''),
                'contraindicacoes' => (string) ($validated['contraindications'] ?? ''),
                'validade_fechada' => (string) ($validated['validity_closed'] ?? ''),
                'validade_aberta' => (string) ($validated['validity_opened'] ?? ''),
                'condicao_armazenamento' => (string) ($validated['storage_condition'] ?? ''),
                'temperatura_armazenamento' => (string) ($validated['storage_temperature'] ?? ''),
                'limite_perdas' => (string) ($validated['inventory_wastage_limit'] ?? ''),
                'tempo_reposicao' => (string) ($validated['inventory_lead_time'] ?? ''),
                'alertas_armazenamento' => (string) ($validated['storage_alerts'] ?? ''),
                'documentos' => $this->normalizeStringArray($validated['documentation'] ?? []),
                'tags' => $this->normalizeStringArray($validated['tags'] ?? []),
                'observacoes' => (string) ($validated['notes'] ?? ''),
            ]);
            $v->save();

            $v->especies()->sync($this->normalizeArrayOfIds($validated['species'] ?? []));

            $produto = Produto::find($produtoId);
            if ($produto) {
                $produto->vacina_veterinaria_id = $v->id;
                $produto->save();
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a vacina.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $v = Vacina::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $v->especies()->detach();

            Produto::where('vacina_veterinaria_id', $v->id)->update(['vacina_veterinaria_id' => null]);

            $v->delete();

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível remover a vacina.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Vacina $v): array
    {
        $tags = array_values(array_filter(array_map('strval', $v->tags ?? []), fn ($t) => trim($t) !== ''));

        return [
            'id' => (string) $v->id,
            'code' => (string) ($v->codigo ?? ''),
            'product_id' => $v->produto_id ? (string) $v->produto_id : '',
            'species' => $v->relationLoaded('especies') ? $v->especies->pluck('id')->map(fn ($id) => (string) $id)->values()->all() : [],
            'status' => (string) (($v->status ?? '') === 'inativa' ? 'inativa' : 'ativa'),
            'group' => (string) ($v->grupo_vacinal ?? ''),
            'category' => (string) ($v->categoria ?? ''),
            'manufacturer' => (string) ($v->fabricante ?? ''),
            'registration' => (string) ($v->registro_mapa ?? ''),
            'presentation' => (string) ($v->apresentacao ?? ''),
            'concentration' => (string) ($v->concentracao ?? ''),
            'minimum_age' => (string) ($v->idade_minima ?? ''),
            'booster_interval' => (string) ($v->intervalo_reforco ?? ''),
            'route' => (string) ($v->via_administracao ?? ''),
            'dosage' => (string) ($v->dosagem ?? ''),
            'application_site' => (string) ($v->local_aplicacao ?? ''),
            'coverage' => (string) ($v->coberturas ?? ''),
            'protocol_primary' => (string) ($v->protocolo_inicial ?? ''),
            'protocol_booster' => (string) ($v->protocolo_reforco ?? ''),
            'protocol_revaccination' => (string) ($v->protocolo_revacinar ?? ''),
            'pre_vaccination_requirements' => (string) ($v->requisitos_pre_vacinacao ?? ''),
            'post_vaccination_guidance' => (string) ($v->orientacoes_pos_vacinacao ?? ''),
            'adverse_effects' => (string) ($v->efeitos_adversos ?? ''),
            'contraindications' => (string) ($v->contraindicacoes ?? ''),
            'validity_closed' => (string) ($v->validade_fechada ?? ''),
            'validity_opened' => (string) ($v->validade_aberta ?? ''),
            'storage_condition' => (string) ($v->condicao_armazenamento ?? ''),
            'storage_temperature' => (string) ($v->temperatura_armazenamento ?? ''),
            'inventory_wastage_limit' => (string) ($v->limite_perdas ?? ''),
            'inventory_lead_time' => (string) ($v->tempo_reposicao ?? ''),
            'storage_alerts' => (string) ($v->alertas_armazenamento ?? ''),
            'documentation' => array_values(array_filter(array_map('strval', $v->documentos ?? []), fn ($d) => trim($d) !== '')),
            'tagsText' => implode(', ', $tags),
            'tags' => $tags,
            'notes' => (string) ($v->observacoes ?? ''),
            'created_at' => optional($v->created_at)->toISOString(),
        ];
    }

    private function normalizeProdutoId(mixed $value): ?int
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return null;

        $id = (int) $raw;
        return $id > 0 ? $id : null;
    }

    private function normalizeArrayOfIds(mixed $value): array
    {
        if (! is_array($value)) return [];

        $ids = [];
        foreach ($value as $item) {
            $raw = trim((string) ($item ?? ''));
            if ($raw === '') continue;
            $id = (int) $raw;
            if ($id > 0) $ids[] = $id;
        }

        return array_values(array_unique($ids));
    }

    private function normalizeStringArray(mixed $value): array
    {
        if (! is_array($value)) return [];

        $out = [];
        foreach ($value as $item) {
            $raw = trim((string) ($item ?? ''));
            if ($raw === '') continue;
            $out[] = $raw;
        }

        return array_values(array_unique($out));
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

    private function inferNomeFromProduto(int $produtoId): string
    {
        $produto = Produto::find($produtoId);

        return (string) ($produto?->nome ?? '');
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

