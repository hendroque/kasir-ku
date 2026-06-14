<template>
  <div class="h-full w-full bg-slate-50 flex flex-col lg:flex-row font-sans relative overflow-y-auto lg:overflow-hidden">
    <div class="flex-1 p-4 lg:p-8 flex flex-col min-h-max lg:overflow-y-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ t('purchasing_module') }}</h1>
        <p class="text-slate-500 mt-1">{{ t('purchasing_desc') }}</p>
      </header>

      <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 mb-6">
        <div class="flex-1">
          <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('select_product') }}</label>
          <select v-model="selectedProduct" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option :value="null" disabled>-- {{ t('select_product') }} --</option>
            <option v-for="prod in products" :key="prod.id" :value="prod">{{ prod.name }} (Stok: {{ prod.stock }})</option>
          </select>
        </div>
        <div class="w-full lg:w-48">
          <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('qty') }}</label>
          <input v-model.number="purchaseQty" type="number" min="1" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div class="w-full lg:w-48">
          <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('buy_price') }}</label>
          <input v-model.number="buyPrice" type="number" min="0" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div class="flex items-end">
          <button @click="addToPurchaseList" :disabled="!selectedProduct || purchaseQty <= 0 || buyPrice < 0" class="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95">
            {{ t('add_item') }}
          </button>
        </div>
      </div>

      <div class="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
              <tr>
                <th class="p-4">{{ t('product') }}</th>
                <th class="p-4 text-center">{{ t('qty') }}</th>
                <th class="p-4 text-right">{{ t('buy_price') }}</th>
                <th class="p-4 text-right">Subtotal</th>
                <th class="p-4 text-center"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in purchaseItems" :key="index" class="hover:bg-slate-50">
                <td class="p-4 font-bold text-slate-800">{{ item.name }}</td>
                <td class="p-4 text-center font-medium">{{ item.quantity }}</td>
                <td class="p-4 text-right font-medium text-slate-600">{{ formatCurrency(item.buy_price) }}</td>
                <td class="p-4 text-right font-bold text-indigo-600">{{ formatCurrency(item.quantity * item.buy_price) }}</td>
                <td class="p-4 text-center">
                  <button @click="removeItem(index)" class="text-red-400 hover:text-red-600 font-bold">✕</button>
                </td>
              </tr>
              <tr v-if="purchaseItems.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400">Belum ada barang yang ditambahkan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Purchase Summary Sidebar -->
    <div class="lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-2xl flex flex-col z-10">
      <div class="p-6 lg:p-8 border-b border-slate-100 bg-white">
        <h2 class="text-2xl font-bold text-slate-800">Summary</h2>
      </div>
      
      <div class="flex-1 p-6 overflow-y-auto bg-slate-50/50">
        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p class="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-1">{{ t('total') }}</p>
          <p class="text-3xl font-black text-indigo-700 tracking-tight">{{ formatCurrency(grandTotal) }}</p>
        </div>
      </div>

      <div class="p-6 bg-white border-t border-slate-100">
        <button 
          @click="submitPurchase" 
          :disabled="purchaseItems.length === 0 || isProcessing"
          class="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          <span v-if="isProcessing" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>{{ t('confirm_purchase') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { dbService } from '../services/dbService';
import { t, formatCurrency } from '../utils/i18n';
import Swal from 'sweetalert2';

const products = ref([]);
const selectedProduct = ref(null);
const purchaseQty = ref(1);
const buyPrice = ref(0);
const purchaseItems = ref([]);
const isProcessing = ref(false);

const loadProducts = async () => {
  products.value = await dbService.getProducts();
};

onMounted(loadProducts);

const addToPurchaseList = () => {
  if (!selectedProduct.value) return;
  purchaseItems.value.push({
    product_id: selectedProduct.value.id,
    name: selectedProduct.value.name,
    quantity: purchaseQty.value,
    buy_price: buyPrice.value
  });
  selectedProduct.value = null;
  purchaseQty.value = 1;
  buyPrice.value = 0;
};

const removeItem = (index) => {
  purchaseItems.value.splice(index, 1);
};

const grandTotal = computed(() => {
  return purchaseItems.value.reduce((total, item) => total + (item.quantity * item.buy_price), 0);
});

const submitPurchase = async () => {
  if (purchaseItems.value.length === 0) return;
  
  const result = await Swal.fire({
    title: t('confirm_purchase') + '?',
    text: "HPP barang akan diperbarui menggunakan Moving Average.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: t('confirm_purchase'),
    cancelButtonText: t('cancel')
  });

  if (result.isConfirmed) {
    isProcessing.value = true;
    const res = await dbService.submitPurchase(purchaseItems.value, grandTotal.value);
    
    if (res.success) {
      Swal.fire({
        title: t('success'),
        text: t('purchase_success') + ' (' + res.invoiceNumber + ')',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });
      purchaseItems.value = [];
      await loadProducts();
    } else {
      Swal.fire({
        title: t('error'),
        text: 'Failed to submit purchase: ' + res.error,
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
    isProcessing.value = false;
  }
};
</script>
