<?php

declare(strict_types=1);

namespace App\Http\Controllers\V2\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoriaConta;
use App\Models\Cliente;
use App\Models\ContaReceber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

class ContasReceberController extends Controller
{
    public function index(Request $request)
    {
        $empresaId = $this->getEmpresaId();

        $locaisUsuario = __getLocaisAtivoUsuario();
        $locaisIds = $locaisUsuario->pluck('id')->all();

        $clienteId = $request->input('cliente_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $filtroData = (string) ($request->input('filtro_data') ?? 'data_vencimento');
        $status = $request->input('status');
        $categoriaContaId = $request->input('categoria_conta_id');
        $ordem = $request->input('ordem');
        $localId = $request->input('local_id');

        if ($filtroData === 'data_recebimento') {
            $status = '1';
        }

        $query = ContaReceber::query()
            ->where('empresa_id', $empresaId)
            ->with(['cliente', 'categoria', 'localizacao'])
            ->when($clienteId, fn ($q) => $q->where('cliente_id', (int) $clienteId))
            ->when($startDate, fn ($q) => $q->whereDate($filtroData, '>=', (string) $startDate))
            ->when($endDate, fn ($q) => $q->whereDate($filtroData, '<=', (string) $endDate))
            ->when($localId, fn ($q) => $q->where('local_id', (int) $localId))
            ->when($categoriaContaId, fn ($q) => $q->where('categoria_conta_id', (int) $categoriaContaId))
            ->when(!$localId, fn ($q) => $q->whereIn('local_id', $locaisIds))
            ->when($status !== null && $status !== '', function ($q) use ($status) {
                $value = (string) $status;
                if ($value === '1' || $value === '0') $q->where('status', (int) $value);
            })
            ->when($ordem !== null && $ordem !== '', fn ($q) => $q->orderBy('data_vencimento', 'asc'))
            ->when($ordem === null || $ordem === '', fn ($q) => $q->orderBy('created_at', 'asc'));

        $data = $query->paginate((int) env('PAGINACAO', 10))->appends($request->all());

        return response()->json([
            'data' => $data->getCollection()->map(fn (ContaReceber $c) => $this->toV2Payload($c))->values(),
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

        $clientes = Cliente::query()
            ->where('empresa_id', $empresaId)
            ->orderBy('razao_social')
            ->limit(500)
            ->get(['id', 'razao_social'])
            ->map(fn (Cliente $c) => ['id' => (string) $c->id, 'label' => (string) ($c->razao_social ?? '')])
            ->values();

        $categorias = CategoriaConta::query()
            ->where('empresa_id', $empresaId)
            ->where('status', 1)
            ->where('tipo', 'receber')
            ->orderBy('nome')
            ->get(['id', 'nome'])
            ->map(fn (CategoriaConta $c) => ['id' => (string) $c->id, 'label' => (string) ($c->nome ?? '')])
            ->values();

        $locais = __getLocaisAtivoUsuario()
            ->map(fn ($l) => ['id' => (string) $l->id, 'label' => (string) ($l->descricao ?? '')])
            ->values();

        $multiLocal = __countLocalAtivo() > 1 ? 1 : 0;

        $tiposPagamento = [];
        foreach (ContaReceber::tiposPagamento() as $value => $label) {
            $tiposPagamento[] = ['value' => (string) $value, 'label' => (string) $label];
        }

        return response()->json([
            'clientes' => $clientes,
            'categorias' => $categorias,
            'locais' => $locais,
            'multiLocal' => $multiLocal,
            'status' => [
                ['value' => '1', 'label' => 'Recebida'],
                ['value' => '0', 'label' => 'Pendente'],
            ],
            'filtroData' => [
                ['value' => 'data_vencimento', 'label' => 'Data de vencimento'],
                ['value' => 'data_recebimento', 'label' => 'Data de recebimento'],
            ],
            'ordem' => [
                ['value' => '', 'label' => 'Data de cadastro'],
                ['value' => '1', 'label' => 'Data de vencimento'],
            ],
            'tiposPagamento' => $tiposPagamento,
        ]);
    }

    public function show(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = ContaReceber::query()
            ->where('empresa_id', $empresaId)
            ->with(['cliente', 'categoria', 'localizacao'])
            ->findOrFail($id);

        return response()->json($this->toV2Payload($c));
    }

    public function store(Request $request)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        try {
            DB::beginTransaction();

            $status = $this->toBoolInt($validated['status'] ?? '0');

            $valorIntegral = $this->parseMoneyBr((string) ($validated['valor_integral'] ?? '0'));
            $valorRecebido = $this->parseMoneyBr((string) ($validated['valor_recebido'] ?? '0'));
            $dataRecebimento = (string) ($validated['data_recebimento'] ?? '');

            if ($status === 1) {
                if ($valorRecebido <= 0) $valorRecebido = $valorIntegral;
                if ($dataRecebimento === '') $dataRecebimento = date('Y-m-d');
            } else {
                $valorRecebido = 0;
                $dataRecebimento = null;
            }

            $c = ContaReceber::create([
                'empresa_id' => $empresaId,
                'local_id' => $validated['local_id'] !== '' ? (int) $validated['local_id'] : null,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'cliente_id' => (int) $validated['cliente_id'],
                'categoria_conta_id' => $validated['categoria_conta_id'] !== '' ? (int) $validated['categoria_conta_id'] : null,
                'valor_integral' => $valorIntegral,
                'valor_recebido' => $valorRecebido,
                'data_vencimento' => (string) ($validated['data_vencimento'] ?? ''),
                'data_recebimento' => $dataRecebimento,
                'status' => $status,
                'tipo_pagamento' => (string) ($validated['tipo_pagamento'] ?? ''),
                'observacao' => (string) ($validated['observacao'] ?? ''),
                'observacao2' => (string) ($validated['observacao2'] ?? ''),
                'observacao3' => (string) ($validated['observacao3'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível salvar a conta a receber.'], 422);
        }

        return response()->json(['id' => (string) $c->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $empresaId = $this->getEmpresaId();
        $validated = $this->validatePayload($request);

        $c = ContaReceber::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $status = $this->toBoolInt($validated['status'] ?? (string) ($c->status ?? 0));

            $valorIntegral = $this->parseMoneyBr((string) ($validated['valor_integral'] ?? '0'));
            $valorRecebido = $this->parseMoneyBr((string) ($validated['valor_recebido'] ?? '0'));
            $dataRecebimento = (string) ($validated['data_recebimento'] ?? '');

            if ($status === 1) {
                if ($valorRecebido <= 0) $valorRecebido = $valorIntegral;
                if ($dataRecebimento === '') $dataRecebimento = date('Y-m-d');
            } else {
                $valorRecebido = 0;
                $dataRecebimento = null;
            }

            $c->update([
                'local_id' => $validated['local_id'] !== '' ? (int) $validated['local_id'] : null,
                'descricao' => (string) ($validated['descricao'] ?? ''),
                'cliente_id' => (int) $validated['cliente_id'],
                'categoria_conta_id' => $validated['categoria_conta_id'] !== '' ? (int) $validated['categoria_conta_id'] : null,
                'valor_integral' => $valorIntegral,
                'valor_recebido' => $valorRecebido,
                'data_vencimento' => (string) ($validated['data_vencimento'] ?? ''),
                'data_recebimento' => $dataRecebimento,
                'status' => $status,
                'tipo_pagamento' => (string) ($validated['tipo_pagamento'] ?? ''),
                'observacao' => (string) ($validated['observacao'] ?? ''),
                'observacao2' => (string) ($validated['observacao2'] ?? ''),
                'observacao3' => (string) ($validated['observacao3'] ?? ''),
            ]);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            report($exception);
            return response()->json(['message' => 'Não foi possível atualizar a conta a receber.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(string $id)
    {
        $empresaId = $this->getEmpresaId();

        $c = ContaReceber::query()
            ->where('empresa_id', $empresaId)
            ->findOrFail($id);

        try {
            $c->delete();
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Não foi possível excluir a conta a receber.'], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function toV2Payload(ContaReceber $c): array
    {
        return [
            'id' => (string) $c->id,
            'local_id' => (string) ($c->local_id ?? ''),
            'local_nome' => (string) ($c->localizacao?->descricao ?? ''),
            'descricao' => (string) ($c->descricao ?? ''),
            'cliente_id' => (string) ($c->cliente_id ?? ''),
            'cliente_nome' => (string) ($c->cliente?->razao_social ?? ''),
            'categoria_conta_id' => (string) ($c->categoria_conta_id ?? ''),
            'categoria_nome' => (string) ($c->categoria?->nome ?? ''),
            'valor_integral' => $this->formatMoneyBr((float) ($c->valor_integral ?? 0)),
            'valor_recebido' => $this->formatMoneyBr((float) ($c->valor_recebido ?? 0)),
            'data_vencimento' => (string) ($c->data_vencimento ?? ''),
            'data_recebimento' => (string) ($c->data_recebimento ?? ''),
            'status' => (string) ((int) ($c->status ?? 0)),
            'tipo_pagamento' => (string) ($c->tipo_pagamento ?? ''),
            'observacao' => (string) ($c->observacao ?? ''),
            'observacao2' => (string) ($c->observacao2 ?? ''),
            'observacao3' => (string) ($c->observacao3 ?? ''),
            'created_at' => optional($c->created_at)->toISOString(),
            'updated_at' => optional($c->updated_at)->toISOString(),
        ];
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'local_id' => ['nullable', 'string'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'cliente_id' => ['required', 'string'],
            'categoria_conta_id' => ['nullable', 'string'],
            'valor_integral' => ['required', 'string'],
            'valor_recebido' => ['nullable', 'string'],
            'data_vencimento' => ['required', 'string'],
            'data_recebimento' => ['nullable', 'string'],
            'status' => ['required', 'string'],
            'tipo_pagamento' => ['required', 'string'],
            'observacao' => ['nullable', 'string'],
            'observacao2' => ['nullable', 'string'],
            'observacao3' => ['nullable', 'string'],
        ]);
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

    private function getEmpresaId(): int
    {
        return (int) (Auth::user()?->empresa?->empresa_id ?? 0);
    }
}

