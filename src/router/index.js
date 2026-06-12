import { createRouter, createWebHistory } from 'vue-router';
import PosView from '../views/PosView.vue';
import CategoryMasterView from '../views/CategoryMasterView.vue';
import ProductMasterView from '../views/ProductMasterView.vue';
import HistoryView from '../views/HistoryView.vue';
import ReportView from '../views/ReportView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  { path: '/', component: PosView },
  { path: '/categories', component: CategoryMasterView },
  { path: '/products', component: ProductMasterView },
  { path: '/history', component: HistoryView },
  { path: '/reports', component: ReportView },
  { path: '/settings', component: SettingsView }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
