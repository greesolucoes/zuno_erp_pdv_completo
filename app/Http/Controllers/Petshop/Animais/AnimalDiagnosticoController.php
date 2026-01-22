<?php

namespace App\Http\Controllers\Petshop\Animais;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnimalDiagnosticoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:diagnosticos_create', ['only' => ['create', 'store']]);
        $this->middleware('permission:diagnosticos_edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:diagnosticos_view', ['only' => ['index', 'imprimirAnamnese']]);
        $this->middleware('permission:diagnosticos_delete', ['only' => ['destroy']]);
    }

    public function index(Request $request)
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }

    public function imprimirAnamnese($id)
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }

    public function create()
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }

    public function store(Request $request)
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }

    public function edit($id)
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }

    public function update(Request $request, $id)
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }

    public function destroy($id)
    {
        abort(501, 'Módulo de diagnósticos em desenvolvimento.');
    }
}
