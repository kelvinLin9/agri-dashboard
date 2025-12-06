import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

// Log current environment mode
console.log(`🌍 Environment: ${import.meta.env.MODE}`)

app.use(router)
app.use(pinia)
app.use(ui)

app.mount('#app')
