<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Petshop\ModeloAvaliacao;
use App\Support\Petshop\Vet\AssessmentModelOptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ModelosAvaliacaoController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = ModeloAvaliacao::query()
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

                $categoriasMap = AssessmentModelOptions::categories(); // key => label
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
                if (! in_array($status, AssessmentModelOptions::statuses(), true)) return;
                $q->where('status', $status);
            })
            ->orderByDesc('updated_at');

        $data = $query->paginate((int) env('PAGINACAO', 15))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (ModeloAvaliacao $m) => $this->toV2Payload($m))->values(),
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
            'categories' => array_values(AssessmentModelOptions::categories()),
            'status' => collect(AssessmentModelOptions::statusOptions())
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
                ->values()
                ->all(),
            'fieldTypes' => collect(AssessmentModelOptions::fieldTypes())
                ->map(fn (string $type) => ['value' => $type, 'label' => AssessmentModelOptions::fieldTypeLabel($type)])
                ->values()
                ->all(),
            'templates' => [
                ['value' => 'basico', 'label' => 'Básico (sinais + observações)'],
                ['value' => 'consulta', 'label' => 'Consulta (anamnese)'],
                ['value' => 'internacao', 'label' => 'Internação (evolução)'],
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = ModeloAvaliacao::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        return response()->json($this->toV2Payload($m));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $userId = Auth::id();
        abort_unless($userId, 403, 'Usuário não autenticado.');

        $validated = $this->validatePayload($request);

        $fields = $this->normalizeFieldsForStorage($validated['fields'] ?? []);
        if ($fields === []) {
            return response()->json(['message' => 'Configure ao menos um campo para salvar o modelo.'], 422);
        }

        try {
            DB::beginTransaction();

            $m = ModeloAvaliacao::create([
                'empresa_id' => $empresaId,
                'title' => (string) ($validated['title'] ?? ''),
                'category' => $this->normalizeCategory($validated['category'] ?? null),
                'notes' => $this->normalizeNullableString($validated['notes'] ?? null),
                'fields' => $fields,
                'status' => $this->normalizeStatus($validated['status'] ?? null, default: AssessmentModelOptions::STATUS_ACTIVE),
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar o modelo de avaliação.'], 422);
        }

        return response()->json(['id' => (string) $m->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $userId = Auth::id();
        abort_unless($userId, 403, 'Usuário não autenticado.');

        $validated = $this->validatePayload($request);

        $m = ModeloAvaliacao::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        $fields = $this->normalizeFieldsForStorage($validated['fields'] ?? []);
        if ($fields === []) {
            return response()->json(['message' => 'Configure ao menos um campo para salvar o modelo.'], 422);
        }

        try {
            $m->update([
                'title' => (string) ($validated['title'] ?? ''),
                'category' => $this->normalizeCategory($validated['category'] ?? null),
                'notes' => $this->normalizeNullableString($validated['notes'] ?? null),
                'fields' => $fields,
                'status' => $this->normalizeStatus($validated['status'] ?? null, default: (string) ($m->status ?? AssessmentModelOptions::STATUS_ACTIVE)),
                'updated_by' => $userId,
            ]);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o modelo de avaliação.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = ModeloAvaliacao::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();
            $m->delete();
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível remover o modelo de avaliação.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:' . implode(',', AssessmentModelOptions::statuses())],
            'fields' => ['array'],
            'fields.*.label' => ['nullable', 'string'],
            'fields.*.type' => ['nullable', 'string'],
        ]);
    }

    private function normalizeCategory(mixed $value): string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return '';

        $map = AssessmentModelOptions::categories(); // key => label
        return (string) ($map[$raw] ?? $raw);
    }

    private function normalizeStatus(mixed $value, string $default): string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return $default;
        return in_array($raw, AssessmentModelOptions::statuses(), true) ? $raw : $default;
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if ($value === null) return null;
        $raw = trim((string) $value);
        return $raw === '' ? null : $raw;
    }

    private function normalizeOptionsText(mixed $value): array
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') return [];

        $lines = preg_split("/(\r\n|\r|\n)/", $raw) ?: [];
        $out = [];
        foreach ($lines as $line) {
            $opt = trim((string) $line);
            if ($opt === '') continue;
            $out[] = $opt;
        }
        return $out;
    }

    private function normalizeFieldsForStorage(array $fields): array
    {
        $out = [];

        foreach ($fields as $field) {
            if (! is_array($field)) continue;

            $label = trim((string) ($field['label'] ?? ''));
            $type = trim((string) ($field['type'] ?? ''));
            if ($label === '' || $type === '') continue;
            if (! in_array($type, AssessmentModelOptions::fieldTypes(), true)) continue;

            $config = [];
            foreach (AssessmentModelOptions::configKeysForType($type) as $key) {
                $val = $field[$key] ?? null;
                if ($val === null) continue;

                if (is_string($val) && $key !== 'rich_text_default') $val = trim($val);
                if ($key === 'rich_text_default' && is_string($val)) $val = trim($val);

                if ($val === '' && $key !== 'checkbox_default') continue;

                $normalized = match ($key) {
                    'number_min', 'number_max' => is_numeric($val) ? (float) $val : null,
                    'integer_min', 'integer_max' => is_numeric($val) ? (int) $val : null,
                    'file_max_size' => is_numeric($val) ? (int) $val : null,
                    'select_options', 'multi_select_options', 'checkbox_group_options', 'radio_group_options' => $this->normalizeOptionsText($val),
                    'checkbox_default' => (string) $val === 'S' ? 'checked' : 'unchecked',
                    default => is_string($val) ? $val : (string) $val,
                };

                if ($normalized === null) continue;
                if (is_array($normalized) && $normalized === []) continue;
                $config[$key] = $normalized;
            }

            if ($type === 'checkbox' && ! array_key_exists('checkbox_default', $config)) {
                $config['checkbox_default'] = 'unchecked';
            }

            $out[] = [
                'label' => $label,
                'type' => $type,
                'config' => $config,
            ];
        }

        return $out;
    }

    private function inflateFieldsForV2(mixed $storedFields): array
    {
        if (! is_array($storedFields)) return [];

        $defaults = [
            'placeholder' => '',
            'textarea_placeholder' => '',
            'number_min' => '',
            'number_max' => '',
            'integer_min' => '',
            'integer_max' => '',
            'date_hint' => '',
            'time_hint' => '',
            'datetime_hint' => '',
            'select_options' => '',
            'multi_select_options' => '',
            'checkbox_label_checked' => '',
            'checkbox_label_unchecked' => '',
            'checkbox_default' => 'N',
            'checkbox_group_options' => '',
            'radio_group_options' => '',
            'radio_group_default' => '',
            'email_placeholder' => '',
            'phone_placeholder' => '',
            'file_types' => '',
            'file_max_size' => '',
            'rich_text_default' => '',
        ];

        $out = [];
        foreach ($storedFields as $field) {
            if (! is_array($field)) continue;

            $label = trim((string) ($field['label'] ?? ''));
            $type = trim((string) ($field['type'] ?? ''));
            if ($label === '' || $type === '') continue;

            $row = array_merge($defaults, [
                'label' => $label,
                'type' => $type,
            ]);

            $config = is_array($field['config'] ?? null) ? $field['config'] : [];

            foreach ($defaults as $key => $defaultValue) {
                if (! array_key_exists($key, $config)) continue;
                $val = $config[$key];

                if (in_array($key, ['select_options', 'multi_select_options', 'checkbox_group_options', 'radio_group_options'], true) && is_array($val)) {
                    $row[$key] = implode("\n", array_map('strval', $val));
                    continue;
                }

                if ($key === 'checkbox_default') {
                    $row[$key] = $val === 'checked' ? 'S' : 'N';
                    continue;
                }

                $row[$key] = is_scalar($val) ? (string) $val : '';
            }

            $out[] = $row;
        }

        return $out;
    }

    private function toV2Payload(ModeloAvaliacao $m): array
    {
        return [
            'id' => (string) $m->id,
            'title' => (string) ($m->title ?? ''),
            'category' => (string) ($m->category ?? ''),
            'notes' => (string) ($m->notes ?? ''),
            'status' => (string) (($m->status ?? '') === AssessmentModelOptions::STATUS_INACTIVE ? AssessmentModelOptions::STATUS_INACTIVE : AssessmentModelOptions::STATUS_ACTIVE),
            'fields' => $this->inflateFieldsForV2($m->fields ?? []),
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

