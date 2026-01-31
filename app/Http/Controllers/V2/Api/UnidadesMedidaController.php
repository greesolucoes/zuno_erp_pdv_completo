<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\UnidadeMedida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class UnidadesMedidaController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $this->ensureDefaultUnits($empresaId);

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = UnidadeMedida::query()
            ->where('empresa_id', $empresaId)
            ->when($busca !== '', fn ($q) => $q->where('nome', 'like', "%{$busca}%"))
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (UnidadeMedida $u) => $this->toV2Payload($u))->values(),
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
            'status' => [
                ['value' => '1', 'label' => 'Ativo'],
                ['value' => '0', 'label' => 'Inativo'],
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $u = UnidadeMedida::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        return response()->json($this->toV2Payload($u));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $u = UnidadeMedida::create([
                'empresa_id' => $empresaId,
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'status' => $this->toBoolInt($validated['status'] ?? '1'),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a unidade de medida.'], 422);
        }

        return response()->json(['id' => (string) $u->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $u = UnidadeMedida::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $u->update([
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'status' => $this->toBoolInt($validated['status'] ?? (string) ($u->status ?? '1')),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a unidade de medida.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $u = UnidadeMedida::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $u->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a unidade de medida.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(UnidadeMedida $u): array
    {
        return [
            'id' => (string) $u->id,
            'nome' => (string) ($u->nome ?? ''),
            'status' => (string) ((int) ($u->status ?? 0)),
            'created_at' => optional($u->created_at)->toISOString(),
            'updated_at' => optional($u->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
        ]);
    }

    private function toBoolInt($value): int
    {
        $v = (string) $value;
        return $v === '1' ? 1 : 0;
    }

    private function normalizeText(string $value): string
    {
        return trim((string) $value);
    }

    private function ensureDefaultUnits(int $empresaId): void
    {
        $exists = UnidadeMedida::query()->where('empresa_id', $empresaId)->exists();
        if ($exists) return;

        foreach (UnidadeMedida::unidadesMedidaPadrao() as $u) {
            UnidadeMedida::create([
                'empresa_id' => $empresaId,
                'status' => 1,
                'nome' => $u,
            ]);
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

