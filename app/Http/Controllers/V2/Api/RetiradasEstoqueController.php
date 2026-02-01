<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\Estoque;
use App\Models\RetiradaEstoque;
use App\Utils\EstoqueUtil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class RetiradasEstoqueController extends Controller
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
        $localId = $request->input('local_id');

        $query = RetiradaEstoque::query()
            ->where('retirada_estoques.empresa_id', $empresaId)
            ->select('retirada_estoques.*')
            ->join('produtos', 'produtos.id', '=', 'retirada_estoques.produto_id')
            ->when($buscaProduto !== '', fn ($q) => $q->where('produtos.nome', 'like', "%{$buscaProduto}%"))
            ->when($localId, function ($q) use ($localId) {
                $q->join('produto_localizacaos', 'produto_localizacaos.produto_id', '=', 'produtos.id')
                    ->where('retirada_estoques.local_id', (int) $localId);
            })
            ->when(!$localId, function ($q) use ($locaisIds) {
                $q->join('produto_localizacaos', 'produto_localizacaos.produto_id', '=', 'produtos.id')
                    ->whereIn('produto_localizacaos.localizacao_id', $locaisIds);
            })
            ->orderByDesc('retirada_estoques.id');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (RetiradaEstoque $r) => $this->toV2Payload($r))->values(),
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

        $produtos = \App\Models\Produto::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->limit(500)
            ->get(['id', 'nome', 'numero_sequencial'])
            ->map(fn (\App\Models\Produto $p) => [
                'id' => (string) $p->id,
                'label' => trim(((int) ($p->numero_sequencial ?? 0) > 0 ? ((int) $p->numero_sequencial . ' - ') : '') . (string) ($p->nome ?? '')),
            ])
            ->values();

        $locaisUsuario = __getLocaisAtivoUsuario()
            ->map(fn ($l) => ['id' => (string) $l->id, 'label' => (string) ($l->descricao ?? '')])
            ->values();

        $multiLocal = __countLocalAtivo() > 1 ? 1 : 0;

        $motivos = [];
        foreach (RetiradaEstoque::motivos() as $key => $label) {
            $motivos[] = ['value' => (string) $key, 'label' => (string) $label];
        }

        return response()->json([
            'produtos' => $produtos,
            'locais' => $locaisUsuario,
            'multiLocal' => $multiLocal,
            'motivos' => $motivos,
        ]);
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $request->validate([
            'produto_id' => ['required', 'string'],
            'quantidade' => ['required', 'string'],
            'motivo' => ['required', 'string'],
            'observacao' => ['nullable', 'string'],
            'local_id' => ['nullable', 'string'],
            'produto_variacao_id' => ['nullable', 'string'],
        ]);

        try {
            DB::beginTransaction();

            $produtoId = (int) $validated['produto_id'];
            $localId = isset($validated['local_id']) && $validated['local_id'] !== '' ? (int) $validated['local_id'] : null;
            $variacaoId = isset($validated['produto_variacao_id']) && $validated['produto_variacao_id'] !== '' ? (int) $validated['produto_variacao_id'] : null;
            $quantidade = $this->parseNumberBr((string) ($validated['quantidade'] ?? '0'));

            $estoqueAtual = Estoque::query()
                ->where('produto_id', $produtoId)
                ->when($variacaoId, fn ($q) => $q->where('produto_variacao_id', $variacaoId))
                ->when($localId, fn ($q) => $q->where('local_id', $localId))
                ->first();

            if ($estoqueAtual === null) {
                return response()->json(['message' => 'Estoque não encontrado.'], 422);
            }

            if ((float) $estoqueAtual->quantidade < $quantidade) {
                return response()->json(['message' => 'Estoque insuficiente.'], 422);
            }

            $retirada = RetiradaEstoque::create([
                'empresa_id' => $empresaId,
                'produto_id' => $produtoId,
                'quantidade' => $quantidade,
                'motivo' => (string) $validated['motivo'],
                'observacao' => (string) ($validated['observacao'] ?? ''),
                'local_id' => $localId,
                'produto_variacao_id' => $variacaoId,
            ]);

            $this->util->reduzEstoque($produtoId, $quantidade, $variacaoId, $localId);

            $transacao = Estoque::where('produto_id', $produtoId)->orderBy('id', 'desc')->first();
            $codigo_transacao = $transacao?->id ?? 0;

            $this->util->movimentacaoProduto(
                $produtoId,
                $quantidade,
                'incremento',
                $codigo_transacao,
                'alteracao_estoque',
                (int) (Auth::user()?->id ?? 0),
                $variacaoId,
            );

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível registrar a retirada.'], 422);
        }

        return response()->json(['id' => (string) $retirada->id], 201);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $item = RetiradaEstoque::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::transaction(function () use ($item) {
                $this->util->incrementaEstoque($item->produto_id, $item->quantidade, $item->produto_variacao_id, $item->local_id);

                $transacao = Estoque::where('produto_id', $item->produto_id)->orderBy('id', 'desc')->first();
                $codigo_transacao = $transacao?->id ?? 0;

                $this->util->movimentacaoProduto(
                    $item->produto_id,
                    $item->quantidade,
                    'incremento',
                    $codigo_transacao,
                    'alteracao_estoque',
                    (int) (Auth::user()?->id ?? 0),
                    $item->produto_variacao_id,
                );

                $item->delete();
            });
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a retirada.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(RetiradaEstoque $r): array
    {
        return [
            'id' => (string) $r->id,
            'produto_id' => (string) ($r->produto_id ?? ''),
            'produto_nome' => (string) ($r->produto?->nome ?? ''),
            'quantidade' => (string) ((float) ($r->quantidade ?? 0)),
            'motivo' => (string) ($r->motivo ?? ''),
            'observacao' => (string) ($r->observacao ?? ''),
            'local_id' => (string) ($r->local_id ?? ''),
            'created_at' => optional($r->created_at)->toISOString(),
        ];
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
