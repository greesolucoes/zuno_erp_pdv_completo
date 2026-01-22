<?php

namespace App\Http\Controllers\Petshop\Vacinas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GrupoVacinacaoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:vacinacoes_create', ['only' => ['create', 'store']]);
        $this->middleware('permission:vacinacoes_edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:vacinacoes_view', ['only' => ['index']]);
        $this->middleware('permission:vacinacoes_delete', ['only' => ['destroy']]);
    }

    public function index(Request $request)
    {
        abort(501, 'Módulo de grupos de vacinação em desenvolvimento.');
    }

    public function create()
    {
        abort(501, 'Módulo de grupos de vacinação em desenvolvimento.');
    }

    public function store(Request $request)
    {
        abort(501, 'Módulo de grupos de vacinação em desenvolvimento.');
    }

    public function edit($id)
    {
        abort(501, 'Módulo de grupos de vacinação em desenvolvimento.');
    }

    public function update(Request $request, $id)
    {
        abort(501, 'Módulo de grupos de vacinação em desenvolvimento.');
    }

    public function destroy($id)
    {
        abort(501, 'Módulo de grupos de vacinação em desenvolvimento.');
    }
}
