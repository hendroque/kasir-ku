import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);

  const subtotal = computed(() => items.value.reduce((total, item) => total + (item.price * item.quantity), 0));
  const grandTotal = computed(() => subtotal.value);

  function addToCart(product) {
    const existing = items.value.find(i => i.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) existing.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(i => i.id !== productId);
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.id === productId);
    if (item && quantity > 0 && quantity <= item.stock) {
      item.quantity = quantity;
    }
  }

  function clearCart() {
    items.value = [];
  }

  return { items, subtotal, grandTotal, addToCart, removeFromCart, updateQuantity, clearCart };
});
