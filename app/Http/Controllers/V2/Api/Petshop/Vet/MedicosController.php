<?php

namespace App\Http\Controllers\V2\Api\Petshop\Vet;

use App\Http\Controllers\Controller;
use App\Models\Funcionario;
use App\Models\Petshop\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class MedicosController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $busca = $request->input('busca') ?? $request->input('search');

        $query = Medico::query()
            ->where('empresa_id', $empresaId)
            ->with(['funcionario:id,nome'])
            ->when($busca, function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery
                        ->where('crmv', 'like', "%{$busca}%")
                        ->orWhere('especialidade', 'like', "%{$busca}%")
                        ->orWhereHas('funcionario', fn ($funcionarioQuery) => $funcionarioQuery->where('nome', 'like', "%{$busca}%"));
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->orderByDesc('created_at');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Medico $m) => [
                'id' => (string) $m->id,
                'funcionario_id' => (string) $m->funcionario_id,
                'status' => (string) $m->status,
                'crmv' => (string) $m->crmv,
                'especialidade' => (string) ($m->especialidade ?? ''),
                'email' => (string) ($m->email ?? ''),
                'telefone' => (string) ($m->telefone ?? ''),
                'observacoes' => (string) ($m->observacoes ?? ''),
                'created_at' => optional($m->created_at)->toISOString(),
            ])->values(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
            ],
        ]);
    }

    public function options(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $availableOnly = $request->boolean('available_only');
        $medicoId = $request->input('medico_id');

        $occupiedEmployeeIds = Medico::query()
            ->where('empresa_id', $empresaId)
            ->when($medicoId, fn ($q) => $q->where('id', '!=', $medicoId))
            ->pluck('funcionario_id');

        $employees = Funcionario::query()
            ->where('empresa_id', $empresaId)
            ->when($availableOnly, fn ($q) => $q->whereNotIn('id', $occupiedEmployeeIds))
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($f) => ['id' => (string) $f->id, 'label' => (string) $f->nome])
            ->values();

        return response()->json([
            'funcionarios' => $employees,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $m = Medico::query()->where('empresa_id', $empresaId)->findOrFail($id);

        return response()->json([
            'id' => (string) $m->id,
            'funcionario_id' => (string) $m->funcionario_id,
            'status' => (string) $m->status,
            'crmv' => (string) $m->crmv,
            'especialidade' => (string) ($m->especialidade ?? ''),
            'email' => (string) ($m->email ?? ''),
            'telefone' => (string) ($m->telefone ?? ''),
            'observacoes' => (string) ($m->observacoes ?? ''),
            'created_at' => optional($m->created_at)->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'funcionario_id' => [
                'required',
                'exists:funcionarios,id',
                Rule::unique('petshop_medicos', 'funcionario_id'),
            ],
            'crmv' => [
                'required',
                'string',
                'max:30',
                Rule::unique('petshop_medicos', 'crmv')
                    ->where(fn ($query) => $query->where('empresa_id', $empresaId)),
            ],
            'especialidade' => ['nullable', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'observacoes' => ['nullable', 'string'],
            'status' => ['required', 'in:ativo,inativo'],
        ]);

        $m = Medico::create(array_merge($validated, [
            'empresa_id' => $empresaId,
        ]));

        return response()->json(['id' => (string) $m->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();

        $validated = $request->validate([
            'funcionario_id' => [
                'required',
                'exists:funcionarios,id',
                Rule::unique('petshop_medicos', 'funcionario_id')->ignore($id),
            ],
            'crmv' => [
                'required',
                'string',
                'max:30',
                Rule::unique('petshop_medicos', 'crmv')
                    ->ignore($id)
                    ->where(fn ($query) => $query->where('empresa_id', $empresaId)),
            ],
            'especialidade' => ['nullable', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'observacoes' => ['nullable', 'string'],
            'status' => ['required', 'in:ativo,inativo'],
        ]);

        $m = Medico::query()->where('empresa_id', $empresaId)->findOrFail($id);
        $m->update($validated);

        return response()->json(['ok' => true]);
    }

    private function getEmpresaId(): int
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        abort_unless($empresaId, 403, 'Empresa não encontrada para o usuário autenticado.');

        return (int) $empresaId;
    }
}

