<template>
<div class="fixed bottom-6 right-6 z-[100] print:hidden flex flex-col gap-3 items-end">
    <!-- Theme Style Toggle -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-10 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-10 opacity-0"
    >
      <button
        v-show="isVisible"
        class="flex items-center gap-2 px-4 py-3 font-medium text-white transition-all duration-300 shadow-lg rounded-full backdrop-blur-md button-theme-toggle hover:scale-105 active:scale-95"
        :class="currentTheme === 'default' ? 'bg-orange-500/90 hover:bg-orange-600' : 'bg-green-600/90 hover:bg-green-700'"
        @click="toggleTheme"
      >
        <span class="text-xl">
          {{ currentTheme === 'default' ? '🌸' : '🌾' }}
        </span>
        <span>
          {{ currentTheme === 'default' ? '日式風格' : '預設風格' }}
        </span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, toggleTheme, isDark, toggleDarkMode } = useTheme()
const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
})
</script>

<style scoped>
.button-theme-toggle {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.2);
}
</style>
