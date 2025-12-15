import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

// Token aus URL-Parameter extrahieren BEVOR der Router initialisiert wird
// (Der Router könnte die URL ändern und den Parameter verlieren)
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
if (urlToken) {
  localStorage.setItem('analytics_token', urlToken);
  // URL bereinigen (Token aus URL entfernen)
  const newUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, '', newUrl);
}

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
