<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaProduto;
use App\Models\Estoque;
use App\Models\Localizacao;
use App\Models\Produto;
use App\Models\ProdutoLocalizacao;
use App\Utils\EstoqueUtil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class EstoqueController extends Controller
{
    public function __construct(private EstoqueUtil $util)
    {
    }

    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $locaisUsuario = __getLocaisAtivoUsuario();
        $locaisIds = $locaisUsuario->pluck('id')->all();

        $buscaProduto = trim((string) ($request->input('produto') ?? $request->input('busca') ?? ''));
        $categoriaId = $request->input('categoria_id');
        $localId = $request->input('local_id');

        $query = Estoque::query()
            ->select('estoques.*', 'produtos.nome as produto_nome', 'localizacaos.descricao as localizacao_nome')
            ->join('produtos', 'produtos.id', '=', 'estoques.produto_id')
            ->join('localizacaos', 'localizacaos.id', '=', 'estoques.local_id')
            ->where('produtos.empresa_id', $empresaId)
            ->when($buscaProduto !== '', fn ($q) => $q->where('produtos.nome', 'like', "%{$buscaProduto}%"))
            ->when($categoriaId, fn ($q) => $q->where('produtos.categoria_id', (int) $categoriaId))
            ->when($localId, function ($q) use ($localId) {
                $q->join('produto_localizacaos', 'produto_localizacaos.produto_id', '=', 'produtos.id')
                    ->where('estoques.local_id', (int) $localId);
            })
            ->when(!$localId, function ($q) use ($locaisIds) {
                $q->join('produto_localizacaos', 'produto_localizacaos.produto_id', '=', 'produtos.id')
                    ->whereIn('produto_localizacaos.localizacao_id', $locaisIds);
            })
            ->orderBy('produtos.nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Estoque $e) => $this->toV2Payload($e))->values(),
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
            ->orderBy('nome')
            ->limit(500)
            ->get(['id', 'nome', 'numero_sequencial'])
            ->map(fn (Produto $p) => [
                'id' => (string) $p->id,
                'label' => trim(((int) ($p->numero_sequencial ?? 0) > 0 ? ((int) $p->numero_sequencial . ' - ') : '') . (string) ($p->nome ?? '')),
            ])
            ->values();

        $categorias = CategoriaProduto::query()
            ->where('empresa_id', $empresaId)
            ->whereNull('categoria_id')
            ->where('status', 1)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (CategoriaProduto $c) => ['id' => (string) $c->id, 'label' => (string) ($c->nome ?? '')])
            ->values();

        $locaisUsuario = __getLocaisAtivoUsuario()
            ->map(fn ($l) => ['id' => (string) $l->id, 'label' => (string) ($l->descricao ?? '')])
            ->values();

        $multiLocal = __countLocalAtivo() > 1 ? 1 : 0;

        return response()->json([
            'produtos' => $produtos,
            'categorias' => $categorias,
            'locais' => $locaisUsuario,
            'multiLocal' => $multiLocal,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $e = Estoque::query()
            ->with(['produto', 'local'])
            ->whereHas('produto', fn ($q) => $q->where('empresa_id', $empresaId))
            ->findOrFail($id);

        return response()->json($this->toV2Payload($e));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $produtoId = (int) $validated['produto_id'];
            $localId = isset($validated['local_id']) && $validated['local_id'] !== '' ? (int) $validated['local_id'] : null;
            $variacaoId = isset($validated['produto_variacao_id']) && $validated['produto_variacao_id'] !== '' ? (int) $validated['produto_variacao_id'] : null;

            $produto = Produto::query()->where('empresa_id', $empresaId)->findOrFail($produtoId);

            if ($localId !== null) {
                ProdutoLocalizacao::updateOrCreate([
                    'produto_id' => $produtoId,
                    'localizacao_id' => $localId,
                ]);
            }

            $quantidade = $this->parseNumberBr((string) ($validated['quantidade'] ?? '0'));
            $this->util->incrementaEstoque($produtoId, $quantidade, $variacaoId, $localId);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível adicionar estoque.'], 422);
        }

        return response()->json(['ok' => true], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $request->validate([
            'quantidade' => ['required', 'string'],
        ]);

        $item = Estoque::query()
            ->with(['produto'])
            ->whereHas('produto', fn ($q) => $q->where('empresa_id', $empresaId))
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $novaQuantidade = $this->parseNumberBr((string) $validated['quantidade']);

            $diferenca = 0;
            $tipo = 'incremento';

            if ((float) $item->quantidade > $novaQuantidade) {
                $diferenca = (float) $item->quantidade - $novaQuantidade;
                $tipo = 'reducao';
            } else {
                $diferenca = $novaQuantidade - (float) $item->quantidade;
            }

            $item->quantidade = $novaQuantidade;
            $item->save();

            $this->util->movimentacaoProduto(
                $item->produto_id,
                $diferenca,
                $tipo,
                $item->id,
                'alteracao_estoque',
                (int) (Auth::user()?->id ?? 0),
                $item->produto_variacao_id,
            );

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o estoque.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $item = Estoque::query()
            ->with(['produto'])
            ->whereHas('produto', fn ($q) => $q->where('empresa_id', $empresaId))
            ->findOrFail($id);

        try {
            $item->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir o estoque.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Estoque $e): array
    {
        $produto = $e->produto ?? null;
        $local = $e->local ?? null;

        return [
            'id' => (string) $e->id,
            'produto_id' => (string) ($e->produto_id ?? ''),
            'produto_numero' => (string) ((int) ($produto?->numero_sequencial ?? 0)),
            'produto_nome' => (string) ($produto?->nome ?? ''),
            'categoria_nome' => (string) ($produto?->categoria?->nome ?? ''),
            'quantidade' => (string) ((float) ($e->quantidade ?? 0)),
            'valor_venda' => number_format((float) ($produto?->valor_unitario ?? 0), 2, ',', '.'),
            'unidade' => (string) ($produto?->unidade ?? ''),
            'local_id' => (string) ($e->local_id ?? ''),
            'local_nome' => (string) ($local?->descricao ?? ''),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'produto_id' => ['required', 'string'],
            'quantidade' => ['required', 'string'],
            'produto_variacao_id' => ['nullable', 'string'],
            'local_id' => ['nullable', 'string'],
        ]);
    }

    private function parseNumberBr(string $input): float
    {
        $normalized = preg_replace('/[^0-9,.-]/', '', $input);
        $normalized = str_replace('.', '', (string) $normalized);
        $normalized = str_replace(',', '.', (string) $normalized);
        return is_numeric($normalized) ? (float) $normalized : 0.0;
    }

    private function getEmpresaId(): int
    {
        return (int) (Auth::user()?->empresa?->empresa_id ?? 0);
    }
}
