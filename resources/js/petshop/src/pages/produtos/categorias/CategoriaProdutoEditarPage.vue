<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CategoriaProdutoForm from '../../../components/produtos/categorias/CategoriaProdutoForm.vue'
import { createCategoriaProdutoDraft, type CategoriaProdutoDraft, type CategoriaProdutoUpsertPayload } from '../../../composables/createCategoriaProdutoDraft'
import {
  getCategoriaProdutoById,
  loadCategoriasProdutoOptions,
  updateCategoriaProduto,
  type CategoriasProdutoLoadOptions,
} from '../../../services/produtos/categoriasProduto.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<CategoriasProdutoLoadOptions | null>(null)
const loading = ref(false)
const model = ref<CategoriaProdutoDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadCategoriasProdutoOptions(), getCategoriaProdutoById(id.value)])
    options.value = opts
    if (!item) {
      router.push({ name: 'categorias-produto' })
      return
    }
    const { draft } = createCategoriaProdutoDraft({
      id: item.id,
      nome: item.nome,
      status: item.status,
      nome_en: item.nome_en,
      nome_es: item.nome_es,
      cardapio: item.cardapio,
      delivery: item.delivery,
      tipo_pizza: item.tipo_pizza,
      ecommerce: item.ecommerce,
      reserva: item.reserva,
      categoria_id: item.categoria_id,
    })
    model.value = { ...draft }
  } finally {
    loading.value = false
  }
})

async function onSave(payload: CategoriaProdutoUpsertPayload) {
  await updateCategoriaProduto(id.value, payload)
  router.push({ name: 'categorias-produto' })
}

function onCancel() {
  router.push({ name: 'categorias-produto' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <CategoriaProdutoForm v-else mode="edit" :model-value="model" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

