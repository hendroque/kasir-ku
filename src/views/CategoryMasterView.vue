<template>
  <div class="p-4 md:p-8 h-full overflow-y-auto">
    <div class="max-w-4xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800">{{ t('nav_categories') }}</h1>
          <p class="text-slate-500 mt-1">{{ t('manage_categories') }}</p>
        </div>
        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
          {{ t('add_category') }}
        </button>
      </header>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-sm">
            <tr>
              <th class="p-4">ID</th>
              <th class="p-4">{{ t('category_name') }}</th>
              <th class="p-4 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="cat in categories" :key="cat.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-4 text-slate-500">{{ cat.id }}</td>
              <td class="p-4 font-bold text-slate-800">{{ cat.name }}</td>
              <td class="p-4 text-right space-x-3">
                <button @click="openModal(cat)" class="text-blue-500 hover:text-blue-700 font-semibold">{{ t('edit') }}</button>
                <button @click="deleteCategory(cat.id)" class="text-red-400 hover:text-red-600 font-semibold">{{ t('delete') }}</button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="3" class="p-8 text-center text-slate-400">{{ t('no_products') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" @click="showModal = false"></div>
      
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 class="text-2xl font-bold text-slate-800">{{ isEditing ? t('edit_category_title') : t('new_category_title') }}</h2>
          <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">✕</button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">{{ t('category_name') }}</label>
              <input v-model="formData.name" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all" />
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 flex justify-end space-x-3 shrink-0 bg-slate-50 rounded-b-2xl">
          <button @click="showModal = false" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 transition-colors">{{ t('cancel') }}</button>
          <button @click="saveCategory" class="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">{{ t('save_category') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dbService } from '../services/dbService';
import { t } from '../utils/i18n';

const categories = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const formData = ref({ id: null, name: '' });

const loadCategories = async () => {
  categories.value = await dbService.getCategories();
};

onMounted(loadCategories);

const openModal = (cat = null) => {
  if (cat) {
    formData.value = { ...cat };
    isEditing.value = true;
  } else {
    formData.value = { id: null, name: '' };
    isEditing.value = false;
  }
  showModal.value = true;
};

const saveCategory = async () => {
  if (!formData.value.name) return alert('Name is required');
  
  if (isEditing.value) {
    await dbService.updateCategory(formData.value.id, formData.value.name);
  } else {
    await dbService.addCategory(formData.value.name);
  }
  showModal.value = false;
  await loadCategories();
};

const deleteCategory = async (id) => {
  if (confirm('Are you sure you want to delete this category?')) {
    await dbService.deleteCategory(id);
    await loadCategories();
  }
};
</script>
