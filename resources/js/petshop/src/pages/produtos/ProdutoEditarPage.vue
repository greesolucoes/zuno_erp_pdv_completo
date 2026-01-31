<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProdutoFormWizard from '../../components/produtos/ProdutoFormWizard.vue'
import { createProdutoDraft, type ProdutoDraft, type ProdutoUpsertPayload } from '../../composables/createProdutoDraft'
import { getProdutoById, loadProdutosOptions, type Produto, type ProdutosLoadOptions, updateProduto } from '../../services/produtos/produtos.service'

const router = useRouter()
const route = useRoute()

const produtoId = String(route.params.id ?? '')

const options = ref<ProdutosLoadOptions | null>(null)
const loading = ref(false)
const notFound = ref(false)

const { draft, reset } = createProdutoDraft()

function produtoToDraft(produto: Produto): ProdutoDraft {
  const {
    id: _id,
    categoria_nome: _categoriaNome,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...rest
  } = produto
  return rest as any
}

onMounted(async () => {
  loading.value = true
  try {
    const [loadedOptions, produto] = await Promise.all([loadProdutosOptions(), getProdutoById(produtoId)])
    options.value = loadedOptions
    if (!produto) {
      notFound.value = true
      return
    }
    reset(produtoToDraft(produto))
  } finally {
    loading.value = false
  }
})

async function onSave(payload: ProdutoUpsertPayload) {
  await updateProduto(produtoId, payload)
  router.push({ name: 'produtos' })
}

function onCancel() {
  router.push({ name: 'produtos' })
}
</script>

<template>
  <div v-if="loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <div v-else-if="notFound" class="pnlCollapse semi-aberto">
    <h2>Produto não encontrado</h2>
    <div class="retratil" style="padding: 10px 20px">
      <button type="button" class="btn btn-lg btn-default" @click.prevent="onCancel">Voltar</button>
    </div>
  </div>

  <ProdutoFormWizard v-else-if="options" mode="edit" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

