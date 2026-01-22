<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Empresa;
use App\Models\Permission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    private const PERMISSION_MODULE_ORDER = [
        // Espelhado do menu lateral (ordem importa)
        'Produtos',
        'Atendimento',
        'Serviços',
        'Ordem de Serviço',
        'Ordem de Produção',
        'Agendamentos',
        'Usuários',
        'Pessoas',
        'Gestão Pessoal',
        'Compras',
        'Devolução',
        'PDV',
        'Vendas',
        'Financeiro',
        'NFCe',
        'Pré Venda',
        'Cardápio',
        'NFSe',
        'Veículos',
        'Planejamento de Custos',
        'Controle de Fretes',
        'CTe',
        'CTe Os',
        'MDFe',
        'Ecommerce',
        'Mercado Livre',
        'Woocommerce',
        'Nuvem Shop',
        'Delivery/Marketplace',
        'Localizações',
        'Reservas',
        'IFood',
        'CRM',
        'Sped',
        'Configuração',
        'Fiscal',
        'Pet Shop',
    ];

    private const PERMISSION_MODULE_RULES = [
        'Pet Shop' => [
            '/^(pacientes|especies|racas|pelagens|diagnosticos|consultas|exames)_/',
            '/^petshop_/',
            '/^vet_/',
            '/^(vacinas|vacinacoes)_/',
            '/^(tele_entregas|tipos_tele_entregas)_/',
            '/^(hoteis|quartos|creches|turmas|esteticas)_/',
        ],
        'Produtos' => [
            '/^produtos_/',
            '/^categoria_produtos_/',
            '/^variacao_/',
            '/^marcas_/',
            '/^estoque_/',
            '/^inventario_/',
            '/^lista_preco_/',
            '/^transferencia_estoque_/',
        ],
        'Atendimento' => [
            '/^atendimentos_/',
        ],
        'Serviços' => [
            '/^servico_/',
            '/^categoria_servico_/',
        ],
        'Ordem de Serviço' => [
            '/^ordem_servico_/',
        ],
        'Ordem de Produção' => [
            '/^ordem_producao_/',
        ],
        'Agendamentos' => [
            '/^agendamento_/',
        ],
        'Usuários' => [
            '/^usuarios_/',
            '/^controle_acesso_/',
            '/^atribuicoes_/',
        ],
        'Pessoas' => [
            '/^clientes_/',
            '/^fornecedores_/',
            '/^transportadoras_/',
        ],
        'Gestão Pessoal' => [
            '/^funcionario_/',
            '/^apuracao_mensal_/',
            '/^comissao_/',
        ],
        'Compras' => [
            '/^compras_/',
            '/^manifesto_/',
            '/^cotacao_/',
        ],
        'Devolução' => [
            '/^devolucao_/',
        ],
        'PDV' => [
            '/^pdv_/',
            '/^mesa_/',
            '/^troca_/',
            '/^impressora_pedido_/',
        ],
        'Vendas' => [
            '/^nfe_/',
            '/^orcamento_/',
            '/^pre_venda_/', // fallback (aba específica vem depois)
            '/^difal_/',
            '/^contigencia_/',
            '/^arquivos_xml_/',
        ],
        'Financeiro' => [
            '/^conta_pagar_/',
            '/^conta_receber_/',
            '/^caixa_/',
            '/^boleto_/',
            '/^contas_(empresa|boleto)_/',
            '/^taxa_pagamento_/',
            '/^convenio_/',
        ],
        'NFCe' => [
            '/^nfce_/',
        ],
        'Pré Venda' => [
            '/^pre_venda_/',
        ],
        'Cardápio' => [
            '/^cardapio_/',
        ],
        'NFSe' => [
            '/^nfse_/',
        ],
        'Veículos' => [
            '/^veiculos_/',
        ],
        'Planejamento de Custos' => [
            '/^planejamento_custo_/',
            '/^projeto_custo_/',
        ],
        'Controle de Fretes' => [
            '/^frete_/',
            '/^tipo_despesa_frete_/',
        ],
        'CTe Os' => [
            '/^cte_os_/',
        ],
        'CTe' => [
            '/^cte_/',
        ],
        'MDFe' => [
            '/^mdfe_/',
        ],
        'Ecommerce' => [
            '/^ecommerce_/',
        ],
        'Mercado Livre' => [
            '/^mercado_livre_/',
        ],
        'Woocommerce' => [
            '/^woocommerce_/',
        ],
        'Nuvem Shop' => [
            '/^nuvem_shop_/',
        ],
        'Delivery/Marketplace' => [
            '/^delivery_/',
        ],
        'Localizações' => [
            '/^localizacao_/',
        ],
        'Reservas' => [
            '/^config_reserva_/',
            '/^categoria_acomodacao_/',
            '/^acomodacao_/',
            '/^frigobar_/',
            '/^reserva_/',
        ],
        'IFood' => [
            '/^ifood_/',
        ],
        'CRM' => [
            '/^crm_/',
        ],
        'Sped' => [
            '/^sped_/',
        ],
        'Configuração' => [
            '/^categoria_conta_/',
            '/^emitente_/',
            '/^natureza_operacao_/',
            '/^config_/',
            '/^cashback_config_/',
            '/^config_produto_fiscal_/',
            '/^config_fiscal_usuario_/',
            '/^email_/',
            '/^relacao_/',
            '/^unidade_/',
            '/^laboratorio_/',
            '/^tratamento_otica_/',
            '/^formato_armacao_/',
            '/^plano_contas_/',
            '/^escritorio_/',
            '/^manutencao_/',
            '/^frigo/',
        ],
        'Fiscal' => [
            '/^natureza_operacao_/',
            '/^emitente_/',
            '/^arquivos_xml_/',
            '/^sped_/',
            '/^cte_/',
            '/^mdfe_/',
            '/^config_fiscal_usuario_/',
            '/^config_produto_fiscal_/',
            '/^config_tef_/',
            '/^cardapio_/',
            '/^metas_/',
            '/^relatorio_/',
            '/^categoria_conta_/',
            '/^compras_/', // fallback (caso regras não batam antes)
        ],
    ];


    public function index(Request $request)
    {
        $empresa = $request->empresa;

        $data = Role::orderBy('id', 'desc')
        ->when($empresa, function ($q) use ($empresa) {
            return $q->where('empresa_id', $empresa);
        })
        ->when(!empty($request->descricao), function ($q) use ($request) {
            return $q->where('description', 'LIKE', "%$request->descricao%");
        })
        ->paginate(30);
        if($empresa){
            $empresa = Empresa::findOrFail($empresa);
        }else{
            $empresa = null;
        }

        return view('roles.index', compact('data', 'empresa'));
    }

    public function create(){
        $permissions = Permission::orderBy('description')->get();
        $permissionTabs = $this->buildPermissionTabs($permissions);

        return view('roles.create', compact('permissions', 'permissionTabs'));
    }

    public function store(Request $request)
    {
        Validator::make(
            $request->all(),
            $this->rules($request)
        )->validate();

        try{
            $request->merge([
                'type_user' => 2
            ]);
            $item = Role::create($request->except('permissions'));

            $item->permissions()->attach($request->permissions);
            session()->flash("flash_success", 'Registro criado com sucesso.');

        } catch (\Exception $e) {
            session()->flash("flash_error", 'Algo deu errado: '. $e->getMessage());
        }

        return redirect()->route('roles.index');
    }

    public function edit($id){
        $item = Role::findOrFail($id);
        if($item->name == 'gestor_plataforma'){
            session()->flash("flash_error", 'Não é permitido editar esse registro!');
            return redirect()->route('roles.index');
        }
        $permissions = Permission::orderBy('description')->get();
        $permissionTabs = $this->buildPermissionTabs($permissions);

        return view('roles.edit', compact('item', 'permissions', 'permissionTabs'));
    }

    public function update(Request $request, $id)
    {
        $item = Role::findOrFail($id);

        Validator::make(
            $request->all(),
            $this->rules($request, $item->getKey())
        )->validate();

        try{

            $item->fill($request->except(['permissions', 'empresa_id']))->save();
            $item->permissions()->sync($request->permissions);

            session()->flash("flash_success", 'Registro atualizado com sucesso.');

        } catch (\Exception $e) {
            session()->flash("flash_error", 'Algo deu errado: '. $e->getMessage());
        }

        return redirect()->route('roles.index');

    }

    public function destroy($id)
    {
        $item = Role::findOrFail($id);

        try {
            $item->delete();
            session()->flash("flash_success", 'Registro removido com sucesso.');
        } catch (\Exception $e) {
            session()->flash("flash_error", 'Algo deu errado: '. $e->getMessage());
        }
        return redirect()->route('roles.index');
    }

    private function rules(Request $request, $primaryKey = null, bool $changeMessages = false)
    {
        $rules = [
            'name' => ['required', 'max:40'],
            'description' => ['required', 'max:40'],
            'permissions' => ['required']
        ];

        if (empty($primaryKey)) {
            $rules['name'][] = Rule::unique('roles');
        } else {
            $rules['name'][] = Rule::unique('roles')->ignore($primaryKey);
        }

        $messages = [];

        return !$changeMessages ? $rules : $messages;
    }

    private function buildPermissionTabs($permissions): array
    {
        $tabs = [];

        foreach (self::PERMISSION_MODULE_ORDER as $moduleName) {
            $tabs[$moduleName] = [];
        }

        foreach ($permissions as $permission) {
            $module = $this->moduleForPermissionName((string) $permission->name);
            $resource = $this->resourceForPermissionName((string) $permission->name);

            $tabs[$module] ??= [];
            $tabs[$module][$resource] ??= [];
            $tabs[$module][$resource][] = $permission;
        }

        $orderedTabs = [];
        foreach (self::PERMISSION_MODULE_ORDER as $moduleName) {
            $orderedTabs[$moduleName] = $tabs[$moduleName] ?? [];
            unset($tabs[$moduleName]);
        }

        foreach ($tabs as $moduleName => $resourceGroups) {
            $orderedTabs[$moduleName] = $resourceGroups;
        }

        foreach ($orderedTabs as $moduleName => $resourceGroups) {
            ksort($resourceGroups);

            foreach ($resourceGroups as $resource => $permissionList) {
                usort($permissionList, function ($a, $b) {
                    return strcmp((string) $a->description, (string) $b->description);
                });
                $resourceGroups[$resource] = $permissionList;
            }

            $orderedTabs[$moduleName] = $resourceGroups;
        }

        return $orderedTabs;
    }

    private function moduleForPermissionName(string $permissionName): string
    {
        foreach (self::PERMISSION_MODULE_RULES as $moduleName => $patterns) {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $permissionName) === 1) {
                    return $moduleName;
                }
            }
        }

        return 'Configuração';
    }

    private function resourceForPermissionName(string $permissionName): string
    {
        $parts = explode('_', $permissionName);
        if (count($parts) < 2) {
            return $permissionName;
        }

        array_pop($parts);

        return implode('_', $parts);
    }

}
