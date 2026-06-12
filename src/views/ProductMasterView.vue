<template>
  <div class="p-8 h-screen overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800">Products</h1>
          <p class="text-slate-500 mt-1">Manage your inventory</p>
        </div>
        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
          + Add Product
        </button>
      </header>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
            <tr>
              <th class="p-4">SKU</th>
              <th class="p-4">Name</th>
              <th class="p-4">Price</th>
              <th class="p-4">Stock</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="prod in products" :key="prod.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-500 text-sm">{{ prod.sku }}</td>
              <td class="p-4 font-bold text-slate-800">{{ prod.name }}</td>
              <td class="p-4 text-indigo-600 font-bold">${{ prod.price.toFixed(2) }}</td>
              <td class="p-4 font-medium" :class="prod.stock < 10 ? 'text-red-500' : 'text-slate-600'">{{ prod.stock }}</td>
              <td class="p-4 text-right space-x-3">
                <button @click="openModal(prod)" class="text-blue-500 hover:text-blue-700 font-semibold">Edit</button>
                <button @click="deleteProduct(prod.id)" class="text-red-400 hover:text-red-600 font-semibold">Delete</button>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-400">No products found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-800/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">{{ isEditing ? 'Edit Product' : 'New Product' }}</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-slate-600 mb-1">Product Name</label>
            <input v-model="formData.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-semibold text-slate-600 mb-1">Category</label>
            <select v-model="formData.category_id" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1">SKU</label>
            <input v-model="formData.sku" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-600 mb-1">Price</label>
            <input v-model.number="formData.price" type="number" step="0.01" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-semibold text-slate-600 mb-1">Stock Quantity</label>
            <input v-model.number="formData.stock" type="number" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white" />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-8">
          <button @click="showModal = false" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
          <button @click="saveProduct" class="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">Save Product</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService } from '../services/dbService';

const products = ref([]);
const categories = ref([]);
const showModal = ref(false);
const isEditing = ref(false);

const formData = ref({ id: null, category_id: null, name: '', sku: '', price: 0, stock: 0 });

const loadData = async () => {
  products.value = await dbService.getProducts();
  categories.value = await dbService.getCategories();
};

onMounted(loadData);

const openModal = (prod = null) => {
  if (prod) {
    formData.value = { ...prod };
    isEditing.value = true;
  } else {
    formData.value = { id: null, category_id: categories.value.length ? categories.value[0].id : null, name: '', sku: `SKU${Date.now().toString().slice(-4)}`, price: 0, stock: 0 };
    isEditing.value = false;
  }
  showModal.value = true;
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
