<?php

namespace App\Http\Controllers\V2\Api\Petshop;

use App\Http\Controllers\Controller;
use App\Models\Petshop\Pelagem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PelagensController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $busca = $request->input('busca') ?? $request->input('pesquisa');

        $query = Pelagem::query()
            ->where('empresa_id', $empresaId)
            ->when($busca, fn ($q) => $q->where('nome', 'LIKE', "%{$busca}%"))
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Pelagem $p) => [
                'id' => (string) $p->id,
                'nome' => (string) $p->nome,
                'created_at' => optional($p->created_at)->toISOString(),
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
        return response()->json((object) []);
    }

    public function show(string $id)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $p = Pelagem::query()->where('empresa_id', $empresaId)->findOrFail($id);

        return response()->json([
            'id' => (string) $p->id,
            'nome' => (string) $p->nome,
            'created_at' => optional($p->created_at)->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $validated = $request->validate([
            'nome' => 'required',
        ]);

        $p = Pelagem::create([
            'nome' => $validated['nome'],
            'empresa_id' => $empresaId,
        ]);

        return response()->json(['id' => (string) $p->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $validated = $request->validate([
            'nome' => 'required',
        ]);

        $p = Pelagem::query()->where('empresa_id', $empresaId)->findOrFail($id);
        $p->update(['nome' => $validated['nome']]);

        return response()->json(['ok' => true]);
    }
}

