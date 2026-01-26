<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from '../components/layout/AppNavbar.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppBreadcrumbs from '../components/layout/AppBreadcrumbs.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import { initLegacyUiBindings } from '../utils/legacyScripts'
import { useNavigationVariant } from '../composables/useNavigationVariant'

const route = useRoute()
const { navigationVariant } = useNavigationVariant()

const isSidebar = computed(() => navigationVariant.value === 'sidebar')

async function refreshLegacyUi() {
  await nextTick()
  initLegacyUiBindings()
}

onMounted(() => {
  refreshLegacyUi()
})

watch(
  () => route.fullPath,
  () => {
    refreshLegacyUi()
  },
)

watch(
  () => navigationVariant.value,
  () => {
    refreshLegacyUi()
  },
)
</script>

<template>
  <template v-if="isSidebar">
    <div class="layout-shell">
      <AppSidebar />
      <div class="layout-main">
        <AppBreadcrumbs />
        <div class="container container-fluid-xl container-body layout-content">
          <RouterView />
        </div>
        <AppFooter />
      </div>
    </div>
  </template>

  <template v-else>
    <div class="layout-standalone">
      <AppNavbar />
      <AppBreadcrumbs />

      <div class="container container-fluid-xl container-body layout-content">
        <RouterView />
      </div>

      <AppFooter />
    </div>
  </template>

  <div id="modalLoading" class="modalBgLoading" style="display: none">
    <div class="loading">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <div class="texto">Por favor, aguarde...</div>
    </div>
  </div>

  <div
    id="modalPessoa"
    class="modal fade bs-example-modal-lg"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myLargeModalLabel"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content"></div>
    </div>
  </div>
</template>

<style scoped>
.layout-shell {
  display: flex;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layout-standalone {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
}

:deep(footer) {
  margin-top: auto;
}

@media (max-width: 991px) {
  .layout-shell {
    flex-direction: column;
  }
}
</style>
