<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaServico;
use App\Models\Cidade;
use App\Models\Servico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ServicosController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $this->setNumeroSequencial($empresaId);
        $this->insertHash($empresaId);

        $busca = trim((string) ($request->input('busca') ?? $request->input('search') ?? ''));

        $query = Servico::query()
            ->where('empresa_id', $empresaId)
            ->with(['categoria'])
            ->when($busca !== '', function ($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%");
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $value = (string) $request->input('status');
                if ($value === '1' || $value === '0') {
                    $q->where('status', (int) $value);
                }
            })
            ->orderBy('nome');

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (Servico $s) => $this->toV2Payload($s))->values(),
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
        $empresaId = $this->getEmpresaId();

        $categorias = CategoriaServico::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (CategoriaServico $c) => ['id' => (string) $c->id, 'label' => (string) ($c->nome ?? '')])
            ->values();

        $empresa = Auth::user()?->empresa;

        return response()->json([
            'categorias' => $categorias,
            'status' => [
                ['value' => '1', 'label' => 'Ativo'],
                ['value' => '0', 'label' => 'Inativo'],
            ],
            'simNao' => [
                ['value' => '1', 'label' => 'Sim'],
                ['value' => '0', 'label' => 'Não'],
            ],
            'unidadesCobranca' => [
                ['value' => 'UND', 'label' => 'UND'],
                ['value' => 'HORAS', 'label' => 'HORAS'],
                ['value' => 'MIN', 'label' => 'MIN'],
            ],
            'ufs' => array_map(
                fn ($value, $label) => ['value' => (string) $value, 'label' => (string) $label],
                array_keys(Cidade::estados()),
                array_values(Cidade::estados()),
            ),
            'plans' => [
                'reservas' => __isActivePlan($empresa, 'Reservas') ? 1 : 0,
                'delivery' => __isActivePlan($empresa, 'Delivery') ? 1 : 0,
            ],
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $s = Servico::query()
            ->where('empresa_id', $empresaId)
            ->with(['categoria'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($s));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $numeroSequencial = $this->nextNumeroSequencial($empresaId);

            $marketplace = $this->toBoolInt($validated['marketplace'] ?? '0');
            $padraoReservaNfse = $this->toBoolInt($validated['padrao_reserva_nfse'] ?? '0');

            if ($padraoReservaNfse === 1) {
                Servico::query()->where('empresa_id', $empresaId)->update(['padrao_reserva_nfse' => 0]);
            }

            $s = Servico::create([
                'empresa_id' => $empresaId,
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'categoria_id' => $validated['categoria_id'] !== '' ? (int) $validated['categoria_id'] : null,
                'unidade_cobranca' => $this->normalizeText($validated['unidade_cobranca'] ?? 'UND'),
                'valor' => $this->parseMoneyBr((string) ($validated['valor'] ?? '0')),
                'tempo_servico' => (int) ($validated['tempo_servico'] ?? 0),
                'comissao' => $this->parseMoneyBr((string) ($validated['comissao'] ?? '0')),
                'tempo_adicional' => (string) ($validated['tempo_adicional'] ?? '0'),
                'valor_adicional' => $this->parseMoneyBr((string) ($validated['valor_adicional'] ?? '0')),
                'tempo_tolerancia' => (int) ($validated['tempo_tolerancia'] ?? 0),
                'codigo_servico' => $this->normalizeText($validated['codigo_servico'] ?? ''),
                'codigo_tributacao_municipio' => $this->normalizeText($validated['codigo_tributacao_municipio'] ?? ''),
                'status' => $this->toBoolInt($validated['status'] ?? '1'),
                'reserva' => $this->toBoolInt($validated['reserva'] ?? '0'),
                'padrao_reserva_nfse' => $padraoReservaNfse,
                'marketplace' => $marketplace,
                'hash_delivery' => $marketplace === 1 ? Str::random(50) : null,
                'destaque_marketplace' => $this->toBoolInt($validated['destaque_marketplace'] ?? '0'),
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'numero_sequencial' => $numeroSequencial,

                'aliquota_iss' => $this->parsePercentBr((string) ($validated['aliquota_iss'] ?? '0')),
                'aliquota_pis' => $this->parsePercentBr((string) ($validated['aliquota_pis'] ?? '0')),
                'aliquota_cofins' => $this->parsePercentBr((string) ($validated['aliquota_cofins'] ?? '0')),
                'aliquota_inss' => $this->parsePercentBr((string) ($validated['aliquota_inss'] ?? '0')),
                'aliquota_ir' => $this->parsePercentBr((string) ($validated['aliquota_ir'] ?? '0')),
                'aliquota_csll' => $this->parsePercentBr((string) ($validated['aliquota_csll'] ?? '0')),
                'valor_deducoes' => $this->parseMoneyBr((string) ($validated['valor_deducoes'] ?? '0')),
                'desconto_incondicional' => $this->parseMoneyBr((string) ($validated['desconto_incondicional'] ?? '0')),
                'desconto_condicional' => $this->parseMoneyBr((string) ($validated['desconto_condicional'] ?? '0')),
                'outras_retencoes' => $this->parseMoneyBr((string) ($validated['outras_retencoes'] ?? '0')),
                'codigo_cnae' => $this->normalizeText($validated['codigo_cnae'] ?? ''),
                'estado_local_prestacao_servico' => $this->normalizeText($validated['estado_local_prestacao_servico'] ?? ''),
                'natureza_operacao' => $this->normalizeText($validated['natureza_operacao'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar o serviço.'], 422);
        }

        return response()->json(['id' => (string) $s->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $s = Servico::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $marketplace = $this->toBoolInt($validated['marketplace'] ?? (string) ($s->marketplace ?? 0));
            $padraoReservaNfse = $this->toBoolInt($validated['padrao_reserva_nfse'] ?? (string) ($s->padrao_reserva_nfse ?? 0));

            if ($padraoReservaNfse === 1) {
                Servico::query()->where('empresa_id', $empresaId)->update(['padrao_reserva_nfse' => 0]);
            }

            $payload = [
                'nome' => $this->normalizeText($validated['nome'] ?? ''),
                'categoria_id' => $validated['categoria_id'] !== '' ? (int) $validated['categoria_id'] : null,
                'unidade_cobranca' => $this->normalizeText($validated['unidade_cobranca'] ?? 'UND'),
                'valor' => $this->parseMoneyBr((string) ($validated['valor'] ?? '0')),
                'tempo_servico' => (int) ($validated['tempo_servico'] ?? 0),
                'comissao' => $this->parseMoneyBr((string) ($validated['comissao'] ?? '0')),
                'tempo_adicional' => (string) ($validated['tempo_adicional'] ?? '0'),
                'valor_adicional' => $this->parseMoneyBr((string) ($validated['valor_adicional'] ?? '0')),
                'tempo_tolerancia' => (int) ($validated['tempo_tolerancia'] ?? 0),
                'codigo_servico' => $this->normalizeText($validated['codigo_servico'] ?? ''),
                'codigo_tributacao_municipio' => $this->normalizeText($validated['codigo_tributacao_municipio'] ?? ''),
                'status' => $this->toBoolInt($validated['status'] ?? (string) ($s->status ?? 1)),
                'reserva' => $this->toBoolInt($validated['reserva'] ?? (string) ($s->reserva ?? 0)),
                'padrao_reserva_nfse' => $padraoReservaNfse,
                'marketplace' => $marketplace,
                'destaque_marketplace' => $this->toBoolInt($validated['destaque_marketplace'] ?? (string) ($s->destaque_marketplace ?? 0)),
                'descricao' => (string) ($validated['descricao'] ?? ''),

                'aliquota_iss' => $this->parsePercentBr((string) ($validated['aliquota_iss'] ?? '0')),
                'aliquota_pis' => $this->parsePercentBr((string) ($validated['aliquota_pis'] ?? '0')),
                'aliquota_cofins' => $this->parsePercentBr((string) ($validated['aliquota_cofins'] ?? '0')),
                'aliquota_inss' => $this->parsePercentBr((string) ($validated['aliquota_inss'] ?? '0')),
                'aliquota_ir' => $this->parsePercentBr((string) ($validated['aliquota_ir'] ?? '0')),
                'aliquota_csll' => $this->parsePercentBr((string) ($validated['aliquota_csll'] ?? '0')),
                'valor_deducoes' => $this->parseMoneyBr((string) ($validated['valor_deducoes'] ?? '0')),
                'desconto_incondicional' => $this->parseMoneyBr((string) ($validated['desconto_incondicional'] ?? '0')),
                'desconto_condicional' => $this->parseMoneyBr((string) ($validated['desconto_condicional'] ?? '0')),
                'outras_retencoes' => $this->parseMoneyBr((string) ($validated['outras_retencoes'] ?? '0')),
                'codigo_cnae' => $this->normalizeText($validated['codigo_cnae'] ?? ''),
                'estado_local_prestacao_servico' => $this->normalizeText($validated['estado_local_prestacao_servico'] ?? ''),
                'natureza_operacao' => $this->normalizeText($validated['natureza_operacao'] ?? ''),
            ];

            if ($marketplace === 1 && ($s->hash_delivery === null || $s->hash_delivery === '')) {
                $payload['hash_delivery'] = Str::random(50);
            }

            $s->update($payload);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar o serviço.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $s = Servico::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $s->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir o serviço.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(Servico $s): array
    {
        return [
            'id' => (string) $s->id,
            'numero_sequencial' => (string) ((int) ($s->numero_sequencial ?? 0)),
            'nome' => (string) ($s->nome ?? ''),
            'categoria_id' => (string) ($s->categoria_id ?? ''),
            'categoria_nome' => (string) ($s->categoria?->nome ?? ''),
            'unidade_cobranca' => (string) ($s->unidade_cobranca ?? 'UND'),
            'valor' => $this->formatMoneyBr((float) ($s->valor ?? 0)),
            'tempo_servico' => (string) ((int) ($s->tempo_servico ?? 0)),
            'comissao' => $this->formatMoneyBr((float) ($s->comissao ?? 0)),
            'tempo_adicional' => (string) ($s->tempo_adicional ?? '0'),
            'valor_adicional' => $this->formatMoneyBr((float) ($s->valor_adicional ?? 0)),
            'tempo_tolerancia' => (string) ((int) ($s->tempo_tolerancia ?? 0)),
            'codigo_servico' => (string) ($s->codigo_servico ?? ''),
            'codigo_tributacao_municipio' => (string) ($s->codigo_tributacao_municipio ?? ''),
            'status' => (string) ((int) ($s->status ?? 0)),
            'reserva' => (string) ((int) ($s->reserva ?? 0)),
            'padrao_reserva_nfse' => (string) ((int) ($s->padrao_reserva_nfse ?? 0)),
            'marketplace' => (string) ((int) ($s->marketplace ?? 0)),
            'destaque_marketplace' => (string) ((int) ($s->destaque_marketplace ?? 0)),
            'descricao' => (string) ($s->descricao ?? ''),
            'aliquota_iss' => $this->formatPercentBr((float) ($s->aliquota_iss ?? 0)),
            'aliquota_pis' => $this->formatPercentBr((float) ($s->aliquota_pis ?? 0)),
            'aliquota_cofins' => $this->formatPercentBr((float) ($s->aliquota_cofins ?? 0)),
            'aliquota_inss' => $this->formatPercentBr((float) ($s->aliquota_inss ?? 0)),
            'aliquota_ir' => $this->formatPercentBr((float) ($s->aliquota_ir ?? 0)),
            'aliquota_csll' => $this->formatPercentBr((float) ($s->aliquota_csll ?? 0)),
            'valor_deducoes' => $this->formatMoneyBr((float) ($s->valor_deducoes ?? 0)),
            'desconto_incondicional' => $this->formatMoneyBr((float) ($s->desconto_incondicional ?? 0)),
            'desconto_condicional' => $this->formatMoneyBr((float) ($s->desconto_condicional ?? 0)),
            'outras_retencoes' => $this->formatMoneyBr((float) ($s->outras_retencoes ?? 0)),
            'codigo_cnae' => (string) ($s->codigo_cnae ?? ''),
            'estado_local_prestacao_servico' => (string) ($s->estado_local_prestacao_servico ?? ''),
            'natureza_operacao' => (string) ($s->natureza_operacao ?? ''),
            'created_at' => optional($s->created_at)->toISOString(),
            'updated_at' => optional($s->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'categoria_id' => ['nullable', 'string'],
            'unidade_cobranca' => ['nullable', 'string', 'max:10'],
            'valor' => ['nullable', 'string'],
            'tempo_servico' => ['nullable', 'string'],
            'comissao' => ['nullable', 'string'],
            'tempo_adicional' => ['nullable', 'string'],
            'valor_adicional' => ['nullable', 'string'],
            'tempo_tolerancia' => ['nullable', 'string'],
            'codigo_servico' => ['nullable', 'string', 'max:255'],
            'codigo_tributacao_municipio' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'reserva' => ['nullable', 'string'],
            'padrao_reserva_nfse' => ['nullable', 'string'],
            'marketplace' => ['nullable', 'string'],
            'destaque_marketplace' => ['nullable', 'string'],
            'descricao' => ['nullable', 'string'],

            'aliquota_iss' => ['nullable', 'string'],
            'aliquota_pis' => ['nullable', 'string'],
            'aliquota_cofins' => ['nullable', 'string'],
            'aliquota_inss' => ['nullable', 'string'],
            'aliquota_ir' => ['nullable', 'string'],
            'aliquota_csll' => ['nullable', 'string'],
            'valor_deducoes' => ['nullable', 'string'],
            'desconto_incondicional' => ['nullable', 'string'],
            'desconto_condicional' => ['nullable', 'string'],
            'outras_retencoes' => ['nullable', 'string'],
            'codigo_cnae' => ['nullable', 'string', 'max:255'],
            'estado_local_prestacao_servico' => ['nullable', 'string', 'max:2'],
            'natureza_operacao' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function normalizeText(string $value): string
    {
        return trim((string) $value);
    }

    private function toBoolInt($value): int
    {
        $v = (string) $value;
        return $v === '1' ? 1 : 0;
    }

    private function parseMoneyBr(string $input): float
    {
        $normalized = preg_replace('/[^0-9,.-]/', '', $input);
        $normalized = str_replace('.', '', (string) $normalized);
        $normalized = str_replace(',', '.', (string) $normalized);
        return is_numeric($normalized) ? (float) $normalized : 0.0;
    }

    private function formatMoneyBr(float $value): string
    {
        return number_format($value, 2, ',', '.');
    }

    private function parsePercentBr(string $input): float
    {
        return $this->parseMoneyBr($input);
    }

    private function formatPercentBr(float $value): string
    {
        return number_format($value, 2, ',', '.');
    }

    private function getEmpresaId(): int
    {
        return (int) (Auth::user()?->empresa?->empresa_id ?? 0);
    }

    private function insertHash(int $empresaId): void
    {
        $servicos = Servico::query()
            ->where('empresa_id', $empresaId)
            ->whereNull('hash_delivery')
            ->where('marketplace', 1)
            ->get(['id', 'hash_delivery']);

        foreach ($servicos as $s) {
            $s->hash_delivery = Str::random(50);
            $s->save();
        }
    }

    private function nextNumeroSequencial(int $empresaId): int
    {
        $last = Servico::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('numero_sequencial', 'desc')
            ->where('numero_sequencial', '>', 0)
            ->first();

        $numero = $last !== null ? (int) $last->numero_sequencial : 0;
        return $numero + 1;
    }

    private function setNumeroSequencial(int $empresaId): void
    {
        $servicos = Servico::query()
            ->where('empresa_id', $empresaId)
            ->whereNull('numero_sequencial')
            ->get(['id', 'numero_sequencial']);

        if ($servicos->isEmpty()) return;

        $numero = $this->nextNumeroSequencial($empresaId);

        foreach ($servicos as $s) {
            $s->numero_sequencial = $numero;
            $s->save();
            $numero++;
        }
    }
}
