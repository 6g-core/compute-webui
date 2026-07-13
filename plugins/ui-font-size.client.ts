export default defineNuxtPlugin((nuxtApp) => {
  const { load: loadFontSize } = useUiFontSize()
  const { load: loadGraphScale } = useGraphScale()

  nuxtApp.hook('app:mounted', () => {
    loadFontSize()
    loadGraphScale()
  })
})
