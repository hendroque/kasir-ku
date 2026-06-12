<template>
  <div class="p-8 h-screen overflow-y-auto">
    <div class="max-w-3xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800">Hardware Settings</h1>
        <p class="text-slate-500 mt-1">Configure your receipt printer</p>
      </header>

      <div class="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl">🖨️</div>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">Thermal Printer (ESC/POS)</h3>
            <p class="text-sm text-slate-500 mt-1">
              Status: <span :class="printerId ? 'text-green-600 font-bold' : 'text-red-500 font-bold'">{{ printerId ? 'Paired' : 'Not Connected' }}</span>
            </p>
            <p v-if="printerId" class="text-xs text-slate-400 mt-1 font-mono">{{ printerId }}</p>
          </div>
        </div>
        
        <button @click="connectPrinter" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all">
          {{ printerId ? 'Reconnect / Pair New' : 'Pair Printer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { printerService } from '../services/printerService';

const printerId = ref(null);

onMounted(async () => {
  await printerService.init();
  printerId.value = printerService.savedPrinterId;
});

const connectPrinter = async () => {
  const result = await printerService.scanAndConnect();
  if (result.success) {
    printerId.value = printerService.savedPrinterId;
    alert(`Successfully paired!`);
  }
};
</script>
