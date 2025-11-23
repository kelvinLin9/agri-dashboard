const isLoading = ref(false)
let loadingCount = 0

function openLoading() {
  loadingCount++
  if (loadingCount === 1) {
    isLoading.value = true
  }
}

function closeLoading() {
  loadingCount--
  if (loadingCount < 0) loadingCount = 0
  if (loadingCount === 0) {
    isLoading.value = false
  }
}

export { isLoading, openLoading, closeLoading }