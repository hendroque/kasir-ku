<template>
  <div class="p-8 h-screen overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800">Transaction History</h1>
        <p class="text-slate-500 mt-1">View past orders and receipts</p>
      </header>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
            <tr>
              <th class="p-4">Invoice #</th>
              <th class="p-4">Date</th>
              <th class="p-4">Payment</th>
              <th class="p-4 text-right">Total</th>
              <th class="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4 font-bold text-slate-800">{{ order.invoice_number }}</td>
              <td class="p-4 text-slate-500">{{ new Date(order.created_at).toLocaleString() }}</td>
              <td class="p-4">
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{{ order.payment_method }}</span>
              </td>
              <td class="p-4 text-right font-black text-indigo-600">${{ order.total_amount.toFixed(2) }}</td>
              <td class="p-4 text-center">
                <button @click="viewDetails(order)" class="text-blue-500 hover:text-blue-700 font-semibold">Details</button>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-400">No transactions yet today.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-800/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-slate-800">Order Details</h2>
          <button @click="showModal = false" class="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">✕</button>
        </div>
        
        <div class="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
          <div class="flex justify-between mb-2">
            <span class="text-slate-500">Invoice:</span>
            <strong class="text-slate-800">{{ selectedOrder.invoice_number }}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Date:</span>
            <strong class="text-slate-800">{{ new Date(selectedOrder.created_at).toLocaleString() }}</strong>
          </div>
        </div>

        <div class="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
          <div v-for="item in orderItems" :key="item.id" class="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <p class="font-bold text-slate-800">{{ item.product_name }}</p>
              <p class="text-sm text-slate-500">${{ item.price.toFixed(2) }} x {{ item.quantity }}</p>
            </div>
            <div class="font-bold text-indigo-600">${{ item.subtotal.toFixed(2) }}</div>
          </div>
        </div>

        <div class="flex justify-between items-center text-xl font-black text-slate-800 border-t border-slate-200 pt-6">
          <span>Grand Total</span>
          <span class="text-3xl">${{ selectedOrder.total_amount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService } from '../services/dbService';

const orders = ref([]);
const orderItems = ref([]);
const showModal = ref(false);
const selectedOrder = ref(null);

onMounted(async () => {
  orders.value = await dbService.getOrders();
});

const viewDetails = async (order) => {
  selectedOrder.value = order;
  orderItems.value = await dbService.getOrderDetails(order.id);
  showModal.value = true;
};
</script>
