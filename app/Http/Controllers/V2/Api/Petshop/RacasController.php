<?php

namespace App\Http\Controllers\V2\Api\Petshop;

use App\Http\Controllers\Controller;
use App\Models\Petshop\Especie;
use App\Models\Petshop\Raca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RacasController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $busca = $request->input('busca') ?? $request->input('pesquisa');

        $query = Raca::query()
            ->where('empresa_id', $empresaId)
            ->when($busca, function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery
                        ->where('nome', 'LIKE', "%{$busca}%")
                        ->orWhere('especie_id', 'LIKE', "%{$busca}%");
                });
            })
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Raca $r) => [
                'id' => (string) $r->id,
                'nome' => (string) $r->nome,
                'especie_id' => (string) $r->especie_id,
                'created_at' => optional($r->created_at)->toISOString(),
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
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $especies = Especie::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($e) => ['id' => (string) $e->id, 'label' => (string) $e->nome])
            ->values();

        return response()->json([
            'especies' => $especies,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $r = Raca::query()->where('empresa_id', $empresaId)->findOrFail($id);

        return response()->json([
            'id' => (string) $r->id,
            'nome' => (string) $r->nome,
            'especie_id' => (string) $r->especie_id,
            'created_at' => optional($r->created_at)->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $validated = $request->validate([
            'nome' => 'required',
            'especie_id' => 'required',
        ]);

        $r = Raca::create([
            'nome' => $validated['nome'],
            'especie_id' => $validated['especie_id'],
            'empresa_id' => $empresaId,
        ]);

        return response()->json(['id' => (string) $r->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $validated = $request->validate([
            'nome' => 'required',
            'especie_id' => 'required',
        ]);

        $r = Raca::query()->where('empresa_id', $empresaId)->findOrFail($id);
        $r->update([
            'nome' => $validated['nome'],
            'especie_id' => $validated['especie_id'],
        ]);

        return response()->json(['ok' => true]);
    }
}

