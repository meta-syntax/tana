import type { PerPage } from '~/types'

const COOKIE_KEY = 'tana-per-page'

export function usePerPage() {
  const perPage = useCookie<PerPage>(COOKIE_KEY, { default: () => 12 })

  const setPerPage = (value: PerPage) => {
    perPage.value = value
  }

  return {
    perPage: readonly(perPage),
    setPerPage
  }
}
