<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaServico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class CategoriasServicoController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $this->ensureHashes($empresaId);

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = CategoriaServico::query()
            ->where('empresa_id', $empresaId)
            ->when($busca !== '', fn ($q) => $q->where('nome', 'like', "%{$busca}%"))
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (CategoriaServico $c) => $this->toV2Payload($c))->values(),
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
        return response()->json([
            'simNao' => [
                ['value' => '1', 'label' => 'Sim'],
                ['value' => '0', 'label' => 'Não'],
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = CategoriaServico::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        return response()->json($this->toV2Payload($c));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $marketplace = $this->toBoolInt($validated['marketplace'] ?? '0');

            $c = CategoriaServico::create([
                'empresa_id' => $empresaId,
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'marketplace' => $marketplace,
                'hash_delivery' => $marketplace === 1 ? Str::random(50) : null,
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a categoria de serviço.'], 422);
        }

        return response()->json(['id' => (string) $c->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $c = CategoriaServico::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $marketplace = $this->toBoolInt($validated['marketplace'] ?? (string) ($c->marketplace ?? 0));

            $payload = [
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'marketplace' => $marketplace,
            ];

            if ($marketplace === 1 && ($c->hash_delivery === null || $c->hash_delivery === '')) {
                $payload['hash_delivery'] = Str::random(50);
            }

            if ($marketplace !== 1) {
                $payload['hash_delivery'] = $c->hash_delivery;
            }

            $c->update($payload);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a categoria de serviço.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = CategoriaServico::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $c->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a categoria de serviço.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(CategoriaServico $c): array
    {
        return [
            'id' => (string) $c->id,
            'nome' => (string) ($c->nome ?? ''),
            'marketplace' => (string) ((int) ($c->marketplace ?? 0)),
            'created_at' => optional($c->created_at)->toISOString(),
            'updated_at' => optional($c->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'marketplace' => ['nullable', 'string'],
        ]);
    }

    private function normalizeText(string $value): string
    {
        return trim((string) $value);
    }

    private function toBoolInt($value): int
    {
        $v = (string) $value;
        return $v === '1' ? 1 : 0;
    }

    private function ensureHashes(int $empresaId): void
    {
        $items = CategoriaServico::query()
            ->where('empresa_id', $empresaId)
            ->where('marketplace', 1)
            ->whereNull('hash_delivery')
            ->get(['id', 'hash_delivery']);

        foreach ($items as $c) {
            $c->hash_delivery = Str::random(50);
            $c->save();
        }
    }

    private function getEmpresaId(): int
    {
        $empresaId = (int) (request()->empresa_id ?? 0);
        if ($empresaId > 0) return $empresaId;
        $empresaId = (int) (Auth::user()->empresa_id ?? 0);
        return $empresaId;
    }
}
