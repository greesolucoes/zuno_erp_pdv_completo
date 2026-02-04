<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initLegacyUiBindings, loadLegacyScriptOnce, loadLegacyStyleOnce, removeLegacyTag } from '../../utils/legacyScripts'
import tributacaoHtmlRaw from '../../exemplos_fiscal/Tributacao.html?raw'

const route = useRoute()
const router = useRouter()

removeLegacyTag('legacy-login-css')
removeLegacyTag('legacy-dashboard-css')
loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })

const idr = ref<string>((Array.isArray(route.query.idr) ? route.query.idr[0] : route.query.idr) ?? '')
const rootEl = ref<HTMLElement | null>(null)

function w(): any {
  return window as any
}

function onVoltar() {
  router.push({ name: 'dps-servico', query: idr.value ? { idr: idr.value } : undefined })
}

function onAvancar() {
  router.push({ name: 'dps-emitir-nfse', query: idr.value ? { idr: idr.value } : undefined })
}

const legacyMarkup = computed(() => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(String(tributacaoHtmlRaw), 'text/html')
    const container = doc.querySelector('.container-body') ?? doc.body

    const wizard = container.querySelector('.wizard')
    const form = container.querySelector('form.formdps')
    const modalDeducao = container.querySelector('#modalDeducao') ?? doc.querySelector('#modalDeducao')
    const modalPessoaParaRetencao = container.querySelector('#modalPessoaParaRetencao') ?? doc.querySelector('#modalPessoaParaRetencao')
    const modalLoading = doc.querySelector('#modalLoading')
    const modalPessoa = doc.querySelector('#modalPessoa')

    if (form) {
      form.setAttribute('action', '#')
      const btnVoltar = form.querySelector('#btnVoltar') as HTMLAnchorElement | null
      if (btnVoltar) btnVoltar.setAttribute('href', '#')
    }

    const parts = [wizard, form, modalDeducao, modalPessoaParaRetencao, modalLoading, modalPessoa].filter(Boolean) as Element[]
    let html = parts.map((el) => el.outerHTML).join('\n')

    // Ajusta caminhos do HTML de exemplo (/EmissorNacional -> raiz do nosso app)
    html = html.replaceAll('/EmissorNacional', '')

    return html
  } catch {
    return ''
  }
})

onMounted(async () => {
  // Compatibilidade com scripts legados: eles montam URLs usando `window.UrlBase + "api/..."`
  try {
    const win = w()
    if (!win.UrlBase) win.UrlBase = '/v2/'
  } catch {
    // ignore
  }

  // Variáveis globais esperadas pelo legado (valores defaults seguros)
  try {
    const win = w()
    if (typeof win.usuarioMei === 'undefined') win.usuarioMei = false
    if (typeof win.podeAlterarDeducao === 'undefined') win.podeAlterarDeducao = true
    if (typeof win.podeAlterarRetencao === 'undefined') win.podeAlterarRetencao = true
    if (typeof win.ehExportacao === 'undefined') win.ehExportacao = false
    if (typeof win.munIncidConveniado === 'undefined') win.munIncidConveniado = true
  } catch {
    // ignore
  }

  try {
    await loadLegacyScriptOnce({ id: 'legacy-tributacao-js', src: '/js/Tributacao.js' })
    await loadLegacyScriptOnce({ id: 'legacy-deducao-js', src: '/js/Deducao.js' })
  } catch {
    // ignore
  }

  try {
    initLegacyUiBindings()
  } catch {
    // ignore
  }

  await nextTick()
  const root = rootEl.value
  if (!root) return

  // Intercepta navegação do legado
  root.querySelector('form.formdps')?.addEventListener('submit', (e) => {
    e.preventDefault()
    onAvancar()
  })

  root.querySelector('#btnVoltar')?.addEventListener('click', (e) => {
    e.preventDefault()
    onVoltar()
  })

  // Propaga `idr` para o legado (inputs hidden usados por modais/requests)
  const hdfIdr = root.querySelector('#hdfIdr') as HTMLInputElement | null
  if (hdfIdr) hdfIdr.value = idr.value
})
</script>

<template>
  <div ref="rootEl" v-html="legacyMarkup"></div>
</template>
