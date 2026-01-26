import { ref } from 'vue'

export type NavigationVariant = 'navbar' | 'sidebar'

const STORAGE_KEY = 'ui.navigationVariant'

function readStoredVariant(): NavigationVariant {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw === 'sidebar' || raw === 'navbar' ? raw : 'navbar'
  } catch {
    return 'navbar'
  }
}

const navigationVariant = ref<NavigationVariant>(typeof window === 'undefined' ? 'navbar' : readStoredVariant())

export function useNavigationVariant() {
  function setVariant(next: NavigationVariant) {
    navigationVariant.value = next
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  function toggleVariant() {
    setVariant(navigationVariant.value === 'sidebar' ? 'navbar' : 'sidebar')
  }

  return { navigationVariant, setVariant, toggleVariant }
}

