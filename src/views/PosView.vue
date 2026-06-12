<template>
  <div class="min-h-screen bg-slate-50 flex font-sans">
    <div class="flex-1 p-8 flex flex-col h-screen overflow-hidden">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">Point of Sale</h1>
        <p class="text-slate-500 mt-1">Tap items to add to current order</p>
      </header>

      <div class="flex-1 overflow-y-auto pb-10 custom-scrollbar">
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="product in products" :key="product.id"
            @click="cartStore.addToCart(product)"
            class="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-100 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="h-32 bg-slate-50 rounded-xl mb-5 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
              <span class="text-5xl drop-shadow-sm">☕</span>
            </div>
            <h3 class="font-bold text-lg text-slate-800">{{ product.name }}</h3>
            <p class="text-xs text-slate-400 mb-3">SKU: {{ product.sku }}</p>
            <div class="flex justify-between items-end">
              <span class="text-xl font-black text-blue-600">${{ product.price.toFixed(2) }}</span>
              <span class="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                Stock: {{ product.stock }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen relative z-10">
      <div class="p-8 border-b border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800">Current Order</h2>
        <p class="text-sm text-slate-500 mt-1">{{ cartStore.items.length }} items selected</p>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">🛒</div>
          <p class="font-medium">Cart is empty</p>
        </div>

        <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div class="flex-1">
            <h4 class="font-bold text-slate-800">{{ item.name }}</h4>
            <div class="text-blue-600 font-semibold mt-1">${{ item.price.toFixed(2) }}</div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden p-1">
              <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="w-8 h-8 flex items-center justify-center rounded hover:bg-white text-slate-600 font-bold">-</button>
              <span class="w-8 text-center font-bold text-slate-800">{{ item.quantity }}</span>
              <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)" class="w-8 h-8 flex items-center justify-center rounded hover:bg-white text-slate-600 font-bold">+</button>
            </div>
            <button @click="cartStore.removeFromCart(item.id)" class="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="p-8 bg-white border-t border-slate-100">
        <div class="flex justify-between items-center mb-3">
          <span class="text-slate-500 font-medium">Subtotal</span>
          <span class="font-bold text-slate-800">${{ cartStore.subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center mb-8 border-t border-slate-100 pt-4">
          <span class="text-xl font-bold text-slate-800">Total</span>
          <span class="text-3xl font-black text-blue-600">${{ cartStore.grandTotal.toFixed(2) }}</span>
        </div>
        <button 
          @click="checkout" 
          :disabled="cartStore.items.length === 0 || isProcessing"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isProcessing ? 'Processing...' : 'Confirm Checkout' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/useCartStore';
import { dbService } from '../services/dbService';
import { printerService } from '../services/printerService';

const cartStore = useCartStore();
const products = ref([]);
const isProcessing = ref(false);

onMounted(async () => {
  products.value = await dbService.getProducts();
});

const checkout = async () => {
  if (cartStore.items.length === 0) return;
  isProcessing.value = true;
  
  const totalAmount = cartStore.grandTotal;
  const itemsToPrint = [...cartStore.items];
  
  const result = await dbService.checkout(cartStore.items, totalAmount);
  
  if (result.success) {
    alert(`Checkout successful! Invoice: ${result.invoiceNumber}`);
    
    // Trigger Bluetooth Printing
    await printerService.printReceipt({ invoiceNumber: result.invoiceNumber, total: totalAmount }, itemsToPrint);

    cartStore.clearCart();
    products.value = await dbService.getProducts(); 
  } else {
    alert('Checkout failed. See console.');
  }
  isProcessing.value = false;
};
</script>
