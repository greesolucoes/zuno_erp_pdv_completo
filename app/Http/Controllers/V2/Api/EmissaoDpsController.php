<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\Cidade;
use App\Models\Empresa;
use App\Models\Servico;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EmissaoDpsController extends Controller
{
    public function listarMunicipiosParaEmissao(Request $request)
    {
        $empresa = $this->getEmpresa();

        $codigoCidade = (int) ($empresa->cidade?->codigo ?? 0);
        $nomeCidade = (string) ($empresa->cidade?->nome ?? '');

        if ($codigoCidade <= 0 || $nomeCidade === '') {
            return response()->json([]);
        }

        return response()->json([
            ['Codigo' => $codigoCidade, 'Nome' => $nomeCidade],
        ]);
    }

    public function listarEstabelecimentosParaEmissao(Request $request)
    {
        // ERP não armazena IM do Emissor Nacional; usamos TpDados=RFB para o front não exigir IM.
        return response()->json([
            'TpDados' => 'RFB',
            'Lista' => [],
        ]);
    }

    public function recuperarInfoEstabelecimento(Request $request)
    {
        $empresa = $this->getEmpresa();

        $doc = preg_replace('/\\D+/', '', (string) $empresa->cpf_cnpj);

        return response()->json([
            'InfCad' => [
                'Inscricao' => $doc,
                'RazaoSocial' => (string) ($empresa->nome ?? $empresa->nome_fantasia ?? ''),
                'Telefone' => preg_replace('/\\D+/', '', (string) ($empresa->celular ?? '')),
                'Email' => (string) ($empresa->email ?? ''),
                'InfoEndereco' => [
                    'CEP' => preg_replace('/\\D+/', '', (string) ($empresa->cep ?? '')),
                    'Bairro' => (string) ($empresa->bairro ?? ''),
                    'Logradouro' => (string) ($empresa->rua ?? ''),
                    'Numero' => (string) ($empresa->numero ?? ''),
                    'Complemento' => (string) ($empresa->complemento ?? ''),
                ],
            ],
        ]);
    }

    public function recuperarOpcaoSn(Request $request)
    {
        $empresa = $this->getEmpresa();
        $tributacao = mb_strtolower((string) ($empresa->tributacao ?? ''));

        $optanteSn = str_contains($tributacao, 'simples') || str_contains($tributacao, 'mei');

        return response()->json([
            'Tipo' => $optanteSn ? 3 : 1,
            'Descricao' => $optanteSn ? 'Optante pelo Simples Nacional' : 'Não optante pelo Simples Nacional',
        ]);
    }

    public function buscarNomeMunicipio(Request $request)
    {
        $term = trim((string) ($request->input('term') ?? $request->input('q') ?? ''));
        if (mb_strlen($term) < 3) {
            return response()->json(['results' => []]);
        }

        $items = Cidade::query()
            ->where('nome', 'like', '%' . $term . '%')
            ->orderBy('nome')
            ->limit(20)
            ->get(['codigo', 'nome', 'uf'])
            ->map(fn (Cidade $c) => [
                'id' => (string) $c->codigo,
                'text' => trim((string) ($c->nome ?? '')) . '/' . trim((string) ($c->uf ?? '')),
            ])
            ->values();

        return response()->json(['results' => $items]);
    }

    public function buscarNomeServico(Request $request)
    {
        $term = trim((string) ($request->input('term') ?? $request->input('q') ?? ''));
        if (mb_strlen($term) < 3) {
            return response()->json(['results' => []]);
        }

        $empresaId = (int) (Auth::user()?->empresa?->empresa_id ?? 0);

        $buildQuery = function (?int $empresaIdFilter) use ($term) {
            return Servico::query()
                ->when($empresaIdFilter && $empresaIdFilter > 0, fn ($q) => $q->where('empresa_id', $empresaIdFilter))
                ->where(function ($q) use ($term) {
                    $q->where('nome', 'like', '%' . $term . '%')
                        ->orWhere('codigo_servico', 'like', '%' . $term . '%')
                        ->orWhere('codigo_tributacao_municipio', 'like', '%' . $term . '%');
                })
                ->orderBy('nome')
                ->limit(20);
        };

        // Preferência: serviços da empresa logada. Fallback: catálogo global (quando empresa não está vinculada ou não há cadastro).
        $items = $buildQuery($empresaId)->get(['id', 'nome', 'codigo_servico']);
        if ($items->isEmpty()) {
            $items = $buildQuery(null)->get(['id', 'nome', 'codigo_servico']);
        }

        $items = $items
            ->map(fn (Servico $s) => [
                'id' => (string) ($s->codigo_servico ?: $s->id),
                'text' => trim((string) ($s->codigo_servico ?? '')) . ' - ' . trim((string) ($s->nome ?? '')),
            ])
            ->values();

        return response()->json(['results' => $items]);
    }

    public function verificarIncidencia(Request $request)
    {
        $empresa = $this->getEmpresa();

        $codMunPrestacao = (string) ($request->input('codigoMunicipioPrestacao') ?? $request->input('codMunPrestacao') ?? '');
        $paisPrestacao = (string) ($request->input('codigoPaisPrestacao') ?? $request->input('paisPrestacao') ?? 'BR');

        $incidCodigo = 0;
        $incidNome = '';
        $tipo = 1;

        if ($paisPrestacao !== 'BR') {
            $incidCodigo = (int) ($empresa->cidade?->codigo ?? 0);
            $incidNome = (string) ($empresa->cidade?->nome ?? '');
            $tipo = 1;
        } else {
            $incidCodigo = (int) ($codMunPrestacao !== '' ? $codMunPrestacao : ($empresa->cidade?->codigo ?? 0));
            $cidade = Cidade::query()->where('codigo', $incidCodigo)->first();
            $incidNome = (string) ($cidade?->nome ?? $empresa->cidade?->nome ?? '');
            $tipo = 2;
        }

        return response()->json([
            'HaIncidenciaDeISSQN' => true,
            // No legado este campo pode vir como 0 (sem lista) ou lista; mantemos 0 para não exigir seleção municipal.
            'ListaTributacaoMunicipal' => 0,
            'TipoMunicipioIncidencia' => $tipo,
            'Codigo' => $incidCodigo > 0 ? (string) $incidCodigo : null,
            'Nome' => $incidNome,
            'Conveniado' => true,
            'EhConvenioVigente' => true,
            'Mensagem' => null,
            'ServicoRequerTomador' => false,
            'EhAtividadeObra' => false,
            'EhAtividadeEvento' => false,
        ]);
    }

    public function cep(string $cep)
    {
        $cep = preg_replace('/\\D+/', '', $cep);
        if (strlen($cep) !== 8) {
            return response()->json(['message' => 'CEP inválido.'], 422);
        }

        try {
            $resp = Http::timeout(10)->get('https://viacep.com.br/ws/' . $cep . '/json/');
        } catch (ConnectionException) {
            return response()->json(['message' => 'Falha ao consultar CEP.'], 503);
        }

        if (!$resp->ok()) {
            return response()->json(['message' => 'CEP não encontrado.'], 404);
        }

        $data = $resp->json();
        if (!is_array($data) || ($data['erro'] ?? false)) {
            return response()->json(['message' => 'CEP não encontrado.'], 404);
        }

        $uf = (string) ($data['uf'] ?? '');
        $cidadeNome = (string) ($data['localidade'] ?? '');
        $cidade = Cidade::query()
            ->when($uf !== '', fn ($q) => $q->where('uf', $uf))
            ->when($cidadeNome !== '', fn ($q) => $q->where('nome', 'like', $cidadeNome))
            ->first();

        return response()->json([
            'CodigoCompletoMunicipio' => (string) ($cidade?->codigo ?? ''),
            'Municipio' => Str::upper($cidadeNome),
            'SiglaUF' => Str::upper($uf),
            'Bairro' => (string) ($data['bairro'] ?? ''),
            'TipoLogradouro' => '',
            'Logradouro' => (string) ($data['logradouro'] ?? ''),
        ]);
    }

    private function getEmpresa(): Empresa
    {
        $empresaId = (int) (Auth::user()?->empresa?->empresa_id ?? 0);
        if ($empresaId <= 0) {
            abort(401, 'Empresa não encontrada.');
        }

        /** @var Empresa $empresa */
        $empresa = Empresa::query()->with('cidade')->findOrFail($empresaId);

        return $empresa;
    }
}
