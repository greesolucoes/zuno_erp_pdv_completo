<script setup lang="ts">
const props = defineProps<{
  version?: string
}>()

const version = props.version ?? '1.4.0.27'
</script>

<template>
  <footer>
    <div class="parceiros">
      <div class="container">
        <div class="row">
          <div class="col-md-offset-1 col-md-2">
            <a href="http://idg.receita.fazenda.gov.br/" target="_blank" rel="noreferrer">
              <img src="/img/logo-rfb.png" class="logo" alt="Receita Federal do Brasil" />
            </a>
          </div>
          <div class="col-md-2">
            <a href="http://www.sebrae.com.br/" target="_blank" rel="noreferrer">
              <img src="/img/logo-sebrae.png" class="logo" alt="Sebrae" />
            </a>
          </div>
          <div class="col-md-2">
            <a href="http://www.cnm.org.br/" target="_blank" rel="noreferrer">
              <img src="/img/logo-cnm.png" class="logo" alt="Confederação Nacional dos Municípios" />
            </a>
          </div>
          <div class="col-md-2">
            <a href="http://www.abrasf.org.br/" target="_blank" rel="noreferrer">
              <img
                src="/img/logo-abrasf.png"
                class="logo"
                alt="Associação Brasileira das Secretarias de Finanças das Capitais"
              />
            </a>
          </div>
          <div class="col-md-2">
            <a
              href="http://portal.siscomex.gov.br/legislacao/orgaos/secretaria-de-comercio-exterior-secex"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/img/logo-secex.png" class="logo" alt="Secretaria de Comércio Exterior" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="info">
      <div class="container">
        <div class="row">
          <div class="col-md-4 logo">
            <img src="/img/logo-nfse-branca-sm.svg" class="logo-branca" alt="NFS-e" />
          </div>
          <div class="col-md-8 versao">Portal de Gestão NFS-e - Contribuinte | Versão {{ version }}</div>
        </div>
      </div>
    </div>
  </footer>
</template>

