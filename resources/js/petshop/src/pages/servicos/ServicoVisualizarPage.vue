<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServicoFormWizard from '../../components/servicos/ServicoFormWizard.vue'
import { createServicoDraft, type ServicoDraft } from '../../composables/createServicoDraft'
import { getServicoById, loadServicosOptions, type ServicosLoadOptions } from '../../services/servicos/servicos.service'

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.params.id ?? ''))

const options = ref<ServicosLoadOptions | null>(null)
const loading = ref(false)
const model = ref<ServicoDraft | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const [opts, item] = await Promise.all([loadServicosOptions(), getServicoById(id.value)])
    options.value = opts
    if (!item) {
      router.push({ name: 'servicos' })
      return
    }
    const { draft } = createServicoDraft({
      id: item.id,
      nome: item.nome,
      categoria_id: item.categoria_id,
      unidade_cobranca: item.unidade_cobranca,
      valor: item.valor,
      tempo_servico: item.tempo_servico,
      comissao: item.comissao,
      tempo_adicional: item.tempo_adicional,
      valor_adicional: item.valor_adicional,
      tempo_tolerancia: item.tempo_tolerancia,
      codigo_servico: item.codigo_servico,
      codigo_tributacao_municipio: item.codigo_tributacao_municipio,
      status: item.status,
      reserva: item.reserva,
      padrao_reserva_nfse: item.padrao_reserva_nfse,
      marketplace: item.marketplace,
      destaque_marketplace: item.destaque_marketplace,
      descricao: item.descricao,
      aliquota_iss: item.aliquota_iss,
      aliquota_pis: item.aliquota_pis,
      aliquota_cofins: item.aliquota_cofins,
      aliquota_inss: item.aliquota_inss,
      aliquota_ir: item.aliquota_ir,
      aliquota_csll: item.aliquota_csll,
      valor_deducoes: item.valor_deducoes,
      desconto_incondicional: item.desconto_incondicional,
      desconto_condicional: item.desconto_condicional,
      outras_retencoes: item.outras_retencoes,
      codigo_cnae: item.codigo_cnae,
      estado_local_prestacao_servico: item.estado_local_prestacao_servico,
      natureza_operacao: item.natureza_operacao,
    })
    model.value = { ...draft }
  } finally {
    loading.value = false
  }
})

function onCancel() {
  router.push({ name: 'servicos' })
}
</script>

<template>
  <div v-if="!options || !model || loading" class="pnlCollapse semi-aberto">
    <h2>Carregando...</h2>
    <div class="retratil" style="padding: 10px 20px">Aguarde...</div>
  </div>

  <ServicoFormWizard v-else mode="view" :model-value="model" :load-options="options" :on-cancel="onCancel" />
</template>
