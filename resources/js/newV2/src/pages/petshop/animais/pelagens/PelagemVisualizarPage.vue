<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PelagemFormWizard from '../../../../components/petshop/animais/PelagemFormWizard.vue'
import { createPelagemDraft, type PelagemDraft } from '../../../../composables/createPelagemDraft'
import { getPelagemById, loadPelagensOptions, type Pelagem } from '../../../../services/petshop/animais/pelagens.service'

const router = useRouter()
const route = useRoute()

const pelagemId = String(route.params.id ?? '')

const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createPelagemDraft()

function pelagemToDraft(pelagem: Pelagem): PelagemDraft {
  const { id: _id, created_at: _createdAt, ...rest } = pelagem
  return rest
}

onMounted(async () => {
  loading.value = true
  try {
    const [_, pelagem] = await Promise.all([loadPelagensOptions(), getPelagemById(pelagemId)])
    if (!pelagem) {
      notFound.value = true
      return
    }
    reset(pelagemToDraft(pelagem))
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'petshop-pelagens' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Pelagem não encontrada</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <PelagemFormWizard v-else mode="view" :model-value="draft" :on-cancel="onCancel" />
</template>

