<?php

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Petshop\SalaInternacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SalasInternacaoController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = $request->input('busca') ?? $request->input('search');

        $query = SalaInternacao::query()
            ->where('empresa_id', $empresaId)
            ->when($busca, function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery
                        ->where('nome', 'like', "%{$busca}%")
                        ->orWhere('identificador', 'like', "%{$busca}%")
                        ->orWhere('tipo', 'like', "%{$busca}%")
                        ->orWhere('equipamentos', 'like', "%{$busca}%");
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('tipo'), fn ($q) => $q->where('tipo', $request->string('tipo')->toString()))
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (SalaInternacao $s) => [
                'id' => (string) $s->id,
                'nome' => (string) $s->nome,
                'identificador' => (string) ($s->identificador ?? ''),
                'tipo' => (string) $s->tipo,
                'status' => (string) $s->status,
                'capacidade' => $s->capacidade === null ? '' : (string) $s->capacidade,
                'equipamentos' => (string) ($s->equipamentos ?? ''),
                'observacoes' => (string) ($s->observacoes ?? ''),
                'created_at' => optional($s->created_at)->toISOString(),
                'updated_at' => optional($s->updated_at)->toISOString(),
            ])->values(),
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
        $tipos = [
            'internacao-geral' => 'Internação geral',
            'isolamento' => 'Isolamento',
            'terapia-intensiva' => 'Terapia intensiva',
            'pos-operatorio' => 'Pós-operatório',
            'recuperacao' => 'Sala de recuperação',
            'infectocontagioso' => 'Controle de infectocontagiosos',
            'neonatal' => 'Internação neonatal',
            'outro' => 'Outro',
        ];

        $status = [
            'disponivel' => 'Disponível',
            'ocupada' => 'Ocupada',
            'reservada' => 'Reservada',
            'manutencao' => 'Em manutenção',
        ];

        return response()->json([
            'tipos' => collect($tipos)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values(),
            'status' => collect($status)->map(fn ($label, $value) => ['value' => $value, 'label' => $label])->values(),
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $s = SalaInternacao::query()->where('empresa_id', $empresaId)->findOrFail($id);

        return response()->json([
            'id' => (string) $s->id,
            'nome' => (string) $s->nome,
            'identificador' => (string) ($s->identificador ?? ''),
            'tipo' => (string) $s->tipo,
            'status' => (string) $s->status,
            'capacidade' => $s->capacidade === null ? '' : (string) $s->capacidade,
            'equipamentos' => (string) ($s->equipamentos ?? ''),
            'observacoes' => (string) ($s->observacoes ?? ''),
            'created_at' => optional($s->created_at)->toISOString(),
            'updated_at' => optional($s->updated_at)->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $tipos = ['internacao-geral', 'isolamento', 'terapia-intensiva', 'pos-operatorio', 'recuperacao', 'infectocontagioso', 'neonatal', 'outro'];
        $status = ['disponivel', 'ocupada', 'reservada', 'manutencao'];

        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'identificador' => ['nullable', 'string', 'max:50'],
            'tipo' => ['required', Rule::in($tipos)],
            'status' => ['required', Rule::in($status)],
            'capacidade' => ['nullable', 'integer', 'min:1', 'max:999'],
            'equipamentos' => ['nullable', 'string', 'max:255'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $s = SalaInternacao::create(array_merge($validated, [
            'empresa_id' => $empresaId,
        ]));

        return response()->json(['id' => (string) $s->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $tipos = ['internacao-geral', 'isolamento', 'terapia-intensiva', 'pos-operatorio', 'recuperacao', 'infectocontagioso', 'neonatal', 'outro'];
        $status = ['disponivel', 'ocupada', 'reservada', 'manutencao'];

        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'identificador' => ['nullable', 'string', 'max:50'],
            'tipo' => ['required', Rule::in($tipos)],
            'status' => ['required', Rule::in($status)],
            'capacidade' => ['nullable', 'integer', 'min:1', 'max:999'],
            'equipamentos' => ['nullable', 'string', 'max:255'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $s = SalaInternacao::query()->where('empresa_id', $empresaId)->findOrFail($id);
        $s->update($validated);

        return response()->json(['ok' => true]);
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

