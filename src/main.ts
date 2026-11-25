import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { usePreferences } from './features/accessibility/usePreferences'
import './styles/main.css'

// Appliquer le profil d'accessibilité avant le premier rendu.
usePreferences().init()

createApp(App).use(router).mount('#app')
