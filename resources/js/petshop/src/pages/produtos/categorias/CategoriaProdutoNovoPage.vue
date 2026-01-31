<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CategoriaProdutoForm from '../../../components/produtos/categorias/CategoriaProdutoForm.vue'
import { createCategoriaProdutoDraft, type CategoriaProdutoUpsertPayload } from '../../../composables/createCategoriaProdutoDraft'
import {
  createCategoriaProduto,
  loadCategoriasProdutoOptions,
  type CategoriasProdutoLoadOptions,
} from '../../../services/produtos/categoriasProduto.service'

const router = useRouter()

const options = ref<CategoriasProdutoLoadOptions | null>(null)
const loading = ref(false)

const { draft } = createCategoriaProdutoDraft()

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadCategoriasProdutoOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: CategoriaProdutoUpsertPayload) {
  await createCategoriaProduto(payload)
  router.push({ name: 'categorias-produto' })
}

function onCancel() {
  router.push({ name: 'categorias-produto' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <CategoriaProdutoForm v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

