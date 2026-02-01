<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EstoqueForm from '../../components/estoque/EstoqueForm.vue'
import { addEstoque, loadEstoqueOptions, type EstoqueOptions } from '../../services/estoque/estoque.service'

const router = useRouter()

const options = ref<EstoqueOptions | null>(null)
const loading = ref(false)

const draft = ref({ produto_id: '', quantidade: '', local_id: '' })

onMounted(async () => {
  loading.value = true
  try {
    options.value = await loadEstoqueOptions()
  } finally {
    loading.value = false
  }
})

async function onSave(payload: { produto_id: string; quantidade: string; local_id?: string }) {
  await addEstoque(payload)
  router.push({ name: 'estoque' })
}

function onCancel() {
  router.push({ name: 'estoque' })
}
</script>

<template>
  <div v-if="!options || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <EstoqueForm v-else mode="create" :model-value="draft" :load-options="options" :on-save="onSave" :on-cancel="onCancel" />
</template>

