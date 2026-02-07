import { createApp } from 'vue'
import App from './App.vue'
import { playgroundRouter } from './router'
import './styles.css'

createApp(App).use(playgroundRouter).mount('#app')
