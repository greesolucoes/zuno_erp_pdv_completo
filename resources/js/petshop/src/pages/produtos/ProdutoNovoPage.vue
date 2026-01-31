<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProdutoFormWizard from '../../components/produtos/ProdutoFormWizard.vue'
import { createProdutoDraft, type ProdutoUpsertPayload } from '../../composables/createProdutoDraft'
import { createProduto, loadProdutosOptions, type ProdutosLoadOptions } from '../../services/produtos/produtos.service'

const router = useRouter()

const options = ref<ProdutosLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createProdutoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadProdutosOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ProdutoUpsertPayload) {
  await createProduto(payload)
  router.push({ name: 'produtos' })
}

function onCancel() {
  router.push({ name: 'produtos' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ProdutoFormWizard v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

