export default defineNuxtPlugin((nuxtApp) => {
  const { load } = useUiFontSize()
  nuxtApp.hook('app:mounted', load)
})
