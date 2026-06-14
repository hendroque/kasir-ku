import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

const ESC_INIT = [0x1B, 0x40]; 
const ESC_ALIGN_CENTER = [0x1B, 0x61, 0x01];
const ESC_ALIGN_LEFT = [0x1B, 0x61, 0x00];
const ESC_BOLD_ON = [0x1B, 0x45, 0x01];
const ESC_BOLD_OFF = [0x1B, 0x45, 0x00];

export const printerService = {
  savedPrinterId: null,

  async init() {
    if (Capacitor.getPlatform() === 'web') return;
    try {
      await BleClient.initialize();
      this.savedPrinterId = localStorage.getItem('printerId');
    } catch (err) {
      console.error('BLE Init Error:', err);
    }
  },

  async scanAndConnect() {
    if (Capacitor.getPlatform() === 'web') {
      alert("Bluetooth printing requires a real Android/iOS device.");
      return { success: false };
    }
    try {
      const device = await BleClient.requestDevice(); 
      await BleClient.connect(device.deviceId);
      
      this.savedPrinterId = device.deviceId;
      localStorage.setItem('printerId', device.deviceId);
      return { success: true, deviceName: device.name || 'Unknown Printer' };
    } catch (err) {
      console.error('Bluetooth Connection Error:', err);
      return { success: false, error: err };
    }
  },

  async printReceipt(orderData, cartItems) {
    if (Capacitor.getPlatform() === 'web') {
      console.log('Simulating Web Print: ', orderData, cartItems);
      return; 
    }
    
    if (!this.savedPrinterId) {
      alert("No printer configured. Please pair a printer in Settings.");
      return;
    }

    const textToBytes = (text) => Array.from(text).map(c => c.charCodeAt(0));

    let payload = [
      ...ESC_INIT,
      ...ESC_ALIGN_CENTER, ...ESC_BOLD_ON, ...textToBytes("KASIRKU PRO STORE\n"), ...ESC_BOLD_OFF,
      ...textToBytes("123 Main Street\n\n"),
      ...ESC_ALIGN_LEFT,
      ...textToBytes(`Inv  : ${orderData.invoiceNumber}\n`),
      ...textToBytes(`Date : ${new Date().toLocaleString()}\n`),
      ...textToBytes("--------------------------------\n")
    ];

    cartItems.forEach(item => {
      payload.push(...textToBytes(`${item.name}\n`));
      payload.push(...textToBytes(`${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}\n`));
    });

    payload.push(...textToBytes("--------------------------------\n"));
    payload.push(...ESC_ALIGN_CENTER, ...ESC_BOLD_ON, ...textToBytes(`TOTAL: $${orderData.total.toFixed(2)}\n`), ...ESC_BOLD_OFF);
    payload.push(...textToBytes("\nThank you for shopping!\n\n\n")); 

    try {
      await BleClient.connect(this.savedPrinterId);
      
      const SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'; 
      const CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';    
      
      const buffer = new Uint8Array(payload).buffer;
      const dataView = new DataView(buffer);
      
      await BleClient.write(this.savedPrinterId, SERVICE_UUID, CHAR_UUID, dataView);
      
    } catch (err) {
      console.error('Print Error:', err);
      alert("Failed to print. Check if the printer is turned on.");
    }
  }
};
