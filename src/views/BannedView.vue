<template>
  <div class="h-screen w-full flex flex-col items-center justify-center bg-red-600 text-white p-6 text-center select-none fixed inset-0 z-[9999]">
    <div class="mb-8">
      <div class="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-pulse">
        <span class="text-6xl">🔒</span>
      </div>
      <h1 class="text-4xl font-black mb-4 uppercase tracking-wider">Akses Diblokir</h1>
      <p class="text-xl text-red-100 max-w-md mx-auto leading-relaxed font-medium">
        Aplikasi Anda telah diblokir atau masa aktif lisensi telah habis.
      </p>
    </div>
    
    <div class="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full max-w-sm">
      <p class="text-sm font-semibold uppercase tracking-widest text-red-200 mb-2">Solusi</p>
      <p class="font-bold text-lg">Silakan hubungi Administrator untuk memperpanjang akses Anda.</p>
    </div>
  </div>
</template>

<script setup>
// Minimal logic, view is completely locked
</script>

<style scoped>
/* Prevent any scroll or interaction */
body {
  overflow: hidden !important;
  touch-action: none !important;
}
</style>
