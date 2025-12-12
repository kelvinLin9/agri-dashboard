import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import './assets/main.css'

// Import permission directives
import { vPermission, vPermissionNot } from './directives/permission'

const app = createApp(App)
const pinia = createPinia()

// Log current environment mode
console.log(`🌍 Environment: ${import.meta.env.MODE}`)

// Register directives
app.directive('permission', vPermission)
app.directive('permission-not', vPermissionNot)

app.use(router)
app.use(pinia)
app.use(ui)

app.mount('#app')

