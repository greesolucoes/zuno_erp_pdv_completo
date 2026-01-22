<?php

namespace App\Http\Controllers\Petshop\Animais;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnimalExameController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:exames_create', ['only' => ['create', 'store']]);
        $this->middleware('permission:exames_edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:exames_view', ['only' => ['index']]);
        $this->middleware('permission:exames_delete', ['only' => ['destroy']]);
    }

    public function index(Request $request)
    {
        abort(501, 'Módulo de exames em desenvolvimento.');
    }

    public function create()
    {
        abort(501, 'Módulo de exames em desenvolvimento.');
    }

    public function store(Request $request)
    {
        abort(501, 'Módulo de exames em desenvolvimento.');
    }

    public function edit($id)
    {
        abort(501, 'Módulo de exames em desenvolvimento.');
    }

    public function update(Request $request, $id)
    {
        abort(501, 'Módulo de exames em desenvolvimento.');
    }

    public function destroy($id)
    {
        abort(501, 'Módulo de exames em desenvolvimento.');
    }
}
