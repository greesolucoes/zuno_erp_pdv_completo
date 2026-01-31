<script setup lang="ts">
import { useRouter } from 'vue-router'
import MarcaForm from '../../../components/produtos/marcas/MarcaForm.vue'
import { createMarcaDraft, type MarcaUpsertPayload } from '../../../composables/createMarcaDraft'
import { createMarca } from '../../../services/produtos/marcas.service'

const router = useRouter()

const { draft } = createMarcaDraft()

async function onSave(payload: MarcaUpsertPayload) {
  await createMarca(payload)
  router.push({ name: 'marcas' })
}

function onCancel() {
  router.push({ name: 'marcas' })
}
</script>

<template>
  <MarcaForm mode="create" :model-value="draft" :on-save="onSave" :on-cancel="onCancel" />
</template>

