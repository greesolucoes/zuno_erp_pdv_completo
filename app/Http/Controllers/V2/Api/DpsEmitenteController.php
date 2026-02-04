<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DpsEmitenteController extends Controller
{
    public function show(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        if ($empresaId <= 0) {
            return response()->json(['message' => 'Empresa não encontrada.'], 401);
        }

        /** @var Empresa $empresa */
        $empresa = Empresa::query()->with('cidade')->findOrFail($empresaId);

        $doc = preg_replace('/\\D+/', '', (string) $empresa->cpf_cnpj);
        $tipoInscricao = strlen($doc) === 11 ? 'CPF' : 'CNPJ';

        return response()->json([
            'tipoInscricao' => $tipoInscricao,
            'inscricao' => $doc,
            'razaoSocial' => (string) ($empresa->nome ?? ''),
            'email' => (string) ($empresa->email ?? ''),
            'telefone' => preg_replace('/\\D+/', '', (string) ($empresa->celular ?? '')),
            'cidade' => [
                'codigo' => (int) ($empresa->cidade?->codigo ?? 0),
                'nome' => (string) ($empresa->cidade?->nome ?? ''),
                'uf' => (string) ($empresa->cidade?->uf ?? ''),
            ],
            'endereco' => [
                'cep' => preg_replace('/\\D+/', '', (string) ($empresa->cep ?? '')),
                'logradouro' => (string) ($empresa->rua ?? ''),
                'numero' => (string) ($empresa->numero ?? ''),
                'bairro' => (string) ($empresa->bairro ?? ''),
                'complemento' => (string) ($empresa->complemento ?? ''),
            ],
            'tributacao' => (string) ($empresa->tributacao ?? ''),
        ]);
    }

    private function getEmpresaId(): int
    {
        return (int) (Auth::user()?->empresa?->empresa_id ?? 0);
    }
}

