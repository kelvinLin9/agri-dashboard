<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <button
      v-show="isVisible"
      type="button"
      class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-harvest-500 to-harvest-600 text-white shadow-xl hover:shadow-2xl hover:from-harvest-600 hover:to-harvest-700 transition-all duration-300 flex items-center justify-center group"
      aria-label="回到頂部"
      @click="scrollToTop"
    >
      <UIcon
        name="i-heroicons-arrow-up"
        class="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  threshold?: number // 滾動多少像素後顯示
  smooth?: boolean   // 是否平滑滾動
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 300,
  smooth: true,
})

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > props.threshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: props.smooth ? 'smooth' : 'auto',
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // 初始檢查
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
