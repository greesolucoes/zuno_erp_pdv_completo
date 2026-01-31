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
    { label: 'Produtos', to: '/produtos', iconSrc: '/img/menu-nova-35.svg', tooltip: 'Produtos' },
    { label: 'NFS-e Emitidas', to: '/notas/emitidas', iconSrc: '/img/menu-emitidas-35.svg', tooltip: 'NFS-e Emitidas' },
    { label: 'NFS-e Recebidas', to: '/notas/recebidas', iconSrc: '/img/menu-recebidas-35.svg', tooltip: 'NFS-e Recebidas' },
    { label: 'Rascunhos', to: '/notas/rascunhos', iconSrc: '/img/menu-rascunhos-35.svg', tooltip: 'Rascunhos' },
    { label: 'Configurações', to: '/perfil/configuracao', iconSrc: '/img/menu-config-35.svg', tooltip: 'Configurações' },
    { label: 'Serviços Favoritos', to: '/perfil/servicos-favoritos', iconSrc: '/img/menu-favoritos-35.svg', tooltip: 'Serviços Favoritos' },
  ]

const companyName = props.companyName ?? 'TEIXX DESENVOLVIMENTO E SOFTWARE LTDA'
const cnpj = props.cnpj ?? '64388348000180'

const { setVariant } = useNavigationVariant()
</script>

<template>
  <aside class="app-sidebar">
    <div class="app-sidebar-header">
      <RouterLink class="app-sidebar-brand" :to="homeTo"><img src="/img/logo-nfse-assinatura-horizontal.svg" /></RouterLink>
    </div>

    <ul class="nav nav-pills nav-stacked app-sidebar-menu">
      <li>
        <RouterLink :to="homeTo" data-toggle="tooltip" data-placement="right" title="Principal">
          <span class="app-sidebar-icon"><img src="/img/menu-home-35.svg" /></span>
          <span class="app-sidebar-label">Página Principal</span>
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
          <span class="app-sidebar-icon"><img src="/img/menu-nova-35.svg" /></span>
          <span class="app-sidebar-label">Nova NFS-e</span>
          <span class="app-sidebar-caret caret"></span>
        </a>
        <ul class="dropdown-menu">
          <li class="dropdown-header titulo-menu">Tipos de emissão:</li>
          <li><RouterLink to="/dps/pessoas">Emissão completa</RouterLink></li>
          <li><RouterLink to="/dps/simplificada">Emissão simplificada</RouterLink></li>
          <li><RouterLink to="/dps/bypass">Emissão por decisão administrativa/judicial</RouterLink></li>
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
          <span class="app-sidebar-icon"><img src="/img/pet-store.svg" style="top: -2px; position: relative" /></span>
          <span class="app-sidebar-label">Petshop</span>
          <span class="app-sidebar-caret caret"></span>
        </a>
        <ul class="dropdown-menu">
          <li class="dropdown-header titulo-menu">PetShop</li>
          <li><RouterLink to="/Petshop/Agenda">Agenda</RouterLink></li>

          <li class="dropdown-header titulo-menu" style="margin-top: 6px">Cadastros</li>
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
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Cadastro</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Vet/Cadastros/Medicos">Médico</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/SalasAtendimento">Salas de Atendimento</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Cadastros/SalasInternacao">Salas de Internação</RouterLink></li>
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
            </ul>
          </li>

          <li class="dropdown-header titulo-menu" style="margin-top: 6px">Operação</li>
          <li><RouterLink to="/Petshop/Agenda">Agenda Geral</RouterLink></li>
          <li><RouterLink :to="{ path: '/Petshop/Agenda', query: { agendar: '1' } }">Agendar</RouterLink></li>
          <li class="dropdown-submenu">
            <a href="javascript:void(0);">Veterinário</a>
            <ul class="dropdown-menu">
              <li><RouterLink to="/Petshop/Vet/Atendimentos">Atendimento</RouterLink></li>
              <li class="dropdown-submenu">
                <a href="javascript:void(0);">Prontuários</a>
                <ul class="dropdown-menu">
                  <li><RouterLink to="/Petshop/Vet/Prontuarios/Fila">Fila de consultas</RouterLink></li>
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
                  <li><RouterLink to="/Petshop/Vet/Internacoes/Historico">Histórico de Internação</RouterLink></li>
                  <li><RouterLink to="/Petshop/Vet/Internacoes/Ocupacao">Ocupação de Leitos</RouterLink></li>
                </ul>
              </li>
            </ul>
          </li>
          <li class="dropdown-submenu">
            <a href="javascript:void(0);">Hotel</a>
            <ul class="dropdown-menu">
              <li><RouterLink to="/Petshop/Hotel/Reservas">Reservas</RouterLink></li>
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
              <li><RouterLink to="/Petshop/Creche/Reservas">Reservas</RouterLink></li>
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

      <li v-for="link in links" :key="link.to">
        <RouterLink :to="link.to" data-toggle="tooltip" data-placement="right" :title="link.tooltip ?? link.label">
          <span class="app-sidebar-icon">
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
          </span>
          <span class="app-sidebar-label">{{ link.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="app-sidebar-footer">
      <div class="app-sidebar-company">
        <div class="app-sidebar-company-name">{{ companyName }}</div>
        <div class="app-sidebar-company-cnpj"><span>CNPJ: </span><span class="cnpj">{{ cnpj }}</span></div>
      </div>

      <ul class="nav nav-pills nav-stacked app-sidebar-menu">
        <li>
          <a href="#" @click.prevent="setVariant('navbar')">
            <span class="app-sidebar-icon"><i class="fa fa-exchange"></i></span>
            <span class="app-sidebar-label">Usar Navbar (topo)</span>
          </a>
        </li>
        <li>
          <RouterLink to="/logout">
            <span class="app-sidebar-icon"><i class="fa fa-sign-out"></i></span>
            <span class="app-sidebar-label">Sair com segurança</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 260px;
  min-width: 260px;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.app-sidebar-header {
  padding: 14px 12px;
  border-bottom: 1px solid #e6e6e6;
}

.app-sidebar-brand img {
  max-width: 100%;
  height: 34px;
}

.app-sidebar-menu {
  margin: 0;
  padding: 8px 0;
}

.app-sidebar-menu :deep(a) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.app-sidebar-icon {
  width: 34px;
  min-width: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.app-sidebar-icon img {
  width: 28px;
  height: 28px;
  position: relative;
}

.app-sidebar-label {
  line-height: 1.1;
}

.app-sidebar-caret {
  margin-left: auto;
}

.app-sidebar-footer {
  margin-top: auto;
  border-top: 1px solid #e6e6e6;
  padding-top: 8px;
}

.app-sidebar-company {
  padding: 0 12px 8px 12px;
  font-size: 12px;
  color: #555;
}

.app-sidebar-company-name {
  font-weight: 600;
  margin-bottom: 2px;
}

:deep(.dropdown-submenu) {
  position: relative;
}

:deep(.dropdown-submenu > a::after) {
  content: '▸';
  float: right;
  color: #777;
}

:deep(.dropdown-submenu:hover > .dropdown-menu) {
  display: block;
}

:deep(.dropdown-submenu > .dropdown-menu) {
  top: 0;
  left: 100%;
  margin-top: -6px;
  width: max-content;
  max-width: calc(100vw - 24px);
  z-index: 1001;
}
</style>
