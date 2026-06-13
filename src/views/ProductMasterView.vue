<template>
  <div class="p-4 md:p-8 h-full overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800">{{ t('nav_products') }}</h1>
          <p class="text-slate-500 mt-1">{{ t('manage_inventory') }}</p>
        </div>
        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
          {{ t('add_product') }}
        </button>
      </header>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
            <tr>
              <th class="p-4 w-16">{{ t('image') }}</th>
              <th class="p-4">{{ t('sku') }}</th>
              <th class="p-4">{{ t('product_name') }}</th>
              <th class="p-4">{{ t('cost_price') }}</th>
              <th class="p-4">{{ t('price') }}</th>
              <th class="p-4">{{ t('stock') }}</th>
              <th class="p-4 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="prod in paginatedProducts" :key="prod.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4">
                <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  <img v-if="prod.image" :src="prod.image" class="w-full h-full object-cover" />
                  <span v-else class="text-xl">☕</span>
                </div>
              </td>
              <td class="p-4 text-slate-500 text-sm">{{ prod.sku }}</td>
              <td class="p-4 font-bold text-slate-800">{{ prod.name }}</td>
              <td class="p-4 text-orange-600 font-bold">{{ formatCurrency(prod.cost_price || 0) }}</td>
              <td class="p-4 text-indigo-600 font-bold">{{ formatCurrency(prod.price) }}</td>
              <td class="p-4 font-medium" :class="prod.stock < 10 ? 'text-red-500' : 'text-slate-600'">{{ prod.stock }}</td>
              <td class="p-4 text-right space-x-3">
                <button @click="openRestockModal(prod)" class="text-emerald-500 hover:text-emerald-700 font-semibold">{{ t('restock') }}</button>
                <button @click="openModal(prod)" class="text-blue-500 hover:text-blue-700 font-semibold">{{ t('edit') }}</button>
                <button @click="deleteProduct(prod.id)" class="text-red-400 hover:text-red-600 font-semibold">{{ t('delete') }}</button>
              </td>
            </tr>
            <tr v-if="paginatedProducts.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400">{{ t('no_products') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
        
        <!-- Pagination Controls -->
        <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div class="flex items-center space-x-2 text-sm text-slate-600">
            <span>{{ t('show') }}</span>
            <select v-model="itemsPerPage" class="border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
              <option value="All">All</option>
            </select>
            <span>{{ t('entries') }}</span>
          </div>
          
          <div class="text-sm text-slate-500">
            {{ t('showing') }} {{ products.length === 0 ? 0 : (itemsPerPage === 'All' ? 1 : ((currentPage - 1) * itemsPerPage) + 1) }} {{ t('to') }} {{ itemsPerPage === 'All' ? products.length : Math.min(currentPage * itemsPerPage, products.length) }} {{ t('of') }} {{ products.length }} {{ t('entries') }}
          </div>

          <div class="flex space-x-1 items-center">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1 || products.length === 0" class="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{{ t('prev') }}</button>
            <div class="px-3 py-1 font-semibold text-slate-700 text-sm">{{ currentPage }} / {{ totalPages }}</div>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages || products.length === 0" class="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{{ t('next') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" @click="showModal = false"></div>
      
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 class="text-2xl font-bold text-slate-800">{{ isEditing ? t('edit_product_title') : t('new_product_title') }}</h2>
          <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">✕</button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div class="flex flex-col items-center mb-6">
            <div class="w-32 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-colors group">
              <input type="file" accept="image/*" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <img v-if="formData.image" :src="formData.image" class="w-full h-full object-cover" />
              <div v-else class="text-center text-slate-400 group-hover:text-blue-500 transition-colors">
                <span class="text-3xl block mb-1">📸</span>
                <span class="text-[0.65rem] font-bold uppercase">{{ t('add_photo') }}</span>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-2">{{ t('auto_resized') }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('product_name') }}</label>
              <input v-model="formData.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('category') }}</label>
              <select v-model="formData.category_id" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('sku') }}</label>
              <input v-model="formData.sku" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('cost_price') }}</label>
              <input v-model.number="formData.cost_price" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('price') }}</label>
              <input v-model.number="formData.price" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
            </div>
            
            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('stock') }}</label>
              <input v-model.number="formData.stock" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 flex justify-end space-x-3 shrink-0 bg-slate-50 rounded-b-2xl">
          <button @click="showModal = false" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 transition-colors">{{ t('cancel') }}</button>
          <button @click="saveProduct" class="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">{{ t('save_product') }}</button>
        </div>
      </div>
    </div>

    <!-- Restock Modal -->
    <div v-if="showRestockModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" @click="showRestockModal = false"></div>
      
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-10 flex flex-col">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-slate-800">{{ t('restock') }}</h2>
          <button @click="showRestockModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <div class="p-6">
          <p class="text-slate-600 mb-4 font-semibold">{{ restockData.name }}</p>
          <div class="mb-4">
            <label class="block text-sm font-semibold text-slate-700 mb-2">{{ t('qty_to_add') }}</label>
            <input v-model.number="restockData.qtyToAdd" type="number" min="1" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button @click="submitRestock" :disabled="restockData.qtyToAdd <= 0" class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95">
            {{ t('save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { dbService } from '../services/dbService';
import { t, formatCurrency } from '../utils/i18n';

const products = ref([]);
const categories = ref([]);
const showModal = ref(false);
const showRestockModal = ref(false);
const isEditing = ref(false);
const formData = ref({ id: null, category_id: null, name: '', sku: '', price: 0, cost_price: 0, stock: 0, image: null });
const restockData = ref({ id: null, name: '', qtyToAdd: 0 });

const loadData = async () => {
  products.value = await dbService.getProducts();
  categories.value = await dbService.getCategories();
};

const itemsPerPage = ref(10);
const currentPage = ref(1);

const totalPages = computed(() => {
  if (itemsPerPage.value === 'All') return 1;
  return Math.ceil(products.value.length / itemsPerPage.value) || 1;
});

const paginatedProducts = computed(() => {
  if (itemsPerPage.value === 'All') return products.value;
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return products.value.slice(start, start + itemsPerPage.value);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

watch(itemsPerPage, () => {
  currentPage.value = 1;
});

onMounted(loadData);

const openModal = (prod = null) => {
  if (prod) {
    formData.value = { ...prod };
    isEditing.value = true;
  } else {
    formData.value = { id: null, category_id: categories.value.length ? categories.value[0].id : null, name: '', sku: `SKU${Date.now().toString().slice(-4)}`, price: 0, cost_price: 0, stock: 0, image: null };
    isEditing.value = false;
  }
  showModal.value = true;
};

const openRestockModal = (prod) => {
  restockData.value = { id: prod.id, name: prod.name, qtyToAdd: 1 };
  showRestockModal.value = true;
};

const submitRestock = async () => {
  if (restockData.value.qtyToAdd > 0) {
    await dbService.addStock(restockData.value.id, restockData.value.qtyToAdd);
    showRestockModal.value = false;
    await loadData();
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const TARGET_SIZE = 480;
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
      ctx.drawImage(img, startX, startY, size, size, 0, 0, TARGET_SIZE, TARGET_SIZE);
      
      formData.value.image = canvas.toDataURL('image/jpeg', 0.8);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const saveProduct = async () => {
  if (!formData.value.name || !formData.value.sku) return alert('Name and SKU are required');
  
  if (isEditing.value) {
    await dbService.updateProduct(formData.value.id, formData.value);
  } else {
    await dbService.addProduct(formData.value);
  }
  showModal.value = false;
  await loadData();
};

const deleteProduct = async (id) => {
  if (confirm('Delete this product?')) {
    await dbService.deleteProduct(id);
    await loadData();
  }
};
</script>
