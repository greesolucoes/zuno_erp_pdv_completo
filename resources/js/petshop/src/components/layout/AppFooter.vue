<script setup lang="ts">
const props = defineProps<{
  version?: string
}>()

const version = props.version ?? '1.4.0.27'
</script>

<template>
  <footer>
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

