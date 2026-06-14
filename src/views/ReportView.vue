<template>
  <div class="p-4 md:p-8 h-full overflow-y-auto flex flex-col">
    <div class="max-w-6xl mx-auto w-full flex-1 flex flex-col">
      <header class="mb-6 shrink-0">
        <h1 class="text-3xl font-extrabold text-slate-800">{{ t('daily_dashboard') }}</h1>
        <p class="text-slate-500 mt-1">{{ t('dashboard_desc') }}</p>
      </header>

      <!-- Tabs Navigation -->
      <div class="flex space-x-2 bg-slate-200/50 p-1.5 rounded-xl mb-8 shrink-0 overflow-x-auto custom-scrollbar">
        <button 
          @click="activeTab = 'daily'" 
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
          :class="activeTab === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          📈 {{ t('tab_daily') }}
        </button>
        <button 
          @click="activeTab = 'stock'" 
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
          :class="activeTab === 'stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          📦 {{ t('tab_stock') }}
        </button>
        <button 
          @click="activeTab = 'trends'" 
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
          :class="activeTab === 'trends' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          📊 {{ t('tab_trends') }}
        </button>
        <button 
          @click="activeTab = 'ledger'" 
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
          :class="activeTab === 'ledger' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          📓 {{ t('tab_ledger') }}
        </button>
        <button 
          @click="activeTab = 'purchases'" 
          class="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
          :class="activeTab === 'purchases' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          🛒 {{ t('tab_purchases') }}
        </button>
      </div>

      <!-- Tab 1: Daily Sales -->
      <div v-if="activeTab === 'daily'" class="flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div class="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all duration-500"></div>
            <div class="relative z-10">
              <h3 class="text-indigo-100 font-semibold mb-2">{{ t('total_revenue') }}</h3>
              <p class="text-3xl md:text-4xl font-black tracking-tight">{{ formatCurrency(report.revenue) }}</p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-orange-500 to-red-500 rounded-[2rem] p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all duration-500"></div>
            <div class="relative z-10">
              <h3 class="text-orange-100 font-semibold mb-2">{{ t('total_cogs') }}</h3>
              <p class="text-3xl md:text-4xl font-black tracking-tight">{{ formatCurrency(report.cogs) }}</p>
            </div>
          </div>

          <div class="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all duration-500"></div>
            <div class="relative z-10">
              <h3 class="text-emerald-100 font-semibold mb-2">{{ t('gross_profit') }}</h3>
              <p class="text-3xl md:text-4xl font-black tracking-tight">{{ formatCurrency(report.grossProfit) }}</p>
            </div>
          </div>

          <div class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="w-14 h-14 bg-blue-50 rounded-2xl flex shrink-0 items-center justify-center text-3xl border border-blue-100">📦</div>
            <div>
              <h3 class="text-slate-500 font-semibold mb-1">{{ t('items_sold') }}</h3>
              <p class="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{{ report.itemsSold || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
            <h2 class="text-xl font-bold text-slate-800">{{ t('sales_breakdown') }}</h2>
            <div class="flex space-x-2">
              <button @click="exportDailyExcel" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2">
                <span>📊</span> <span>{{ t('export_excel') }}</span>
              </button>
              <button @click="exportDailyPdf" class="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2">
                <span>📄</span> <span>{{ t('export_pdf') }}</span>
              </button>
            </div>
          </div>
          <div class="overflow-x-auto w-full">
            <table class="w-full text-left whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
                <tr>
                  <th class="p-4">{{ t('product_name') }}</th>
                  <th class="p-4">{{ t('qty_sold') }}</th>
                  <th class="p-4 text-right">{{ t('avg_cogs') }}</th>
                  <th class="p-4 text-right">{{ t('total_cogs') }}</th>
                  <th class="p-4 text-right">{{ t('total_revenue') }}</th>
                  <th class="p-4 text-right">{{ t('gross_profit') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, idx) in report.itemBreakdown" :key="idx" class="hover:bg-slate-50 transition-colors">
                  <td class="p-4 font-bold text-slate-800">{{ item.product_name }}</td>
                  <td class="p-4 font-medium text-slate-600">{{ item.quantity }}</td>
                  <td class="p-4 text-right text-orange-600 font-medium">{{ formatCurrency(item.avg_cogs) }}</td>
                  <td class="p-4 text-right text-orange-600 font-bold">{{ formatCurrency(item.total_cogs) }}</td>
                  <td class="p-4 text-right text-indigo-600 font-bold">{{ formatCurrency(item.revenue) }}</td>
                  <td class="p-4 text-right text-emerald-600 font-black">{{ formatCurrency(item.profit) }}</td>
                </tr>
                <tr v-if="!report.itemBreakdown || report.itemBreakdown.length === 0">
                  <td colspan="6" class="p-8 text-center text-slate-400">{{ t('no_sales') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Stock Report -->
      <div v-if="activeTab === 'stock'" class="flex-1">
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl mb-8 flex justify-between items-center relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-slate-300 font-semibold mb-1">{{ t('stock_value') }}</h3>
            <p class="text-3xl md:text-4xl font-black tracking-tight text-emerald-400">{{ formatCurrency(stockReportData.totalValue) }}</p>
          </div>
          <div class="text-6xl opacity-20">📦</div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div class="p-4 border-b border-slate-100 flex justify-end space-x-2 bg-slate-50/50">
            <button @click="exportStockExcel" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2">
              <span>📊</span> <span>{{ t('export_excel') }}</span>
            </button>
            <button @click="exportStockPdf" class="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2">
              <span>📄</span> <span>{{ t('export_pdf') }}</span>
            </button>
          </div>
          <div class="overflow-x-auto w-full">
            <table class="w-full text-left whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
                <tr>
                  <th class="p-4">SKU</th>
                  <th class="p-4">{{ t('product') }}</th>
                  <th class="p-4">{{ t('cost_price') }}</th>
                  <th class="p-4">{{ t('stock') }}</th>
                  <th class="p-4 text-right">{{ t('value') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="prod in stockReportData.products" :key="prod.id" class="hover:bg-slate-50 transition-colors cursor-pointer" @click="$router.push('/hpp-history/' + prod.id)">
                  <td class="p-4 text-sm text-slate-500 flex items-center gap-2">
                    <span class="text-xs">▶</span>
                    {{ prod.sku }}
                  </td>
                  <td class="p-4 font-bold text-slate-800">
                    {{ prod.name }}
                    <span v-if="prod.stock < 10" class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[0.65rem] font-bold rounded-full uppercase">{{ t('low_stock') }}</span>
                  </td>
                  <td class="p-4 font-medium text-slate-600">{{ formatCurrency(prod.cost_price) }}</td>
                  <td class="p-4 font-bold" :class="prod.stock < 10 ? 'text-red-600' : 'text-slate-800'">{{ prod.stock }}</td>
                  <td class="p-4 text-right font-black text-indigo-600">{{ formatCurrency((prod.cost_price || 0) * (prod.stock || 0)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 3: Sales Trends -->
      <div v-if="activeTab === 'trends'" class="flex-1 flex flex-col">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex-1 min-h-[400px] flex flex-col mb-8">
          <h2 class="text-xl font-bold text-slate-800 mb-6">{{ t('revenue_vs_cogs') }}</h2>
          <div class="flex-1 relative w-full h-full">
            <Line v-if="trendsData" :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Tab 4: Stock Ledger -->
      <div v-if="activeTab === 'ledger'" class="flex-1 flex flex-col">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 class="text-xl font-bold text-slate-800">{{ t('tab_ledger') }}</h2>
          </div>
          <div class="overflow-x-auto w-full">
            <table class="w-full text-left whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
                <tr>
                  <th class="p-4">{{ t('date_time') }}</th>
                  <th class="p-4">{{ t('product') }}</th>
                  <th class="p-4">{{ t('type') }}</th>
                  <th class="p-4">{{ t('qty_sold') }}</th>
                  <th class="p-4">{{ t('reference') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="log in ledgerData" :key="log.id" class="hover:bg-slate-50 transition-colors">
                  <td class="p-4 text-sm text-slate-500">{{ new Date(log.created_at).toLocaleString() }}</td>
                  <td class="p-4 font-bold text-slate-800">{{ log.product_name }}</td>
                  <td class="p-4">
                    <span :class="log.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'" class="px-2 py-1 rounded-full text-xs font-bold uppercase">
                      {{ log.type === 'IN' ? t('in') : t('out') }}
                    </span>
                  </td>
                  <td class="p-4 font-bold" :class="log.type === 'IN' ? 'text-emerald-600' : 'text-orange-600'">
                    {{ log.type === 'IN' ? '+' : '-' }}{{ log.quantity }}
                  </td>
                  <td class="p-4 text-sm text-slate-600">{{ log.reference }}</td>
                </tr>
                <tr v-if="!ledgerData || ledgerData.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400">No stock movements recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 5: Purchases -->
      <div v-if="activeTab === 'purchases'" class="flex-1 flex flex-col">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 class="text-xl font-bold text-slate-800">{{ t('tab_purchases') }}</h2>
          </div>
          <div class="overflow-x-auto w-full">
            <table class="w-full text-left whitespace-nowrap">
              <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
                <tr>
                  <th class="p-4">{{ t('invoice') }}</th>
                  <th class="p-4">{{ t('date_time') }}</th>
                  <th class="p-4 text-right">{{ t('total') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <template v-for="purc in purchasesData" :key="purc.id">
                  <tr class="hover:bg-slate-50 transition-colors cursor-pointer" @click="togglePurchaseDetail(purc.id)">
                    <td class="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <span class="text-xs transition-transform" :class="expandedPurchases.includes(purc.id) ? 'rotate-90' : ''">▶</span>
                      {{ purc.invoice_number }}
                    </td>
                    <td class="p-4 text-sm text-slate-500">{{ new Date(purc.created_at).toLocaleString() }}</td>
                    <td class="p-4 text-right font-black text-indigo-600">{{ formatCurrency(purc.total_amount) }}</td>
                  </tr>
                  <!-- Detail Row -->
                  <tr v-if="expandedPurchases.includes(purc.id)" class="bg-slate-50/50">
                    <td colspan="3" class="p-0">
                      <div class="px-8 py-4 border-l-4 border-indigo-500">
                        <table class="w-full text-sm text-left">
                          <thead class="text-slate-500 font-semibold uppercase text-[0.7rem]">
                            <tr>
                              <th class="py-2">Item</th>
                              <th class="py-2 text-center">Qty</th>
                              <th class="py-2 text-right">Price</th>
                              <th class="py-2 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100/50">
                            <tr v-for="item in purc.items" :key="item.id">
                              <td class="py-2 font-medium text-slate-700">{{ item.product_name }}</td>
                              <td class="py-2 text-center text-slate-600">{{ item.quantity }}</td>
                              <td class="py-2 text-right text-slate-600">{{ formatCurrency(item.buy_price) }}</td>
                              <td class="py-2 text-right font-bold text-indigo-500">{{ formatCurrency(item.subtotal) }}</td>
                            </tr>
                          </tbody>
                          <tfoot class="border-t-2 border-slate-200">
                            <tr>
                              <td colspan="3" class="py-2 text-right font-bold text-slate-600">Total Pembelian:</td>
                              <td class="py-2 text-right font-black text-indigo-700">{{ formatCurrency(purc.total_amount) }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="!purchasesData || purchasesData.length === 0">
                  <td colspan="3" class="p-8 text-center text-slate-400">Belum ada transaksi pembelian.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { dbService } from '../services/dbService';
import { t, formatCurrency } from '../utils/i18n';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';

// Chart.js imports
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const activeTab = ref('daily');

const report = ref({ revenue: 0, itemsSold: 0, cogs: 0, grossProfit: 0, itemBreakdown: [] });
const stockReportData = ref({ totalValue: 0, products: [] });
const trendsData = ref(null);
const ledgerData = ref([]);
const purchasesData = ref([]);
const expandedPurchases = ref([]);

const loadDaily = async () => {
  report.value = await dbService.getTodayReport();
};

const loadStock = async () => {
  stockReportData.value = await dbService.getStockReport();
};

const loadTrends = async () => {
  trendsData.value = await dbService.getWeeklyTrends();
};

const loadLedger = async () => {
  ledgerData.value = await dbService.getStockLedger();
};

const loadPurchases = async () => {
  purchasesData.value = await dbService.getPurchases();
};

const togglePurchaseDetail = async (purchaseId) => {
  const index = expandedPurchases.value.indexOf(purchaseId);
  if (index > -1) {
    expandedPurchases.value.splice(index, 1);
  } else {
    // Check if items are already loaded
    const purc = purchasesData.value.find(p => p.id === purchaseId);
    if (purc && !purc.items) {
      purc.items = await dbService.getPurchaseDetails(purchaseId);
    }
    expandedPurchases.value.push(purchaseId);
  }
};

onMounted(() => {
  loadDaily();
  loadStock();
  loadTrends();
  loadLedger();
  loadPurchases();
});

// Export Functions
const exportDailyExcel = () => {
  if (!report.value.itemBreakdown || report.value.itemBreakdown.length === 0) return alert('No data to export');
  const data = report.value.itemBreakdown.map(item => ({
    [t('product_name')]: item.product_name,
    [t('qty_sold')]: item.quantity,
    [t('avg_cogs')]: item.avg_cogs,
    [t('total_cogs')]: item.total_cogs,
    [t('total_revenue')]: item.revenue,
    [t('gross_profit')]: item.profit
  }));
  exportToExcel(data, `Daily_Sales_${new Date().toISOString().split('T')[0]}`, 'Daily Sales');
};

const exportDailyPdf = () => {
  if (!report.value.itemBreakdown || report.value.itemBreakdown.length === 0) return alert('No data to export');
  const headers = [t('product_name'), t('qty_sold'), t('total_cogs'), t('total_revenue'), t('gross_profit')];
  const rows = report.value.itemBreakdown.map(item => [
    item.product_name,
    item.quantity.toString(),
    formatCurrency(item.total_cogs),
    formatCurrency(item.revenue),
    formatCurrency(item.profit)
  ]);
  exportToPdf(headers, rows, `Daily Sales Report - ${new Date().toLocaleDateString()}`, `Daily_Sales_${new Date().toISOString().split('T')[0]}`);
};

const exportStockExcel = () => {
  if (!stockReportData.value.products || stockReportData.value.products.length === 0) return alert('No data to export');
  const data = stockReportData.value.products.map(p => ({
    SKU: p.sku,
    [t('product')]: p.name,
    [t('cost_price')]: p.cost_price,
    [t('stock')]: p.stock,
    [t('value')]: (p.cost_price || 0) * (p.stock || 0)
  }));
  exportToExcel(data, `Stock_Report_${new Date().toISOString().split('T')[0]}`, 'Stock Report');
};

const exportStockPdf = () => {
  if (!stockReportData.value.products || stockReportData.value.products.length === 0) return alert('No data to export');
  const headers = ['SKU', t('product'), t('cost_price'), t('stock'), t('value')];
  const rows = stockReportData.value.products.map(p => [
    p.sku,
    p.name,
    formatCurrency(p.cost_price),
    p.stock.toString(),
    formatCurrency((p.cost_price || 0) * (p.stock || 0))
  ]);
  exportToPdf(headers, rows, `Stock Inventory Report - ${new Date().toLocaleDateString()}`, `Stock_Report_${new Date().toISOString().split('T')[0]}`);
};

const chartData = computed(() => {
  if (!trendsData.value) return { labels: [], datasets: [] };
  return {
    labels: trendsData.value.labels,
    datasets: [
      {
        label: t('revenue'),
        borderColor: '#4f46e5', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        data: trendsData.value.revenue,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
      },
      {
        label: t('cogs'),
        borderColor: '#f97316', // orange-500
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        data: trendsData.value.cogs,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#f97316',
        pointRadius: 4,
      }
    ]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter, sans-serif', weight: 'bold' } } },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { size: 14, family: 'Inter, sans-serif' },
      bodyFont: { size: 13, family: 'Inter, sans-serif', weight: 'bold' },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) { label += ': '; }
          if (context.parsed.y !== null) {
            label += formatCurrency(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { borderDash: [4, 4], color: '#f1f5f9' },
      ticks: {
        font: { family: 'Inter, sans-serif' },
        callback: function(value) { return formatCurrency(value); }
      }
    },
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Inter, sans-serif', weight: '500' } }
    }
  }
}));
</script>
