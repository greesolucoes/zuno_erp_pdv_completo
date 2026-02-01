<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\Apontamento;
use App\Models\Estoque;
use App\Utils\EstoqueUtil;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class ApontamentosController extends Controller
{
    public function __construct(private EstoqueUtil $util)
    {
    }

    public function options()
    {
        $empresaId = $this->getEmpresaId();

        $produtosCompostos = \App\Models\Produto::query()
            ->where('empresa_id', $empresaId)
            ->where('composto', 1)
            ->orderBy('nome')
            ->limit(500)
            ->get(['id', 'nome', 'numero_sequencial'])
            ->map(fn (\App\Models\Produto $p) => [
                'id' => (string) $p->id,
                'label' => trim(((int) ($p->numero_sequencial ?? 0) > 0 ? ((int) $p->numero_sequencial . ' - ') : '') . (string) ($p->nome ?? '')),
            ])
            ->values();

        return response()->json([
            'produtosCompostos' => $produtosCompostos,
        ]);
    }

    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $query = Apontamento::query()
            ->orderByDesc('created_at')
            ->select('apontamentos.*')
            ->join('produtos', 'produtos.id', '=', 'apontamentos.produto_id')
            ->where('produtos.empresa_id', $empresaId);

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Apontamento $a) => $this->toV2Payload($a))->values(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'produto_composto_id' => ['required', 'string'],
            'quantidade' => ['required', 'string'],
        ]);

        try {
            DB::beginTransaction();

            $produtoId = (int) $validated['produto_composto_id'];
            $quantidade = $this->parseNumberBr((string) $validated['quantidade']);

            $verificaMessage = $this->util->verificaEstoqueComposicao($produtoId, $quantidade);
            if ($verificaMessage !== '') {
                DB::rollBack();
                return response()->json(['message' => $verificaMessage], 422);
            }

            $apontamento = Apontamento::create([
                'produto_id' => $produtoId,
                'quantidade' => $quantidade,
            ]);

            $this->util->reduzComposicao($produtoId, $quantidade);

            $this->util->movimentacaoProduto(
                $produtoId,
                $quantidade,
                'incremento',
                $apontamento->id,
                'alteracao_estoque',
                (int) (Auth::user()?->id ?? 0),
            );

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível realizar o apontamento.'], 422);
        }

        return response()->json(['id' => (string) $apontamento->id], 201);
    }

    public function imprimir(string $id)
    {
        // Mantém o mesmo PDF do legado (rota web), só retornando a URL para abrir em nova aba.
        return response()->json([
            'url' => route('apontamento.imprimir', ['id' => $id]),
        ]);
    }

    private function toV2Payload(Apontamento $a): array
    {
        return [
            'id' => (string) $a->id,
            'produto_id' => (string) ($a->produto_id ?? ''),
            'produto_nome' => (string) ($a->produto?->nome ?? ''),
            'quantidade' => (string) ((float) ($a->quantidade ?? 0)),
            'created_at' => optional($a->created_at)->toISOString(),
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
