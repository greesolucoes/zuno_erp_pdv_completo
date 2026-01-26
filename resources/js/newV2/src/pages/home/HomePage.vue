<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppWidget from '../../components/layout/AppWidget.vue'
import { initLegacyUiBindings, loadLegacyScriptOnce, loadLegacyStyleOnce, removeLegacyTag } from '../../utils/legacyScripts'

loadLegacyStyleOnce({ id: 'legacy-dashboard-css', href: '/css/dashboard.css' })
removeLegacyTag('legacy-login-css')

onMounted(async () => {
  await loadLegacyScriptOnce({ id: 'legacy-dashboard-js', src: '/js/dashboard.js' })

  const w = window as any
  if (w?.$?.fn?.jDashboard) {
    w.$('#dashboard').jDashboard()
    initLegacyUiBindings()
    w.$('#btnAdicionarAcesso').on('click', function () {
      if (typeof w.ExibirAlerta === 'function') w.ExibirAlerta('Funcionalidade indisponível')
    })
  }
})
</script>

<template>
  <div id="dashboard">
    <AppWidget id="wgtAcessoRapido" title="Acesso Rápido" icon-src="/img/acesso-azul-20.svg">
      <RouterLink to="/dps/pessoas" class="btnAcesso" data-toggle="tooltip" data-original-title="Nova NFS-e">
        <img src="/img/menu-nova-35.svg" />
      </RouterLink>
      <RouterLink
        to="/perfil/configuracao"
        class="btnAcesso"
        data-toggle="tooltip"
        data-original-title="Configurações"
      >
        <img src="/img/menu-config-35.svg" />
      </RouterLink>
      <RouterLink
        to="/perfil/servicos-favoritos"
        class="btnAcesso"
        data-toggle="tooltip"
        data-original-title="Meus Favoritos"
      >
        <img src="/img/menu-favoritos-35.svg" />
      </RouterLink>
      <a
        id="btnAdicionarAcesso"
        href="javascript:void(0);"
        class="btnAcesso adicionar"
        data-toggle="tooltip"
        data-original-title="Incluir opção"
        style="display: none"
      >
        <img src="/img/btn-novo.svg" />
      </a>
    </AppWidget>

    <AppWidget id="wgtMeusDados" title="Meus dados" icon-src="/img/user-azul-20.svg">
      <p>
        <b>CNPJ: </b>
        <span class="cnpj">64388348000180</span><br />
      </p>
      <p><b>Nome:</b> TEIXX DESENVOLVIMENTO E SOFTWARE LTDA</p>
      <p><b>E-mail:</b> Não informado</p>
      <p><b>Telefone:</b> Não informado</p>
    </AppWidget>

    <AppWidget
      id="wgtUltimasNFSe"
      title="Últimas NFS-e emitidas nos últimos 30 dias"
      icon-src="/img/emitidas-azul-20.svg"
      body-class="table"
    >
      <table class="table table-striped">
        <thead>
          <tr>
            <th class="td-data">Geração</th>
            <th>Emitida para</th>
            <th class="td-valor">Valor (R$)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr data-chave="MW85eTRUeExBcE1pVFgvcmxXbkhocEpWWjBHZzNIdzVLUUIzSlJHUHZCZXdiN1dvQjdnZHFPSTRtMXBYWmVWQjN3Qk1xdkRxMlpnPQ2">
            <td class="td-data" data-label="Geração">21/01/2026</td>
            <td class="td-texto-grande" data-label="Emitida para">
              <div>
                <img data-toggle="tooltip" title="Tomador" src="/img/tb-tomador.svg" />
                <span class="cnpj">05280269000192</span> - TECNOMYL BRASIL DISTRIBUIDORA DE PRODUTOS AGRICOLAS LTDA
              </div>
            </td>
            <td class="td-valor">8.750,00</td>
            <td class="td-opcoes">
              <RouterLink
                to="/notas/visualizar/41069022264388348000180000000000000126019716797285"
                data-toggle="tooltip"
                data-placement="top"
                title="Visualizar"
              >
                <img src="/img/tb-visualizar.svg" />
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </AppWidget>

    <AppWidget id="wgtRascunhos" title="Rascunhos" icon-src="/img/rascunho-azul-20.svg" body-class="table">
      <table class="table table-striped">
        <thead>
          <tr>
            <th style="width: 140px; text-align: center">Competência</th>
            <th class="td-texto-grande">Emitida para</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr data-id="159954420">
            <td style="width: 140px; text-align: center">22/01/2026</td>
            <td class="td-texto-grande">
              <div>Não informado</div>
            </td>
            <td class="td-opcoes">
              <RouterLink
                :to="{ path: '/dps/servico', query: { idr: 'SW93R3M1ZlNrQ2piVklVRHBvQVBydz090' } }"
                data-toggle="tooltip"
                data-placement="top"
                title="Editar"
              >
                <img src="/img/tb-editar.svg" />
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </AppWidget>
  </div>
</template>
