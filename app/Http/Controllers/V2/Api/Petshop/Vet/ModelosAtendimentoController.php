<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Petshop\ModeloAtendimento;
use App\Support\Petshop\Vet\ModeloAtendimentoOptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ModelosAtendimentoController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = ModeloAtendimento::query()
            ->where('empresa_id', $empresaId)
            ->when($busca !== '', function ($q) use ($busca) {
                $termo = Str::of($busca)->trim()->toString();
                if ($termo === '') return;

                $q->where(function ($subQuery) use ($termo) {
                    $subQuery
                        ->where('title', 'like', "%{$termo}%")
                        ->orWhere('notes', 'like', "%{$termo}%");
                });
            })
            ->when($request->filled('category'), function ($q) use ($request) {
                $categoria = $request->string('category')->trim()->toString();
                if ($categoria === '') return;

                $categoriasMap = ModeloAtendimentoOptions::categories(); // key => label
                $categoriaLabel = $categoriasMap[$categoria] ?? $categoria;

                $isPersonalizado =
                    strtolower($categoria) === 'personalizado' ||
                    strtolower($categoriaLabel) === 'personalizado';

                if ($isPersonalizado) {
                    $categoriasPadrao = array_map('strval', array_values($categoriasMap));

                    $q->where(function ($subQuery) use ($categoriasPadrao, $categoriaLabel) {
                        $subQuery
                            ->where('category', $categoriaLabel)
                            ->orWhere(function ($customQuery) use ($categoriasPadrao) {
                                $customQuery
                                    ->whereNotNull('category')
                                    ->whereNotIn('category', $categoriasPadrao);
                            });
                    });
                    return;
                }

                $q->where('category', $categoriaLabel);
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $status = $request->string('status')->trim()->toString();
                if (! in_array($status, ModeloAtendimentoOptions::statuses(), true)) return;
                $q->where('status', $status);
            })
            ->orderByDesc('updated_at');

        $data = $query->paginate((int) env('PAGINACAO', 15))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (ModeloAtendimento $m) => $this->toV2Payload($m))->values(),
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
            'categories' => array_values(ModeloAtendimentoOptions::categories()),
            'status' => collect(ModeloAtendimentoOptions::statusOptions())
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = ModeloAtendimento::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        return response()->json($this->toV2Payload($m));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $userId = Auth::user()?->id;

        $categoria = $this->normalizeCategory($validated['category'] ?? null);
        $status = $this->normalizeStatus($validated['status'] ?? null, default: 'ativo');

        try {
            DB::beginTransaction();

            $m = ModeloAtendimento::create([
                'empresa_id' => $empresaId,
                'title' => (string) ($validated['title'] ?? ''),
                'category' => $categoria,
                'notes' => (string) ($validated['notes'] ?? ''),
                'content' => (string) ($validated['content'] ?? ''),
                'status' => $status,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar o modelo de atendimento.'], 422);
        }

        return response()->json(['id' => (string) $m->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $this->validatePayload($request);

        $m = ModeloAtendimento::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        $userId = Auth::user()?->id;

        $categoria = $this->normalizeCategory($validated['category'] ?? null);
        $status = $this->normalizeStatus($validated['status'] ?? null, default: (string) ($m->status ?? 'ativo'));

        try {
            DB::beginTransaction();

            $m->fill([
                'title' => (string) ($validated['title'] ?? ''),
                'category' => $categoria,
                'notes' => (string) ($validated['notes'] ?? ''),
                'content' => (string) ($validated['content'] ?? ''),
                'status' => $status,
                'updated_by' => $userId,
            ]);
            $m->save();

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o modelo de atendimento.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = ModeloAtendimento::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();
            $m->delete();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível remover o modelo de atendimento.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:' . implode(',', ModeloAtendimentoOptions::statuses())],
            'content' => ['required', 'string'],
        ]);
    }

    private function normalizeCategory(mixed $value): string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return '';

        $map = ModeloAtendimentoOptions::categories(); // key => label
        return (string) ($map[$raw] ?? $raw);
    }

    private function normalizeStatus(mixed $value, string $default): string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return $default;
        return in_array($raw, ModeloAtendimentoOptions::statuses(), true) ? $raw : $default;
    }

    private function toV2Payload(ModeloAtendimento $m): array
    {
        return [
            'id' => (string) $m->id,
            'title' => (string) ($m->title ?? ''),
            'category' => (string) ($m->category ?? ''),
            'notes' => (string) ($m->notes ?? ''),
            'content' => (string) ($m->content ?? ''),
            'status' => (string) (($m->status ?? '') === 'inativo' ? 'inativo' : 'ativo'),
            'created_at' => optional($m->created_at)->toISOString(),
            'updated_at' => optional($m->updated_at)->toISOString(),
        ];
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

