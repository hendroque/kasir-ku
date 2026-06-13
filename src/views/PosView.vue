<template>
  <div class="h-full w-full bg-slate-50 flex flex-col lg:flex-row font-sans relative">
    <div class="flex-1 p-4 lg:p-8 flex flex-col overflow-hidden">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ t('nav_pos') }}</h1>
          <p class="text-slate-500 mt-1">Tap items to add to current order</p>
        </div>
        <button @click="startScanner" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center space-x-2">
          <span class="text-xl">📷</span> <span>{{ t('scan_barcode') }}</span>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto pb-10 custom-scrollbar">
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <div 
            v-for="product in products" :key="product.id"
            @click="cartStore.addToCart(product)"
            class="group bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-100 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-95 touch-manipulation relative overflow-hidden flex flex-col justify-between"
          >
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div>
              <div class="h-20 sm:h-32 bg-slate-50 rounded-xl mb-3 sm:mb-5 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50/50 transition-colors overflow-hidden">
                <img v-if="product.image" :src="product.image" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <span v-else class="text-4xl sm:text-5xl drop-shadow-sm">☕</span>
              </div>
              <h3 class="font-bold text-sm sm:text-lg text-slate-800 line-clamp-2 leading-tight">{{ product.name }}</h3>
              <p class="text-[0.65rem] sm:text-xs text-slate-400 mb-3 mt-1">SKU: {{ product.sku }}</p>
            </div>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0 mt-auto">
              <span class="text-lg sm:text-xl font-black text-blue-600">{{ formatCurrency(product.price) }}</span>
              <span class="text-[0.65rem] sm:text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                Stock: {{ product.stock }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="[isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0']" class="fixed inset-0 lg:relative lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-2xl flex flex-col z-50 lg:z-10 transition-transform duration-300 ease-in-out">
      <div class="p-6 lg:p-8 border-b border-slate-100 flex justify-between items-center bg-white z-20">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">{{ t('current_order') }}</h2>
          <p class="text-sm text-slate-500 mt-1">{{ cartStore.items.length }} items selected</p>
        </div>
        <button @click="isCartOpen = false" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold active:scale-95 touch-manipulation">✕</button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-slate-50/50">
        <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">🛒</div>
          <p class="font-medium">{{ t('cart_empty') }}</p>
        </div>

        <div v-for="item in cartStore.items" :key="item.id" class="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
          <div class="flex-1">
            <h4 class="font-bold text-slate-800">{{ item.name }}</h4>
            <div class="text-blue-600 font-semibold mt-1">{{ formatCurrency(item.price) }}</div>
          </div>
          <div class="flex justify-between sm:justify-end items-center w-full sm:w-auto space-x-3">
            <div class="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden p-1">
              <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="w-10 h-10 flex items-center justify-center rounded hover:bg-white text-slate-600 font-bold active:scale-95 touch-manipulation">-</button>
              <span class="w-8 text-center font-bold text-slate-800">{{ item.quantity }}</span>
              <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)" class="w-10 h-10 flex items-center justify-center rounded hover:bg-white text-slate-600 font-bold active:scale-95 touch-manipulation">+</button>
            </div>
            <button @click="cartStore.removeFromCart(item.id)" class="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors active:scale-95 touch-manipulation">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 pb-20 lg:p-8 lg:pb-8 bg-white border-t border-slate-100">
        <div class="flex justify-between items-center mb-3">
          <span class="text-slate-500 font-medium">{{ t('subtotal') }}</span>
          <span class="font-bold text-slate-800">{{ formatCurrency(cartStore.subtotal) }}</span>
        </div>
        <div v-if="cartStore.taxRate > 0" class="flex justify-between items-center mb-3">
          <span class="text-slate-500 font-medium">{{ t('tax') }} ({{ cartStore.taxRate }}%)</span>
          <span class="font-bold text-slate-800">{{ formatCurrency(cartStore.taxAmount) }}</span>
        </div>
        <div class="flex justify-between items-center mb-8 border-t border-slate-100 pt-4">
          <span class="text-xl font-bold text-slate-800">{{ t('total') }}</span>
          <span class="text-3xl font-black text-blue-600">{{ formatCurrency(cartStore.grandTotal) }}</span>
        </div>
        <button 
          @click="checkout" 
          :disabled="cartStore.items.length === 0 || isProcessing"
          class="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 touch-manipulation min-h-[56px]">
          {{ isProcessing ? 'Processing...' : t('confirm_checkout') }}
        </button>
      </div>
    </div>

    <!-- Floating Mobile Cart Button -->
    <div v-if="!isCartOpen" class="fixed bottom-[4.5rem] left-4 right-4 lg:hidden z-40">
      <button @click="isCartOpen = true" class="w-full bg-slate-800 text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl active:scale-95 touch-manipulation">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm">{{ cartStore.items.length }}</div>
          <span class="font-semibold">View Cart</span>
        </div>
        <span class="font-black text-lg">{{ formatCurrency(cartStore.grandTotal) }}</span>
      </button>
    </div>
    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transform transition-all text-center">
        <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <span class="text-5xl">🎉</span>
        </div>
        <h2 class="text-3xl font-black text-slate-800 mb-2">{{ t('checkout_success') }}</h2>
        <p class="text-slate-500 mb-6">Payment completed successfully.</p>
        
        <div class="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
          <p class="text-sm text-slate-400 mb-1">{{ t('invoice') }}</p>
          <p class="font-bold text-slate-800 tracking-wider">{{ checkoutInvoice }}</p>
        </div>
        
        <button @click="showSuccessModal = false" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 touch-manipulation">
          {{ t('new_order') }}
        </button>
      </div>
    </div>
    
    <!-- Scanner Modal -->
    <div v-show="showScanner" class="fixed inset-0 bg-slate-900/90 z-[110] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div class="p-6 text-center border-b border-slate-100">
          <h2 class="text-2xl font-bold text-slate-800">{{ t('scan_barcode') }}</h2>
          <p class="text-sm text-slate-500 mt-1">Point camera at the barcode</p>
        </div>
        <div id="reader" class="w-full h-[400px] bg-black"></div>
        <div class="p-6">
          <button @click="stopScanner" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all active:scale-95">
            {{ t('cancel_scan') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '../stores/useCartStore';
import { dbService } from '../services/dbService';
import { printerService } from '../services/printerService';
import { t, formatCurrency } from '../utils/i18n';
import { Html5Qrcode } from 'html5-qrcode';

const cartStore = useCartStore();
const products = ref([]);
const isProcessing = ref(false);
const isCartOpen = ref(false);
const showSuccessModal = ref(false);
const checkoutInvoice = ref('');

const showScanner = ref(false);
let html5QrCode = null;

onMounted(async () => {
  products.value = await dbService.getProducts();
  const settings = await dbService.getSettings();
  if (settings.tax_rate) {
    cartStore.setTaxRate(Number(settings.tax_rate));
  }
});

const checkout = async () => {
  if (cartStore.items.length === 0) return;
  isProcessing.value = true;
  
  const totalAmount = cartStore.grandTotal;
  const itemsToPrint = [...cartStore.items];
  
  const result = await dbService.checkout(cartStore.items, totalAmount);
  
  if (result.success) {
    checkoutInvoice.value = result.invoiceNumber;
    showSuccessModal.value = true;
    
    // Trigger Bluetooth Printing
    await printerService.printReceipt({ invoiceNumber: result.invoiceNumber, total: totalAmount }, itemsToPrint);

    cartStore.clearCart();
    products.value = await dbService.getProducts(); 
    isCartOpen.value = false;
  } else {
    alert('Checkout failed. See console.');
  }
  isProcessing.value = false;
};

// Scanner Logic
const startScanner = () => {
  showScanner.value = true;
  // Initialize slightly after modal renders
  setTimeout(() => {
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // Success
        const product = products.value.find(p => p.sku === decodedText);
        if (product) {
          cartStore.addToCart(product);
          // Optional: give haptic feedback or sound here
        } else {
          // Optional: alert product not found
        }
      },
      (errorMessage) => {
        // parse error, ignore
      }
    ).catch(err => {
      console.error(err);
      alert('Camera access denied or error occurred');
      showScanner.value = false;
    });
  }, 100);
};

const stopScanner = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    await html5QrCode.stop().catch(console.error);
    html5QrCode.clear();
  }
  showScanner.value = false;
};

onUnmounted(() => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().catch(console.error);
  }
});
</script>
