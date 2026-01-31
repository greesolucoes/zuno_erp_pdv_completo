<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaProduto;
use App\Models\Produto;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProdutosController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Produto::query()
            ->where('empresa_id', $empresaId)
            ->with(['categoria'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($sub) use ($busca) {
                    $sub->where('nome', 'like', "%{$busca}%")
                        ->orWhere('codigo_barras', 'like', "%{$busca}%")
                        ->orWhere('ncm', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('categoria_id'), fn ($q) => $q->where('categoria_id', (int) $request->input('categoria_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', (int) $request->input('status')))
            ->when($request->filled('gerenciar_estoque'), function ($q) use ($request) {
                $value = (string) $request->input('gerenciar_estoque');
                if ($value === '1' || $value === '0') {
                    $q->where('gerenciar_estoque', (int) $value);
                }
            })
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Produto $p) => $this->toV2Payload($p))->values(),
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

        $categorias = CategoriaProduto::query()
            ->where('empresa_id', $empresaId)
            ->where('status', 1)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (CategoriaProduto $c) => ['id' => (string) $c->id, 'label' => (string) ($c->nome ?? '')])
            ->values();

        return response()->json([
            'categorias' => $categorias,
            'status' => [
                ['value' => '1', 'label' => 'Ativo'],
                ['value' => '0', 'label' => 'Inativo'],
            ],
            'gerenciarEstoque' => [
                ['value' => '1', 'label' => 'Sim'],
                ['value' => '0', 'label' => 'Não'],
            ],
            'unidades' => [
                ['value' => 'UN', 'label' => 'UN'],
                ['value' => 'KG', 'label' => 'KG'],
                ['value' => 'LT', 'label' => 'LT'],
                ['value' => 'CX', 'label' => 'CX'],
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $p = Produto::query()
            ->where('empresa_id', $empresaId)
            ->with(['categoria'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($p));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $p = Produto::create([
                'empresa_id' => $empresaId,
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'codigo_barras' => $this->normalizeText($validated['codigo_barras'] ?? ''),
                'ncm' => $this->normalizeText($validated['ncm'] ?? ''),
                'unidade' => $this->normalizeText($validated['unidade'] ?? 'UN'),
                'categoria_id' => $validated['categoria_id'] !== '' ? (int) $validated['categoria_id'] : null,
                'valor_compra' => $this->parseMoneyBr((string) ($validated['valor_compra'] ?? '0')),
                'valor_unitario' => $this->parseMoneyBr((string) ($validated['valor_unitario'] ?? '0')),
                'status' => (int) ($validated['status'] ?? 1),
                'gerenciar_estoque' => (int) ($validated['gerenciar_estoque'] ?? 0),
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'observacao' => (string) ($validated['observacao'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar o produto.'], 422);
        }

        return response()->json(['id' => (string) $p->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $p = Produto::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $p->update([
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'codigo_barras' => $this->normalizeText($validated['codigo_barras'] ?? ''),
                'ncm' => $this->normalizeText($validated['ncm'] ?? ''),
                'unidade' => $this->normalizeText($validated['unidade'] ?? 'UN'),
                'categoria_id' => $validated['categoria_id'] !== '' ? (int) $validated['categoria_id'] : null,
                'valor_compra' => $this->parseMoneyBr((string) ($validated['valor_compra'] ?? '0')),
                'valor_unitario' => $this->parseMoneyBr((string) ($validated['valor_unitario'] ?? '0')),
                'status' => (int) ($validated['status'] ?? $p->status ?? 1),
                'gerenciar_estoque' => (int) ($validated['gerenciar_estoque'] ?? $p->gerenciar_estoque ?? 0),
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'observacao' => (string) ($validated['observacao'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o produto.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $p = Produto::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $p->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir o produto.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Produto $p): array
    {
        return [
            'id' => (string) $p->id,
            'nome' => (string) ($p->nome ?? ''),
            'codigo_barras' => (string) ($p->codigo_barras ?? ''),
            'ncm' => (string) ($p->ncm ?? ''),
            'unidade' => (string) ($p->unidade ?? ''),
            'categoria_id' => (string) ($p->categoria_id ?? ''),
            'categoria_nome' => (string) ($p->categoria?->nome ?? ''),
            'valor_compra' => $this->formatMoneyBr((float) ($p->valor_compra ?? 0)),
            'valor_unitario' => $this->formatMoneyBr((float) ($p->valor_unitario ?? 0)),
            'status' => (string) ((int) ($p->status ?? 0)),
            'gerenciar_estoque' => (string) ((int) ($p->gerenciar_estoque ?? 0)),
            'descricao' => (string) ($p->descricao ?? ''),
            'observacao' => (string) ($p->observacao ?? ''),
            'created_at' => optional($p->created_at)->toISOString(),
            'updated_at' => optional($p->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'codigo_barras' => ['nullable', 'string', 'max:255'],
            'ncm' => ['nullable', 'string', 'max:50'],
            'unidade' => ['nullable', 'string', 'max:10'],
            'categoria_id' => ['nullable', 'string'],
            'valor_compra' => ['nullable', 'string'],
            'valor_unitario' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'gerenciar_estoque' => ['nullable', 'string'],
            'descricao' => ['nullable', 'string'],
            'observacao' => ['nullable', 'string'],
        ]);
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

    private function normalizeText(string $value): string
    {
        return trim((string) $value);
    }

    private function getEmpresaId(): int
    {
        return (int) (Auth::user()?->empresa?->empresa_id ?? 0);
    }
}

