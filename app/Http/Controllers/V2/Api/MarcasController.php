<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\Marca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class MarcasController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Marca::query()
            ->where('empresa_id', $empresaId)
            ->when($busca !== '', fn ($q) => $q->where('nome', 'like', "%{$busca}%"))
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Marca $m) => $this->toV2Payload($m))->values(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = Marca::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        return response()->json($this->toV2Payload($m));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $m = Marca::create([
                'empresa_id' => $empresaId,
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a marca.'], 422);
        }

        return response()->json(['id' => (string) $m->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $m = Marca::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $m->update([
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a marca.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = Marca::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $m->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a marca.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Marca $m): array
    {
        return [
            'id' => (string) $m->id,
            'nome' => (string) ($m->nome ?? ''),
            'created_at' => optional($m->created_at)->toISOString(),
            'updated_at' => optional($m->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
        ]);
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

