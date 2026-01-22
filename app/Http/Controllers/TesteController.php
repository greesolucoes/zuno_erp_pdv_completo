<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nfe;
use App\Models\Nfce;
use App\Models\FaturaNfe;
use App\Models\FaturaNfce;
use App\Models\Empresa;

class TesteController extends Controller
{
    public function index(){

        $empresa_id = 1;
        $data = [];
        $tiposPagamento = Nfce::tiposPagamento();
        $cores = [
            '#3F51B5', '#9C27B0', '#FF9800', '#009688', '#4CAF50', '#E91E63', '#FF5722',
            '#2196F3', '#795548', '#CDDC39', '#673AB7', '#F44336', '#00BCD4', '#8BC34A'
        ];
        $cont = 0;
        foreach($tiposPagamento as $key => $tipo){
            $valorNfe = FaturaNfe::select('fatura_nves.*')
            ->join('nves', 'nves.id', '=', 'fatura_nves.nfe_id')
            ->where('nves.empresa_id', $empresa_id)
            ->where('fatura_nves.tipo_pagamento', $key)
            ->whereMonth('nves.created_at', date('m'))
            ->whereYear('nves.created_at', date('Y'))
            ->where('nves.tpNF', 1)
            ->where('nves.orcamento', 0)
            ->where('nves.estado', '!=', 'cancelado')

            ->sum('valor');

            $valorNfce = FaturaNfce::select('fatura_nfces.*')
            ->join('nfces', 'nfces.id', '=', 'fatura_nfces.nfce_id')
            ->where('nfces.empresa_id', $empresa_id)
            ->where('fatura_nfces.tipo_pagamento', $key)
            ->whereMonth('nfces.created_at', date('m'))
            ->whereYear('nfces.created_at', date('Y'))
            ->where('nfces.estado', '!=', 'cancelado')
            ->sum('valor');

            if($valorNfce + $valorNfe > 0){
                $data[] = [
                    'label' => $tiposPagamento[$key],
                    'value' => $valorNfe + $valorNfce,
                    'color' => $cores[$cont]
                ];
                $cont++;
            }
        }
        echo "<pre>";
        var_dump($data);
        echo "</pre>";

    }
}
