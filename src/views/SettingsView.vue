<template>
  <div class="p-4 md:p-8 h-full overflow-y-auto flex flex-col">
    <div class="max-w-3xl mx-auto w-full">
      
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800">{{ t('store_profile') }}</h1>
        <p class="text-slate-500 mt-1">{{ t('store_desc') }}</p>
      </header>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div class="p-6 md:p-8 space-y-6">
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-slate-700">{{ t('store_name') }}</label>
            <input v-model="settings.store_name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-slate-700">{{ t('store_address') }}</label>
            <textarea v-model="settings.store_address" rows="3" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors custom-scrollbar"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">{{ t('store_phone') }}</label>
              <input v-model="settings.store_phone" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">{{ t('tax_rate') }}</label>
              <div class="relative">
                <input v-model.number="settings.tax_rate" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button @click="save" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 touch-manipulation">
              {{ t('save_settings') }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex shrink-0 items-center justify-center text-3xl">🖨️</div>
          <div>
            <h3 class="font-bold text-slate-800 text-lg">Thermal Printer (ESC/POS)</h3>
            <p class="text-sm text-slate-500 mt-1">
              Status: <span :class="printerId ? 'text-green-600 font-bold' : 'text-red-500 font-bold'">{{ printerId ? 'Paired' : 'Not Connected' }}</span>
            </p>
            <p v-if="printerId" class="text-xs text-slate-400 mt-1 font-mono">{{ printerId }}</p>
          </div>
        </div>
        
        <button @click="connectPrinter" class="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition-all active:scale-95 touch-manipulation border border-slate-200">
          {{ printerId ? 'Reconnect / Pair New' : 'Pair Printer' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService } from '../services/dbService';
import { printerService } from '../services/printerService';
import { t } from '../utils/i18n';

const settings = ref({
  store_name: '',
  store_address: '',
  store_phone: '',
  tax_rate: 0
});

const printerId = ref(null);

onMounted(async () => {
  const loadedSettings = await dbService.getSettings();
  settings.value = {
    store_name: loadedSettings.store_name || '',
    store_address: loadedSettings.store_address || '',
    store_phone: loadedSettings.store_phone || '',
    tax_rate: Number(loadedSettings.tax_rate) || 0
  };

  await printerService.init();
  printerId.value = printerService.savedPrinterId;
});

const save = async () => {
  const result = await dbService.saveSettings({
    store_name: settings.value.store_name,
    store_address: settings.value.store_address,
    store_phone: settings.value.store_phone,
    tax_rate: settings.value.tax_rate.toString()
  });
  
  if (result.success) {
    alert(t('settings_saved'));
  }
};

const connectPrinter = async () => {
  const result = await printerService.scanAndConnect();
  if (result.success) {
    printerId.value = printerService.savedPrinterId;
    alert(`Successfully paired!`);
  }
};
</script>
