<template>
  <div class="p-8 h-screen overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <header class="mb-10">
        <h1 class="text-3xl font-extrabold text-slate-800">Daily Dashboard</h1>
        <p class="text-slate-500 mt-1">Overview of your sales performance today</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all duration-500"></div>
          <div class="relative z-10">
            <h3 class="text-indigo-100 font-semibold mb-2 text-lg">Total Revenue Today</h3>
            <p class="text-6xl font-black tracking-tight">${{ report.revenue.toFixed(2) }}</p>
          </div>
        </div>

        <div class="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-100/50 flex items-center">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center text-4xl border border-green-100">
              📦
            </div>
            <div>
              <h3 class="text-slate-500 font-semibold mb-1 text-lg">Items Sold Today</h3>
              <p class="text-6xl font-black text-slate-800 tracking-tight">{{ report.itemsSold }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService } from '../services/dbService';

const report = ref({ revenue: 0, itemsSold: 0 });

onMounted(async () => {
  report.value = await dbService.getTodayReport();
});
</script>
