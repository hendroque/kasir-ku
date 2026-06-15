import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

// Change this to your VPS IP in production
const API_URL = 'http://localhost:3000/api/check'; 

export const licenseService = {
  async verifyLicense() {
    try {
      const deviceInfo = await Device.getId();
      const deviceNameInfo = await Device.getInfo();
      
      const uuid = deviceInfo.identifier || 'unknown-uuid';
      const name = deviceNameInfo.model || 'Unknown Android Device';

      // Check internet
      const status = await Network.getStatus();
      
      if (!status.connected) {
        // Offline: Return cached status (default active)
        return localStorage.getItem('license_status') || 'active';
      }

      // Online: Verify with server
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_uuid: uuid,
          device_name: name
        })
      });

      if (!response.ok) {
        // If server is down, fallback to cache
        return localStorage.getItem('license_status') || 'active';
      }

      const data = await response.json();
      const serverStatus = data.status || 'active';
      
      // Cache the latest status
      localStorage.setItem('license_status', serverStatus);
      return serverStatus;

    } catch (error) {
      console.error('License verification failed:', error);
      // Fallback to cache on error
      return localStorage.getItem('license_status') || 'active';
    }
  }
};
