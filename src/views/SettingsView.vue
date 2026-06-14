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

      <div class="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
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

      <div class="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col items-start gap-6">
        <div class="flex items-center space-x-4 w-full">
          <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex shrink-0 items-center justify-center text-3xl">💾</div>
          <div class="flex-1">
            <h3 class="font-bold text-slate-800 text-lg">Manajemen Database</h3>
            <p class="text-sm text-slate-500 mt-1">
              Backup seluruh data toko Anda agar aman, atau Restore dari file backup sebelumnya.
            </p>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 w-full pt-4 border-t border-slate-100">
          <button @click="exportData" :disabled="isExporting" class="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-2">
            <span v-if="isExporting" class="animate-spin">⏳</span>
            <span v-else>📤</span> Export (Backup)
          </button>
          
          <input type="file" ref="fileInput" accept=".json" class="hidden" @change="importData" />
          <button @click="$refs.fileInput.click()" :disabled="isImporting" class="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-2">
            <span v-if="isImporting" class="animate-spin">⏳</span>
            <span v-else>📥</span> Import (Restore)
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService, isWeb } from '../services/dbService';
import { printerService } from '../services/printerService';
import { t } from '../utils/i18n';
import Swal from 'sweetalert2';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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
    Swal.fire({
      title: t('success'),
      text: t('settings_saved'),
      icon: 'success',
      confirmButtonColor: '#3085d6'
    });
  }
};

const connectPrinter = async () => {
  const result = await printerService.scanAndConnect();
  if (result.success) {
    printerId.value = printerService.savedPrinterId;
    Swal.fire({
      title: t('success'),
      text: 'Successfully paired!',
      icon: 'success',
      confirmButtonColor: '#3085d6'
    });
  } else {
    Swal.fire(t('error'), 'Failed to connect to printer', 'error');
  }
};

const isExporting = ref(false);
const isImporting = ref(false);
const fileInput = ref(null);

const exportData = async () => {
  isExporting.value = true;
  try {
    const res = await dbService.exportDatabase();
    if (!res.success) throw new Error(res.error);

    const fileName = `kasir_backup_${new Date().toISOString().split('T')[0]}.json`;

    if (isWeb) {
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      Swal.fire('Berhasil', 'Backup berhasil diunduh.', 'success');
    } else {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: res.data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      
      await Share.share({
        title: 'KasirKu Backup',
        text: 'Ini adalah file backup database toko Anda.',
        url: result.uri,
        dialogTitle: 'Simpan / Bagikan Backup'
      });
    }
  } catch (e) {
    console.error(e);
    Swal.fire('Gagal', 'Terjadi kesalahan saat mengekspor data.', 'error');
  } finally {
    isExporting.value = false;
  }
};

const importData = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const result = await Swal.fire({
    title: 'Peringatan Berbahaya!',
    text: 'Restore akan MENGHAPUS SEMUA data yang ada di aplikasi ini dan menggantinya dengan data dari file backup. Apakah Anda yakin?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Timpa Data!',
    cancelButtonText: 'Batal'
  });

  if (!result.isConfirmed) {
    fileInput.value.value = '';
    return;
  }

  isImporting.value = true;
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const jsonString = e.target.result;
      const res = await dbService.importDatabase(jsonString);
      
      if (res.success) {
        Swal.fire('Berhasil!', 'Data toko berhasil dipulihkan. Halaman akan dimuat ulang.', 'success').then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire('Gagal', 'Gagal memulihkan data: ' + res.error, 'error');
      }
      isImporting.value = false;
      fileInput.value.value = '';
    };
    reader.readAsText(file);
  } catch (err) {
    console.error(err);
    Swal.fire('Gagal', 'File backup rusak atau tidak valid.', 'error');
    isImporting.value = false;
    fileInput.value.value = '';
  }
};
</script>
