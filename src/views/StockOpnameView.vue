<template>
  <div class="h-full w-full bg-slate-50 flex flex-col font-sans overflow-y-auto lg:overflow-hidden relative">
    <div class="flex-1 p-4 lg:p-8 flex flex-col min-h-max lg:overflow-y-auto max-w-4xl mx-auto w-full">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ t('opname_module') }}</h1>
        <p class="text-slate-500 mt-1">{{ t('opname_desc') }}</p>
      </header>

      <div class="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('select_product') }}</label>
          <select v-model="selectedProduct" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white">
            <option :value="null" disabled>-- {{ t('select_product') }} --</option>
            <option v-for="prod in products" :key="prod.id" :value="prod">{{ prod.sku }} - {{ prod.name }}</option>
          </select>
        </div>

        <div v-if="selectedProduct" class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p class="text-sm font-semibold text-slate-500 mb-1">{{ t('system_stock') }}</p>
            <p class="text-4xl font-black text-slate-800">{{ selectedProduct.stock }}</p>
          </div>
          
          <div class="md:col-span-2 flex flex-col justify-center">
            <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('actual_stock') }}</label>
            <input v-model.number="actualStock" type="number" min="0" class="w-full border-2 border-blue-200 rounded-xl px-4 py-4 text-2xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" />
          </div>
        </div>

        <div v-if="selectedProduct && difference !== 0" class="mt-2 p-6 rounded-2xl border" :class="difference > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'">
          <div class="flex items-center justify-between mb-4">
            <span class="font-bold text-slate-700">{{ t('difference') }}:</span>
            <span class="text-2xl font-black" :class="difference > 0 ? 'text-emerald-600' : 'text-red-600'">
              {{ difference > 0 ? '+' : '' }}{{ difference }}
            </span>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('reason') }}</label>
            <textarea v-model="reason" rows="2" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Barang pecah, salah hitung..."></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button 
            @click="submitOpname" 
            :disabled="!selectedProduct || difference === 0 || !reason || isProcessing"
            class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <span v-if="isProcessing" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>{{ t('submit_opname') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { dbService } from '../services/dbService';
import { t } from '../utils/i18n';
import Swal from 'sweetalert2';

const products = ref([]);
const selectedProduct = ref(null);
const actualStock = ref(0);
const reason = ref('');
const isProcessing = ref(false);

const loadProducts = async () => {
  products.value = await dbService.getProducts();
};

onMounted(loadProducts);

watch(selectedProduct, (newVal) => {
  if (newVal) {
    actualStock.value = newVal.stock;
    reason.value = '';
  }
});

const difference = computed(() => {
  if (!selectedProduct.value) return 0;
  return actualStock.value - selectedProduct.value.stock;
});

const submitOpname = async () => {
  if (!selectedProduct.value || difference.value === 0 || !reason.value) return;
  
  const result = await Swal.fire({
    title: 'Konfirmasi Penyesuaian?',
    text: `Stok ${selectedProduct.value.name} akan diubah dari ${selectedProduct.value.stock} menjadi ${actualStock.value}.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: t('submit_opname'),
    cancelButtonText: t('cancel')
  });

  if (result.isConfirmed) {
    isProcessing.value = true;
    const res = await dbService.submitOpname(selectedProduct.value.id, selectedProduct.value.stock, actualStock.value, reason.value);
    
    if (res.success) {
      Swal.fire({
        title: t('success'),
        text: t('opname_success'),
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
      selectedProduct.value = null;
      actualStock.value = 0;
      reason.value = '';
      await loadProducts();
    } else {
      Swal.fire(t('error'), 'Gagal menyesuaikan stok: ' + res.error, 'error');
    }
    isProcessing.value = false;
  }
};
</script>
