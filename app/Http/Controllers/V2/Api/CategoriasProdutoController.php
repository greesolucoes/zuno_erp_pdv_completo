<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaProduto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class CategoriasProdutoController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = CategoriaProduto::query()
            ->where('empresa_id', $empresaId)
            ->with(['categoria'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($sub) use ($busca) {
                    $sub->where('nome', 'like', "%{$busca}%")
                        ->orWhere('nome_en', 'like', "%{$busca}%")
                        ->orWhere('nome_es', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('categoria_id'), function ($q) use ($request) {
                $value = (string) $request->input('categoria_id');
                if ($value === 'null') {
                    $q->whereNull('categoria_id');
                } elseif (is_numeric($value)) {
                    $q->where('categoria_id', (int) $value);
                }
            })
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (CategoriaProduto $c) => $this->toV2Payload($c))->values(),
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
            ->whereNull('categoria_id')
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
            'simNao' => [
                ['value' => '1', 'label' => 'Sim'],
                ['value' => '0', 'label' => 'Não'],
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = CategoriaProduto::query()
            ->where('empresa_id', $empresaId)
            ->with(['categoria'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($c));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $payload = $this->toModelPayload($validated);

            if (($payload['ecommerce'] ?? 0) === 1) {
                $payload['hash_ecommerce'] = Str::random(50);
            }
            if (($payload['delivery'] ?? 0) === 1) {
                $payload['hash_delivery'] = Str::random(50);
            }

            $c = CategoriaProduto::create(array_merge($payload, ['empresa_id' => $empresaId]));

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a categoria.'], 422);
        }

        return response()->json(['id' => (string) $c->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $c = CategoriaProduto::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $payload = $this->toModelPayload($validated);

            if (($payload['ecommerce'] ?? 0) === 1 && ($c->hash_ecommerce === null || $c->hash_ecommerce === '')) {
                $payload['hash_ecommerce'] = Str::random(50);
            }
            if (($payload['delivery'] ?? 0) === 1 && ($c->hash_delivery === null || $c->hash_delivery === '')) {
                $payload['hash_delivery'] = Str::random(50);
            }

            $c->update($payload);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a categoria.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = CategoriaProduto::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $c->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a categoria.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toModelPayload(array $validated): array
    {
        return [
            'nome' => $this->normalizeText($validated['nome'] ?? ''),
            'status' => $this->toBoolInt($validated['status'] ?? '1'),
            'nome_en' => $this->normalizeText((string) ($validated['nome_en'] ?? '')),
            'nome_es' => $this->normalizeText((string) ($validated['nome_es'] ?? '')),
            'cardapio' => $this->toBoolInt($validated['cardapio'] ?? '0'),
            'delivery' => $this->toBoolInt($validated['delivery'] ?? '0'),
            'tipo_pizza' => $this->toBoolInt($validated['tipo_pizza'] ?? '0'),
            'ecommerce' => $this->toBoolInt($validated['ecommerce'] ?? '0'),
            'reserva' => $this->toBoolInt($validated['reserva'] ?? '0'),
            'categoria_id' => $this->toNullableInt($validated['categoria_id'] ?? ''),
        ];
    }

    private function toV2Payload(CategoriaProduto $c): array
    {
        return [
            'id' => (string) $c->id,
            'nome' => (string) ($c->nome ?? ''),
            'nome_en' => (string) ($c->nome_en ?? ''),
            'nome_es' => (string) ($c->nome_es ?? ''),
            'status' => (string) ((int) ($c->status ?? 0)),
            'cardapio' => (string) ((int) ($c->cardapio ?? 0)),
            'delivery' => (string) ((int) ($c->delivery ?? 0)),
            'tipo_pizza' => (string) ((int) ($c->tipo_pizza ?? 0)),
            'ecommerce' => (string) ((int) ($c->ecommerce ?? 0)),
            'reserva' => (string) ((int) ($c->reserva ?? 0)),
            'categoria_id' => (string) ($c->categoria_id ?? ''),
            'categoria_nome' => (string) ($c->categoria?->nome ?? ''),
            'created_at' => optional($c->created_at)->toISOString(),
            'updated_at' => optional($c->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'nome_en' => ['nullable', 'string', 'max:255'],
            'nome_es' => ['nullable', 'string', 'max:255'],
            'cardapio' => ['nullable', 'string'],
            'delivery' => ['nullable', 'string'],
            'tipo_pizza' => ['nullable', 'string'],
            'ecommerce' => ['nullable', 'string'],
            'reserva' => ['nullable', 'string'],
            'categoria_id' => ['nullable', 'string'],
        ]);
    }

    private function toBoolInt($value): int
    {
        $v = (string) $value;
        return $v === '1' ? 1 : 0;
    }

    private function toNullableInt($value): ?int
    {
        $v = trim((string) $value);
        if ($v === '' || $v === '0') return null;
        return is_numeric($v) ? (int) $v : null;
    }

    private function normalizeText(string $value): string
    {
        return trim((string) $value);
    }

    private function getEmpresaId(): int
    {
        $empresaId = (int) (request()->empresa_id ?? 0);
        if ($empresaId > 0) return $empresaId;
        $empresaId = (int) (Auth::user()->empresa_id ?? 0);
        return $empresaId;
    }
}

