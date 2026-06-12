<template>
  <div class="flex h-screen bg-slate-50 font-sans">
    <!-- Sidebar Navigation -->
    <nav class="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex z-50 shadow-sm">
      <div class="p-6 border-b border-slate-100 flex items-center justify-center">
        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">POS Pro</h2>
      </div>
      <div class="flex-1 p-4 space-y-2">
        <router-link to="/" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          🛒 Point of Sale
        </router-link>
        <router-link to="/categories" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/categories' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📁 Categories
        </router-link>
        <router-link to="/products" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/products' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📦 Products
        </router-link>
        <router-link to="/history" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/history' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📜 History
        </router-link>
        <router-link to="/reports" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/reports' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          📈 Reports
        </router-link>
        <router-link to="/settings" class="block px-4 py-3 rounded-xl font-semibold transition-all duration-200" active-class="bg-blue-50 text-blue-700 shadow-sm" :class="$route.path === '/settings' ? '' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
          ⚙️ Settings
        </router-link>
      </div>
    </nav>
    
    <!-- Main Content Area -->
    <main class="flex-1 overflow-hidden relative">
      <router-view />
    </main>
  </div>
</template>
