<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InternacaoFormWizard from '../../../../../components/petshop/vet/internacoes/InternacaoFormWizard.vue'
import { createInternacaoDraft } from '../../../../../composables/createInternacaoDraft'
import { getInternacaoById, loadInternacoesOptions, type InternacoesLoadOptions } from '../../../../../services/petshop/vet/internacoes/internacoes.service'

const router = useRouter()
const route = useRoute()
const id = String(route.params.id)

const options = ref<InternacoesLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createInternacaoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadInternacoesOptions()
    const item = await getInternacaoById(id)
    if (!item) {
      notFound.value = true
      return
    }
    reset(item)
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'petshop-vet-internacoes-historico' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Registro não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <InternacaoFormWizard v-else-if="options" mode="view" :model-value="draft" :load-options="options" :on-cancel="onCancel" />
</template>

