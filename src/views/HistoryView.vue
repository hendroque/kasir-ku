<template>
  <div class="p-4 md:p-8 h-full overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800">{{ t('transaction_history') }}</h1>
        <p class="text-slate-500 mt-1">{{ t('history_desc') }}</p>
      </header>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
            <tr>
              <th class="p-4">{{ t('invoice') }}</th>
              <th class="p-4">{{ t('date') }}</th>
              <th class="p-4">{{ t('payment_method') }}</th>
              <th class="p-4 text-right">{{ t('total') }}</th>
              <th class="p-4 text-center">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4 font-bold text-slate-800">{{ order.invoice_number }}</td>
              <td class="p-4 text-slate-500">{{ new Date(order.created_at).toLocaleString() }}</td>
              <td class="p-4">
                <span v-if="order.status === 'cancelled'" class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">{{ t('cancelled') }}</span>
                <span v-else class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{{ order.payment_method }}</span>
              </td>
              <td class="p-4 text-right font-black text-indigo-600">{{ formatCurrency(order.total_amount) }}</td>
              <td class="p-4 text-center">
                <button @click="viewDetails(order)" class="text-blue-500 hover:text-blue-700 font-semibold">{{ t('view_details') }}</button>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-400">{{ t('no_history') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-slate-800">{{ t('order_details') }}</h2>
          <button @click="showModal = false" class="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">✕</button>
        </div>
        
        <div class="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
          <div class="flex justify-between mb-2">
            <span class="text-slate-500">{{ t('invoice') }}:</span>
            <strong class="text-slate-800">{{ selectedOrder.invoice_number }}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">{{ t('date') }}:</span>
            <strong class="text-slate-800">{{ new Date(selectedOrder.created_at).toLocaleString() }}</strong>
          </div>
        </div>

        <div class="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
          <div v-for="item in orderItems" :key="item.id" class="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <p class="font-bold text-slate-800">{{ item.product_name }}</p>
              <p class="text-sm text-slate-500">{{ formatCurrency(item.price) }} x {{ item.quantity }}</p>
            </div>
            <div class="font-bold text-indigo-600">{{ formatCurrency(item.subtotal) }}</div>
          </div>
        </div>

        <div class="flex justify-between items-center text-xl font-black text-slate-800 border-t border-slate-200 pt-6">
          <span>{{ t('total') }}</span>
          <span class="text-3xl">{{ formatCurrency(selectedOrder.total_amount) }}</span>
        </div>
        <div class="mt-auto pt-4 flex space-x-4">
          <button v-if="selectedOrder.status !== 'cancelled'" @click="voidOrder(selectedOrder.id)" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl transition-all active:scale-95 touch-manipulation border border-red-200">
            {{ t('void_order') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService } from '../services/dbService';
import { t, formatCurrency } from '../utils/i18n';

const orders = ref([]);
const orderItems = ref([]);
const showModal = ref(false);
const selectedOrder = ref(null);

const loadData = async () => {
  orders.value = await dbService.getOrders();
};

onMounted(loadData);

const viewDetails = async (order) => {
  selectedOrder.value = order;
  orderItems.value = await dbService.getOrderDetails(order.id);
  showModal.value = true;
};

const voidOrder = async (orderId) => {
  if (confirm(t('confirm_void'))) {
    const res = await dbService.cancelOrder(orderId);
    if (res.success) {
      alert(t('order_voided'));
      showModal.value = false;
      await loadData();
    } else {
      alert('Failed to void order: ' + res.error);
    }
  }
};
</script>
