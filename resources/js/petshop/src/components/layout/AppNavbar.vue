<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useNavigationVariant } from '../../composables/useNavigationVariant'

type MenuLink = { label: string; to: string; iconSrc?: string; tooltip?: string }

const props = defineProps<{
  companyName?: string
  cnpj?: string
  homeTo?: string
  links?: MenuLink[]
}>()

const homeTo = props.homeTo ?? '/home'

const links: MenuLink[] =
  props.links ??
  [
    { label: 'Configurações', to: '/perfil/configuracao', iconSrc: '/img/menu-config-35.svg', tooltip: 'Configurações' },
  ]

const companyName = props.companyName ?? 'TEIXX DESENVOLVIMENTO E SOFTWARE LTDA'
const cnpj = props.cnpj ?? '64388348000180'

const { setVariant } = useNavigationVariant()
</script>

<template>
  <nav class="navbar navbar-default navbar-static-top">
    <div class="container">
      <div class="navbar-header">
        <button
          type="button"
          class="navbar-toggle collapsed"
          data-toggle="collapse"
          data-target="#navbar"
          aria-expanded="false"
          aria-controls="navbar"
        >
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <div class="navbar-brand completa">
          <RouterLink :to="homeTo"><img src="/img/logo-nfse-assinatura-horizontal.svg" /></RouterLink>
        </div>
        <div class="navbar-brand simples">
          <RouterLink :to="homeTo"><img src="/img/logo-header-simples.svg" /></RouterLink>
        </div>
      </div>

      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav navbar-right">
          <li>
            <RouterLink :to="homeTo" data-toggle="tooltip" data-placement="bottom" title="Principal">
              <div><img src="/img/menu-home-35.svg" /></div>
              <span class="nome-mobile">Página Principal</span>
            </RouterLink>
          </li>

          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/menu-nova-35.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Nova NFS-e</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Nota Fiscal de Serviço:</li>
              <li><RouterLink to="/dps/pessoas">Emissão completa</RouterLink></li>
              <li><RouterLink to="/dps/pessoas">Lista de emissão</RouterLink></li>
              <li><RouterLink to="/dps/simplificada">Configurações</RouterLink></li>
            
            </ul>
          </li>


           <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/nfe.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Nova NFS-e</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Nota Fiscal Eletrônica:</li>
              <li><RouterLink to="">Emissão completa</RouterLink></li>
              <li><RouterLink to="">Lista de emissão</RouterLink></li>
              <li><RouterLink to="">Buscar xml</RouterLink></li>
              <li><RouterLink to="">Importar xml</RouterLink></li>
            </ul>
          </li>

          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/cadastro-produto.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Novo Produto</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu" style="margin-top: 6px">Cadastro de produtos:</li>
              <li><RouterLink to="/produtos">Produto</RouterLink></li>
              <li><RouterLink to="/produtos/categorias">Categoria</RouterLink></li>
              <li><RouterLink to="/produtos/unidades">Unidade de medidas</RouterLink></li>
              <li><RouterLink to="/produtos/marcas">Marcas</RouterLink></li>
              <li><RouterLink to="">Variação</RouterLink></li>
              <li class="dropdown-header titulo-menu">Estoque:</li>
              <li><RouterLink to="/estoque">Gerenciar estoque</RouterLink></li>
              <li><RouterLink to="">Inventário</RouterLink></li>
              <li><RouterLink to="">Transferência de estoque</RouterLink></li>

            </ul>
          </li>
          
           <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/cadastro-servico.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Novo Serviço</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Cadastro de serviços:</li>
              <li><RouterLink to="/servicos">Serviço</RouterLink></li>
              <li><RouterLink to="/servicos/categorias">Categoria</RouterLink></li>
              <li><RouterLink to="">Ordem de Serviço</RouterLink></li>

            </ul>
          </li>

          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/petshop.svg" style="top: -2px" /><span class="caret"></span></div>
              <span class="nome-mobile">Petshop</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu" style="margin-top: 6px">Petshop</li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Cadastros (Pets)</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/ListaPets">Pets</RouterLink></li>
                  <li><RouterLink to="/Petshop/Especies">Espécies</RouterLink></li>
                  <li><RouterLink to="/Petshop/Racas">Raças</RouterLink></li>
                  <li><RouterLink to="/Petshop/Pelagens">Pelagens</RouterLink></li>
                </ul>
              </li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Cadastros (Planos)</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Planos/Usuarios">Usuários Plano</RouterLink></li>
                  <li><RouterLink to="/Petshop/Planos/Avulso">Usuário Avulso</RouterLink></li>
                </ul>
              </li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Veterinário</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Vet/Cadastros/Medicos">Médico</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/SalasAtendimento">Salas/Atendimento</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/SalasInternacao">Salas/Internação</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/Checklist">Checklist</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/Alergias">Alergias</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/CondicoesCronicas">Condições crônicas</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/Medicamentos">Medicamentos</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/Vacinas">Vacinas</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/ModeloAtendimento">Modelo de Atendimento</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/ModeloAvaliacao">Modelo de Avaliação</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/ModeloPrescricao">Modelo de Prescrição</RouterLink></li>
                </ul>
              </li>

              <li class="dropdown-header titulo-menu" style="margin-top: 6px">Operação</li>
              <li><RouterLink to="/Petshop/Agenda">Agenda Geral</RouterLink></li>
              <li><RouterLink :to="{ path: '/Petshop/Agenda', query: { agendar: '1' } }">Agendamento Rápido</RouterLink></li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Veterinário</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Vet/Atendimentos">Agendamentos</RouterLink></li>
                  <li class="dropdown-submenu">
                    <a href="javascript:void(0);">Prontuários</a>
                    <ul class="dropdown-menu">
                      <li><RouterLink to="/Petshop/Vet/Prontuarios/Fila">Fila de Consultas</RouterLink></li>
                      <li><RouterLink to="/Petshop/Vet/Prontuarios/Consultas">Histórico de Consultas</RouterLink></li>
                      <li><RouterLink to="/Petshop/Vet/Prontuarios/Exames">Histórico de Exames</RouterLink></li>
                      <li><RouterLink to="/Petshop/Vet/Prontuarios/Prescricoes">Histórico de Prescrições</RouterLink></li>
                    </ul>
                  </li>
                  <li class="dropdown-submenu">
                    <a href="javascript:void(0);">Vacinações</a>
                    <ul class="dropdown-menu">
                      <li><RouterLink to="/Petshop/Vet/Vacinacoes/Painel">Painel de vacinação</RouterLink></li>
                      <li><RouterLink to="/Petshop/Vet/Vacinacoes/Historico">Histórico de Vacinas</RouterLink></li>
                      <li><RouterLink to="/Petshop/Vet/Vacinacoes/Aplicar">Aplicar Vacinação</RouterLink></li>
                    </ul>
                  </li>
                  <li class="dropdown-submenu">
                    <a href="javascript:void(0);">Internações</a>
                    <ul class="dropdown-menu">
                      <li><RouterLink to="/Petshop/Vet/Internacoes/Historico">Internação</RouterLink></li>
                      <li><RouterLink to="/Petshop/Vet/Internacoes/Ocupacao">Ocupação de Leitos</RouterLink></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Hotel</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Hotel/Reservas">Agendamentos</RouterLink></li>
                  <li class="dropdown-submenu">
                    <a href="javascript:void(0);">Quartos</a>
                    <ul class="dropdown-menu">
                      <li><RouterLink to="/Petshop/Hotel/Quartos">Gerenciar Quartos</RouterLink></li>
                      <li><RouterLink to="/Petshop/Hotel/Quartos/Eventos">Eventos de Quarto</RouterLink></li>
                      <li><RouterLink to="/Petshop/Hotel/Monitoramento/Hotel">Monitoramento Hotel</RouterLink></li>
                      <li><RouterLink to="/Petshop/Hotel/Monitoramento/Quartos">Monitoramento Quartos</RouterLink></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Creche</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Creche/Reservas">Agendamentos</RouterLink></li>
                  <li class="dropdown-submenu">
                    <a href="javascript:void(0);">Turmas</a>
                    <ul class="dropdown-menu">
                      <li><RouterLink to="/Petshop/Creche/Turmas">Gerenciar Turmas</RouterLink></li>
                      <li><RouterLink to="/Petshop/Creche/Turmas/Eventos">Eventos de Turma</RouterLink></li>
                      <li><RouterLink to="/Petshop/Creche/Monitoramento/Creche">Monitoramento Creche</RouterLink></li>
                      <li><RouterLink to="/Petshop/Creche/Monitoramento/Salas">Monitoramento Salas</RouterLink></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Estética</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Estetica/Gerenciar">Gerenciar Estética</RouterLink></li>
                  <li><RouterLink to="/Petshop/Estetica/Pendentes">Agendamentos Pendentes</RouterLink></li>
                  <li><RouterLink to="/Petshop/Estetica/PendentesAvulso">Agendamentos Avulso Pendentes</RouterLink></li>
                </ul>
              </li>

              <li class="dropdown-header titulo-menu" style="margin-top: 6px">Administração</li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Administração</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Administracao/GerenciarPlanos">Gerenciar Planos</RouterLink></li>
                  <li><RouterLink to="/Petshop/Administracao/Configuracoes">Configurações</RouterLink></li>
                </ul>
              </li>
            </ul>
          </li>

          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/vendas.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Nova NFS-e</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Vendas:</li>
              <li><RouterLink to="">Todas as vendas</RouterLink></li>
              <li><RouterLink to="">Nova venda</RouterLink></li>
              <li><RouterLink to="">Orçamento de vendas</RouterLink></li>
            </ul>
          </li>

          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/compras.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Nova NFS-e</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Compras:</li>
              <li><RouterLink to="">Lista de compras</RouterLink></li>
              <li><RouterLink to="">Cotação de compras</RouterLink></li>
              <li><RouterLink to="">Importar compras</RouterLink></li>
            </ul>
          </li>

          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/financeiro.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">Financeiro</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Financeiro:</li>
              <li><RouterLink to="">Caixa</RouterLink></li>
              <li><RouterLink to="/financeiro/contas-pagar">Contas a pagar</RouterLink></li>
              <li><RouterLink to="/financeiro/contas-receber">Contas a receber</RouterLink></li>
            </ul>
          </li>
          
          <li class="dropdown">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img src="/img/pos.svg" /><span class="caret"></span></div>
              <span class="nome-mobile">PDV</span>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header titulo-menu">Ponto de Vendas:</li>
              <li><RouterLink to="">Vendas PDV</RouterLink></li>
              <li><RouterLink to="">Abrir PDV</RouterLink></li>
              <li><RouterLink to="">Trocas</RouterLink></li>
            </ul>
          </li>

          <li v-for="link in links" :key="link.to">
            <RouterLink
              :to="link.to"
              data-toggle="tooltip"
              data-placement="bottom"
              :title="link.tooltip ?? link.label"
            >
              <div>
                <img
                  v-if="link.iconSrc"
                  :src="link.iconSrc"
                  :style="
                    link.to === '/notas/emitidas'
                      ? 'top: -10px;'
                      : link.to === '/perfil/servicos-favoritos'
                        ? 'top: -2px;'
                        : undefined
                  "
                />
              </div>
              <span class="nome-mobile">{{ link.label }}</span>
            </RouterLink>
          </li>

          
          <li class="divisor"></li>

          <li class="dropdown perfil">
            <a
              href="#"
              class="dropdown-toggle"
              data-toggle="dropdown"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              data-hover="dropdown"
            >
              <div><img style="top: 2px" src="/img/menu-user-35.svg" /><span class="caret"></span></div>
            </a>
            <ul class="dropdown-menu main-menu" style="right: -5px; margin-top: 5px">
              <li class="dropdown-header">
                {{ companyName }}<br />
                <span>CNPJ: </span><span class="cnpj">{{ cnpj }}</span><br />
              </li>
              <li><a href="#" @click.prevent="setVariant('sidebar')">Usar Sidebar (lateral)</a></li>
              <li><RouterLink to="/logout">Sair com segurança</RouterLink></li>
            </ul>
          </li>


        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dropdown-submenu {
  position: relative;
}

.dropdown-submenu > a::after {
  content: '▸';
  float: right;
  color: #777;
}

.dropdown-submenu:hover > .dropdown-menu {
  display: block;
}

.dropdown-submenu > .dropdown-menu {
  top: 0;
  left: 100%;
  margin-top: -6px;
  width: max-content;
  max-width: calc(100vw - 24px);
  z-index: 1001;
}
</style>
