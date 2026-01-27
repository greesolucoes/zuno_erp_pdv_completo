<?php

namespace App\Http\Controllers\V2\Api\Petshop;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Petshop\Animal;
use App\Models\Petshop\Especie;
use App\Models\Petshop\Pelagem;
use App\Models\Petshop\Raca;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PetsController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $busca = $request->input('busca') ?? $request->input('pesquisa');

        $query = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with(['cliente:id,razao_social,nome_fantasia', 'especie:id,nome', 'raca:id,nome', 'pelagem:id,nome'])
            ->when($busca, function ($q) use ($busca) {
                $q->where(function ($subQuery) use ($busca) {
                    $subQuery->where('nome', 'LIKE', "%{$busca}%")
                        ->orWhereHas('cliente', function ($clienteQuery) use ($busca) {
                            $clienteQuery->where('razao_social', 'LIKE', "%{$busca}%")
                                ->orWhere('nome_fantasia', 'LIKE', "%{$busca}%");
                        });
                });
            })
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(function (Animal $animal) {
                $tutor = $animal->cliente?->nome_fantasia ?: ($animal->cliente?->razao_social ?? '');

                return [
                    'id' => (string) $animal->id,
                    'nome' => (string) $animal->nome,
                    'sexo' => (string) $animal->sexo,
                    'cliente_id' => (string) $animal->cliente_id,
                    'especie_id' => (string) $animal->especie_id,
                    'raca_id' => (string) $animal->raca_id,
                    'pelagem_id' => (string) ($animal->pelagem_id ?? ''),
                    'cor' => (string) ($animal->cor ?? ''),
                    'peso' => (string) ($animal->peso ?? ''),
                    'porte' => (string) ($animal->porte ?? ''),
                    'origem' => (string) ($animal->origem ?? ''),
                    'data_nascimento_pet' => $animal->data_nascimento ? (string) Carbon::parse($animal->data_nascimento)->format('Y-m-d') : '',
                    'chip' => (string) ($animal->chip ?? ''),
                    'tem_pedigree' => $animal->tem_pedigree ? 'S' : 'N',
                    'pedigree' => (string) ($animal->pedigree ?? ''),
                    'observacao' => (string) ($animal->observacao ?? ''),
                    'tutor' => (string) $tutor,
                ];
            })->values(),
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

        $clientes = Cliente::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('razao_social')
            ->get(['id', 'razao_social', 'nome_fantasia'])
            ->map(fn ($c) => ['id' => (string) $c->id, 'label' => (string) ($c->nome_fantasia ?: $c->razao_social)])
            ->values();

        $especies = Especie::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($e) => ['id' => (string) $e->id, 'label' => (string) $e->nome])
            ->values();

        $racas = Raca::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome', 'especie_id']);

        $racasByEspecie = [];
        foreach ($racas as $r) {
            $key = (string) $r->especie_id;
            if (!isset($racasByEspecie[$key])) {
                $racasByEspecie[$key] = [];
            }
            $racasByEspecie[$key][] = ['id' => (string) $r->id, 'label' => (string) $r->nome];
        }

        $pelagens = Pelagem::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn ($p) => ['id' => (string) $p->id, 'label' => (string) $p->nome])
            ->values();

        return response()->json([
            'clientes' => $clientes,
            'especies' => $especies,
            'racasByEspecie' => $racasByEspecie,
            'pelagens' => $pelagens,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $animal = Animal::query()
            ->where('empresa_id', $empresaId)
            ->with(['cliente:id,razao_social,nome_fantasia'])
            ->findOrFail($id);

        $tutor = $animal->cliente?->nome_fantasia ?: ($animal->cliente?->razao_social ?? '');

        return response()->json([
            'id' => (string) $animal->id,
            'nome' => (string) $animal->nome,
            'sexo' => (string) $animal->sexo,
            'cliente_id' => (string) $animal->cliente_id,
            'especie_id' => (string) $animal->especie_id,
            'raca_id' => (string) $animal->raca_id,
            'pelagem_id' => (string) ($animal->pelagem_id ?? ''),
            'cor' => (string) ($animal->cor ?? ''),
            'peso' => (string) ($animal->peso ?? ''),
            'porte' => (string) ($animal->porte ?? ''),
            'origem' => (string) ($animal->origem ?? ''),
            'data_nascimento_pet' => $animal->data_nascimento ? (string) Carbon::parse($animal->data_nascimento)->format('Y-m-d') : '',
            'chip' => (string) ($animal->chip ?? ''),
            'tem_pedigree' => $animal->tem_pedigree ? 'S' : 'N',
            'pedigree' => (string) ($animal->pedigree ?? ''),
            'observacao' => (string) ($animal->observacao ?? ''),
            'tutor' => (string) $tutor,
        ]);
    }

    public function store(Request $request)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $validated = $request->validate([
            'cliente_id' => 'required',
            'especie_id' => 'required',
            'raca_id' => 'required',
            'nome' => 'required',
            'sexo' => 'required',
            'tem_pedigree' => 'required',
            'porte' => 'required',
        ]);

        $dataNascimento = $request->input('data_nascimento_pet');

        $animal = Animal::create([
            'cliente_id' => $validated['cliente_id'],
            'especie_id' => $validated['especie_id'],
            'raca_id' => $validated['raca_id'],
            'pelagem_id' => $request->input('pelagem_id'),
            'cor' => $request->input('cor'),
            'nome' => $validated['nome'],
            'data_nascimento' => $dataNascimento,
            'peso' => $request->input('peso'),
            'sexo' => $validated['sexo'],
            'idade' => $dataNascimento ? Carbon::parse($dataNascimento)->age : null,
            'tem_pedigree' => $validated['tem_pedigree'] === 'S' ? true : false,
            'porte' => $validated['porte'] === 'OUTRO' ? ($request->input('porte_outro') ?: $validated['porte']) : $validated['porte'],
            'chip' => $request->input('chip'),
            'pedigree' => $request->input('pedigree'),
            'origem' => $request->input('origem'),
            'observacao' => $request->input('observacao'),
            'empresa_id' => $empresaId,
        ]);

        return response()->json(['id' => (string) $animal->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = Auth::user()?->empresa?->empresa_id;

        $validated = $request->validate([
            'cliente_id' => 'required',
            'especie_id' => 'required',
            'raca_id' => 'required',
            'nome' => 'required',
            'sexo' => 'required',
            'tem_pedigree' => 'required',
            'porte' => 'required',
        ]);

        $animal = Animal::query()->where('empresa_id', $empresaId)->findOrFail($id);

        $dataNascimento = $request->input('data_nascimento_pet');

        $animal->update([
            'cliente_id' => $validated['cliente_id'],
            'especie_id' => $validated['especie_id'],
            'raca_id' => $validated['raca_id'],
            'pelagem_id' => $request->input('pelagem_id'),
            'cor' => $request->input('cor'),
            'nome' => $validated['nome'],
            'data_nascimento' => $dataNascimento,
            'peso' => $request->input('peso'),
            'sexo' => $validated['sexo'],
            'idade' => $dataNascimento ? Carbon::parse($dataNascimento)->age : $animal->idade,
            'tem_pedigree' => $validated['tem_pedigree'] === 'S' ? true : false,
            'porte' => $validated['porte'] === 'OUTRO' ? ($request->input('porte_outro') ?: $validated['porte']) : $validated['porte'],
            'chip' => $request->input('chip'),
            'pedigree' => $request->input('pedigree'),
            'origem' => $request->input('origem'),
            'observacao' => $request->input('observacao'),
        ]);

        return response()->json(['ok' => true]);
    }
}

