<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initLegacyUiBindings, loadLegacyStyleOnce, removeLegacyTag } from '../../utils/legacyScripts'
import emitirHtmlRaw from '../../exemplos_fiscal/EmitirNFSe.html?raw'

const route = useRoute()
const router = useRouter()

removeLegacyTag('legacy-login-css')
removeLegacyTag('legacy-dashboard-css')
loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })

const idr = ref<string>((Array.isArray(route.query.idr) ? route.query.idr[0] : route.query.idr) ?? '')
const rootEl = ref<HTMLElement | null>(null)

function onVoltar() {
  router.push({ name: 'dps-tributacao', query: idr.value ? { idr: idr.value } : undefined })
}

function onEmitir() {
  alert('Emissão/assinatura da NFS-e ainda não implementada no Vue.')
}

const legacyMarkup = computed(() => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(String(emitirHtmlRaw), 'text/html')
    const container = doc.querySelector('.container-body') ?? doc.body

    const wizard = container.querySelector('.wizard')
    const erroAssinatura = container.querySelector('#erroAssinatura')
    const hdfIdr = container.querySelector('#hdfIdr')

    // Conteúdo principal (tudo dentro de .container-body, exceto footer)
    // Mantém painéis e comandos exatamente como legado.
    const panels = Array.from(container.querySelectorAll('.pnlCollapse'))
    const comandos = container.querySelector('.comandos')
    const modalLoading = doc.querySelector('#modalLoading')

    const parts = [wizard, erroAssinatura, hdfIdr, ...panels, comandos, modalLoading].filter(Boolean) as Element[]
    let html = parts.map((el) => el.outerHTML).join('\n')

    // Ajusta caminhos do HTML de exemplo (/EmissorNacional -> raiz do nosso app)
    html = html.replaceAll('/EmissorNacional', '')

    return html
  } catch {
    return ''
  }
})

onMounted(async () => {
  // Compatibilidade com scripts legados de UI (tooltips/popovers, etc.)
  try {
    initLegacyUiBindings()
  } catch {
    // ignore
  }

  await nextTick()
  const root = rootEl.value
  if (!root) return

  // Propaga `idr` para o legado (input hidden exibido na tela)
  const hdfIdr = root.querySelector('#hdfIdr') as HTMLInputElement | null
  if (hdfIdr) hdfIdr.value = idr.value

  // Intercepta botões do legado
  root.querySelector('#btnVoltar')?.addEventListener('click', (e) => {
    e.preventDefault()
    onVoltar()
  })

  root.querySelector('#btnProsseguir')?.addEventListener('click', (e) => {
    e.preventDefault()
    onEmitir()
  })
})
</script>

<template>
  <div ref="rootEl" v-html="legacyMarkup"></div>
</template>

