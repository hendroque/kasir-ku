import { createRouter, createWebHistory } from 'vue-router';
import PosView from '../views/PosView.vue';
import CategoryMasterView from '../views/CategoryMasterView.vue';
import ProductMasterView from '../views/ProductMasterView.vue';
import PurchaseView from '../views/PurchaseView.vue';
import StockOpnameView from '../views/StockOpnameView.vue';
import HistoryView from '../views/HistoryView.vue';
import ReportView from '../views/ReportView.vue';
import SettingsView from '../views/SettingsView.vue';
import HppHistoryView from '../views/HppHistoryView.vue';
import BannedView from '../views/BannedView.vue';
import { licenseService } from '../services/licenseService';

const routes = [
  { path: '/', component: PosView },
  { path: '/categories', component: CategoryMasterView },
  { path: '/products', component: ProductMasterView },
  { path: '/purchases', component: PurchaseView },
  { path: '/opname', component: StockOpnameView },
  { path: '/history', component: HistoryView },
  { path: '/reports', component: ReportView },
  { path: '/hpp-history/:id', component: HppHistoryView },
  { path: '/settings', component: SettingsView },
  { path: '/banned', component: BannedView }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global Navigation Guard for Licensing
router.beforeEach(async (to, from, next) => {
  const status = await licenseService.verifyLicense();
  
  if (status === 'banned' && to.path !== '/banned') {
    next('/banned');
  } else if (status !== 'banned' && to.path === '/banned') {
    next('/');
  } else {
    next();
  }
});
