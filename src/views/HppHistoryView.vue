<template>
  <div class="h-full w-full bg-slate-50 flex flex-col font-sans overflow-y-auto lg:overflow-hidden relative">
    <div class="flex-1 p-4 lg:p-8 flex flex-col min-h-max lg:overflow-y-auto max-w-4xl mx-auto w-full">
      <header class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button @click="$router.push('/reports')" class="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-2 mb-2 transition-colors">
            <span>←</span> <span>Kembali ke Laporan</span>
          </button>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Riwayat HPP</h1>
          <p class="text-slate-500 mt-1" v-if="product">Perjalanan Harga Modal untuk: <strong class="text-slate-700">{{ product.name }} ({{ product.sku }})</strong></p>
        </div>
      </header>

      <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div class="overflow-x-auto w-full flex-1">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[0.75rem] tracking-wider">
              <tr>
                <th class="p-4">Tanggal & Waktu</th>
                <th class="p-4">Alasan Perubahan</th>
                <th class="p-4 text-right">HPP Lama</th>
                <th class="p-4 text-right">HPP Baru</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="history in histories" :key="history.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="p-4 text-sm text-slate-500">{{ new Date(history.created_at).toLocaleString() }}</td>
                <td class="p-4 font-bold text-slate-700">{{ history.reason }}</td>
                <td class="p-4 text-right font-medium text-slate-400 line-through">{{ formatCurrency(history.old_hpp) }}</td>
                <td class="p-4 text-right font-black text-emerald-600">{{ formatCurrency(history.new_hpp) }}</td>
              </tr>
              <tr v-if="histories.length === 0">
                <td colspan="4" class="p-12 text-center text-slate-400">
                  <span class="text-4xl block mb-3">📉</span>
                  Belum ada riwayat perubahan HPP untuk produk ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { dbService } from '../services/dbService';
import { formatCurrency } from '../utils/i18n';

const route = useRoute();
const router = useRouter();

const productId = parseInt(route.params.id);
const product = ref(null);
const histories = ref([]);

const loadData = async () => {
  if (!productId) {
    router.push('/reports');
    return;
  }
  
  const products = await dbService.getProducts();
  product.value = products.find(p => p.id === productId);
  
  if (!product.value) {
    router.push('/reports');
    return;
  }
  
  histories.value = await dbService.getHppHistory(productId);
};

onMounted(loadData);
</script>
