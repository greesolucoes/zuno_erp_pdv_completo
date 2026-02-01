<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EstoqueForm from '../../components/estoque/EstoqueForm.vue'
import { getEstoqueById, loadEstoqueOptions, updateEstoqueQuantidade, type EstoqueOptions } from '../../services/estoque/estoque.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<EstoqueOptions | null>(null)
const loading = ref(false)
const model = ref<{ produto_id: string; quantidade: string; local_id: string } | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadEstoqueOptions(), getEstoqueById(id.value)])
    options.value = opts
    model.value = { produto_id: item.produto_id, quantidade: item.quantidade, local_id: item.local_id }
  } finally {
    loading.value = false
  }
})

async function onSave(payload: { produto_id: string; quantidade: string; local_id?: string }) {
  await updateEstoqueQuantidade(id.value, { quantidade: payload.quantidade })
  router.push({ name: 'estoque' })
}

function onCancel() {
  router.push({ name: 'estoque' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <EstoqueForm v-else mode="edit" :model-value="model" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

