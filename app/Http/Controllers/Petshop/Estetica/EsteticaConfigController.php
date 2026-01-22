<?php

namespace App\Http\Controllers\Petshop\Estetica;

use App\Http\Controllers\Controller;

class EsteticaConfigController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:esteticas_edit', ['only' => ['index']]);
    }

    /**
     * Display the esteticista configuration page.
     */
    public function index()
    {
        return view('petshop.estetica_config.index');
    }
}
