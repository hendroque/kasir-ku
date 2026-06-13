<template>
  <div class="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
    <!-- Sidebar Navigation -->
    <nav class="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex z-50 shadow-sm">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">POS Pro</h2>
        <button @click="toggleLanguage" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">
          {{ locale.toUpperCase() }}
        </button>
      </div>
      <div class="flex-1 p-4 space-y-2">
        <router-link to="/" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          🛒 {{ t('nav_pos') }}
        </router-link>
        <router-link to="/categories" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/categories' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📁 {{ t('nav_categories') }}
        </router-link>
        <router-link to="/products" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/products' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📦 {{ t('nav_products') }}
        </router-link>
        <router-link to="/history" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/history' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📜 {{ t('nav_history') }}
        </router-link>
        <router-link to="/reports" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/reports' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📈 {{ t('nav_reports') }}
        </router-link>
        <router-link to="/settings" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/settings' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          ⚙️ {{ t('nav_settings') }}
        </router-link>
      </div>
    </nav>
    
    <!-- Main Content Area -->
    <main class="flex-1 overflow-hidden relative pb-16 md:pb-0">
      <router-view />
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex md:hidden justify-around items-center z-50 h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb">
      <router-link to="/" class="flex flex-col items-center justify-center w-full h-full text-[0.65rem] font-semibold transition-colors" active-class="text-blue-600" :class="$route.path === '/' ? '' : 'text-slate-500'">
        <span class="text-xl mb-0.5">🛒</span>
        <span>{{ t('nav_pos') }}</span>
      </router-link>
      <router-link to="/products" class="flex flex-col items-center justify-center w-full h-full text-[0.65rem] font-semibold transition-colors" active-class="text-blue-600" :class="$route.path === '/products' ? '' : 'text-slate-500'">
        <span class="text-xl mb-0.5">📦</span>
        <span>{{ t('nav_products') }}</span>
      </router-link>
      <router-link to="/history" class="flex flex-col items-center justify-center w-full h-full text-[0.65rem] font-semibold transition-colors" active-class="text-blue-600" :class="$route.path === '/history' ? '' : 'text-slate-500'">
        <span class="text-xl mb-0.5">📜</span>
        <span>{{ t('nav_history') }}</span>
      </router-link>
      <router-link to="/reports" class="flex flex-col items-center justify-center w-full h-full text-[0.65rem] font-semibold transition-colors" active-class="text-blue-600" :class="$route.path === '/reports' ? '' : 'text-slate-500'">
        <span class="text-xl mb-0.5">📈</span>
        <span>{{ t('nav_reports') }}</span>
      </router-link>
      <router-link to="/settings" class="flex flex-col items-center justify-center w-full h-full text-[0.65rem] font-semibold transition-colors" active-class="text-blue-600" :class="$route.path === '/settings' ? '' : 'text-slate-500'">
        <span class="text-xl mb-0.5">⚙️</span>
        <span>{{ t('nav_settings') }}</span>
      </router-link>
      <button @click="toggleLanguage" class="flex flex-col items-center justify-center w-full h-full text-[0.65rem] font-semibold text-slate-500 transition-colors">
        <span class="text-xl mb-0.5">🌐</span>
        <span>{{ locale.toUpperCase() }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { locale, t } from './utils/i18n';

const toggleLanguage = () => {
  locale.value = locale.value === 'id' ? 'en' : 'id';
};
</script>
