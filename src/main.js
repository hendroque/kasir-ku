import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router';
import './assets/index.css';
import App from './App.vue';
import { dbService } from './services/dbService';

const app = createApp(App);
app.use(createPinia());
app.use(router);

dbService.initDb().then(() => {
  app.mount('#app');
}).catch(err => {
  console.error("Failed to init database", err);
  app.mount('#app');
});
