<?php

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Petshop\Checklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ChecklistsController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = Str::of((string) ($request->input('busca') ?? $request->input('search') ?? ''))->trim()->toString();

        $query = Checklist::query()
            ->where('empresa_id', $empresaId)
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery
                        ->where('titulo', 'like', "%{$busca}%")
                        ->orWhere('descricao', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $status = Str::of((string) $request->input('status'))->trim()->toString();
                if (array_key_exists($status, $this->statusOptions())) {
                    $q->where('status', $status);
                }
            })
            ->when($request->filled('tipo'), function ($q) use ($request) {
                $tipo = Str::of((string) $request->input('tipo'))->trim()->lower()->toString();
                if (array_key_exists($tipo, $this->typeOptions())) {
                    $q->where('tipo', $tipo);
                }
            })
            ->orderByDesc('updated_at');

        $data = $query->paginate((int) env('PAGINACAO', 15))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Checklist $c) => $this->toV2Payload($c))->values(),
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
            'tipos' => collect($this->typeOptions())->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values(),
            'status' => collect($this->statusOptions())->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values(),
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = Checklist::query()->where('empresa_id', $empresaId)->findOrFail($id);

        return response()->json($this->toV2Payload($c));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'itens' => ['nullable', 'array'],
            'itens.*' => ['nullable'],
            'tipo' => ['required', 'string', Rule::in(array_keys($this->typeOptions()))],
            'status' => ['required', 'string', Rule::in(array_keys($this->statusOptions()))],
        ]);

        $items = $this->normalizeItems($validated['itens'] ?? null);

        $c = Checklist::create([
            'empresa_id' => $empresaId,
            'titulo' => Str::of($validated['titulo'])->trim()->toString(),
            'descricao' => $this->normalizeNullableText($validated['descricao'] ?? null),
            'tipo' => Str::of($validated['tipo'])->trim()->lower()->toString(),
            'itens' => $items ?: null,
            'status' => Str::of($validated['status'])->trim()->toString(),
        ]);

        return response()->json(['id' => (string) $c->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'itens' => ['nullable', 'array'],
            'itens.*' => ['nullable'],
            'tipo' => ['required', 'string', Rule::in(array_keys($this->typeOptions()))],
            'status' => ['required', 'string', Rule::in(array_keys($this->statusOptions()))],
        ]);

        $c = Checklist::query()->where('empresa_id', $empresaId)->findOrFail($id);
        $items = $this->normalizeItems($validated['itens'] ?? null);

        $c->update([
            'titulo' => Str::of($validated['titulo'])->trim()->toString(),
            'descricao' => $this->normalizeNullableText($validated['descricao'] ?? null),
            'tipo' => Str::of($validated['tipo'])->trim()->lower()->toString(),
            'itens' => $items ?: null,
            'status' => Str::of($validated['status'])->trim()->toString(),
        ]);

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Checklist $c): array
    {
        $items = collect($c->itens ?? [])
            ->map(function ($item) {
                if (is_string($item)) return ['texto' => $item];
                if (is_array($item)) return ['texto' => (string) ($item['texto'] ?? '')];
                return null;
            })
            ->filter(fn ($i) => isset($i['texto']) && trim((string) $i['texto']) !== '')
            ->values()
            ->all();

        return [
            'id' => (string) $c->id,
            'titulo' => (string) ($c->titulo ?? ''),
            'tipo' => (string) ($c->tipo ?? ''),
            'status' => (string) ($c->status ?? 'ativo'),
            'descricao' => (string) ($c->descricao ?? ''),
            'itens' => $items,
            'created_at' => optional($c->created_at)->toISOString(),
            'updated_at' => optional($c->updated_at)->toISOString(),
        ];
    }

    private function statusOptions(): array
    {
        return [
            'ativo' => 'Ativo',
            'inativo' => 'Inativo',
        ];
    }

    private function typeOptions(): array
    {
        return [
            'atendimento' => 'Atendimento',
            'prescricao' => 'Prescrição',
            'prontuario' => 'Prontuário',
            'vacinacoes' => 'Vacinações',
            'interacoes' => 'Interações',
        ];
    }

    private function normalizeItems(null|array|string $items): array
    {
        if ($items === null) return [];

        if (is_string($items)) {
            return collect(preg_split('/\r\n|\r|\n/', $items))
                ->map(fn ($item) => Str::of((string) $item)->trim()->toString())
                ->filter()
                ->values()
                ->all();
        }

        return collect($items)
            ->map(function ($item) {
                if (is_string($item)) {
                    return Str::of($item)->trim()->toString();
                }

                if (is_array($item)) {
                    return Str::of((string) ($item['texto'] ?? ''))->trim()->toString();
                }

                return Str::of((string) ($item?->texto ?? ''))->trim()->toString();
            })
            ->filter()
            ->values()
            ->all();
    }

    private function normalizeNullableText(?string $text): ?string
    {
        if ($text === null) return null;

        $normalized = Str::of($text)->trim()->toString();

        return $normalized === '' ? null : $normalized;
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

