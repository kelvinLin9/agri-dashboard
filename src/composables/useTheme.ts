import { ref, watch } from 'vue'

// 定義主題類型
export type Theme = 'default' | 'japanese'

// 資產映射表 interface
interface ThemeAssets {
  hero: string
  vegetables: string
}

// 資產路徑定義
export const themeAssets: Record<Theme, ThemeAssets> = {
  default: {
    hero: '/assets/images/hero-default.png', // 假設原有預設圖 (實際上可能不存在，這裡先保留邏輯)
    vegetables: '/assets/images/veg-default.png'
  },
  japanese: {
    hero: '/assets/images/harvest-sunset-landscape.png',
    vegetables: '/assets/images/vegetables-illustration.png'
  }
}

// 全域狀態 (Singleton pattern)
const currentTheme = ref<Theme>('default')
const isDark = ref(false)

export function useTheme() {

  // 切換主題功能
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'default' ? 'japanese' : 'default'
  }

  // 設定特定主題
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
  }

  // 切換深色模式
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
  }

  // 監聽主題變化並應用到 DOM
  watch(currentTheme, (newTheme) => {
    // 儲存到 LocalStorage
    localStorage.setItem('user-theme', newTheme)

    // 切換 HTML class
    const htmlEl = document.documentElement
    if (newTheme === 'japanese') {
      htmlEl.classList.add('theme-japanese')
      htmlEl.classList.remove('theme-default')
    } else {
      htmlEl.classList.add('theme-default')
      htmlEl.classList.remove('theme-japanese')
    }
  }, { immediate: true })

  // 監聽深色模式變化
  watch(isDark, (newVal) => {
    localStorage.setItem('user-color-scheme', newVal ? 'dark' : 'light')
    const htmlEl = document.documentElement
    if (newVal) {
      htmlEl.classList.add('dark')
    } else {
      htmlEl.classList.remove('dark')
    }
  }, { immediate: true })

  // 初始化 (在 App 掛載時呼叫一次即可)
  const initTheme = () => {
    const savedTheme = localStorage.getItem('user-theme') as Theme | null
    if (savedTheme && (savedTheme === 'default' || savedTheme === 'japanese')) {
      currentTheme.value = savedTheme
    }

    const savedScheme = localStorage.getItem('user-color-scheme')
    if (savedScheme) {
      isDark.value = savedScheme === 'dark'
    } else {
      // 預設跟隨系統
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  return {
    currentTheme,
    isDark,
    toggleTheme,
    toggleDarkMode,
    setTheme,
    initTheme,
    themeAssets
  }
}
