export default defineNuxtRouteMiddleware(async () => {
  const hasSession = await useSessionVerify()
  if (!hasSession) return navigateTo('/login')
})
