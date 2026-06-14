import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

export const isWeb = Capacitor.getPlatform() === 'web';
const sqlite = new SQLiteConnection(CapacitorSQLite);
let db;

// Mock data for immediate browser testing
let mockProducts = [
  { id: 1, category_id: 1, name: 'Premium Espresso', sku: 'SKU001', price: 35000, cost_price: 15000, stock: 100, image: null },
  { id: 2, category_id: 1, name: 'Vanilla Latte', sku: 'SKU002', price: 45000, cost_price: 20000, stock: 85, image: null },
  { id: 3, category_id: 2, name: 'Butter Croissant', sku: 'SKU003', price: 25000, cost_price: 10000, stock: 40, image: null },
  { id: 4, category_id: 2, name: 'Blueberry Muffin', sku: 'SKU004', price: 30000, cost_price: 12000, stock: 25, image: null }
];

let mockCategories = [
  { id: 1, name: 'Coffee', is_active: 1 },
  { id: 2, name: 'Pastry', is_active: 1 }
];
let mockOrders = [];
let mockOrderItems = [];
let mockSettings = {
  store_name: 'Kasir-Ku Coffee',
  store_address: 'Jl. Kopi No. 1, Jakarta',
  store_phone: '081234567890',
  tax_rate: '11'
};
let mockStockLedger = [];
let mockPurchases = [];
let mockPurchaseItems = [];
let mockHppHistory = [];
let mockStockAdjustments = [];

export const dbService = {
  async initDb() {
    if (isWeb) {
      console.warn('Running on Web: Using Mock DB Service for Phase 1 UI Testing');
      return;
    }
    try {
      db = await sqlite.createConnection('pos_db', false, 'no-encryption', 1, false);
      await db.open();
      
      await db.execute('PRAGMA foreign_keys = ON;');
      
      const query = `
        CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, is_active INTEGER DEFAULT 1);
        CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, name TEXT NOT NULL, sku TEXT UNIQUE, price REAL NOT NULL, cost_price REAL DEFAULT 0, stock INTEGER NOT NULL, image TEXT, is_active INTEGER DEFAULT 1, FOREIGN KEY (category_id) REFERENCES categories (id));
        CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT UNIQUE NOT NULL, total_amount REAL NOT NULL, payment_method TEXT NOT NULL, status TEXT DEFAULT 'completed', is_synced INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, price REAL NOT NULL, cost_price REAL DEFAULT 0, subtotal REAL NOT NULL, FOREIGN KEY (order_id) REFERENCES orders (id), FOREIGN KEY (product_id) REFERENCES products (id));
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS stock_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, type TEXT, quantity INTEGER, reference TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products (id));
        CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT UNIQUE NOT NULL, total_amount REAL NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS purchase_items (id INTEGER PRIMARY KEY AUTOINCREMENT, purchase_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, buy_price REAL NOT NULL, subtotal REAL NOT NULL, FOREIGN KEY (purchase_id) REFERENCES purchases (id), FOREIGN KEY (product_id) REFERENCES products (id));
        CREATE TABLE IF NOT EXISTS hpp_history (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, old_hpp REAL, new_hpp REAL, reason TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products (id));
        CREATE TABLE IF NOT EXISTS stock_adjustments (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, old_stock INTEGER, new_stock INTEGER, difference INTEGER, reason TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES products (id));
      `;
      await db.execute(query);
      
      try {
        await db.execute('ALTER TABLE products ADD COLUMN image TEXT;');
      } catch (e) {
        // column likely already exists, ignore
      }
      
      const res = await db.query('SELECT count(id) as count FROM products');
      if (res.values[0].count === 0) {
        await db.execute(`
          INSERT INTO categories (name) VALUES ('Beverages'), ('Snacks');
          INSERT INTO products (category_id, name, sku, price, cost_price, stock) VALUES 
          (1, 'Premium Espresso', 'SKU001', 35000, 15000, 100), (1, 'Vanilla Latte', 'SKU002', 45000, 20000, 85), 
          (2, 'Butter Croissant', 'SKU003', 25000, 10000, 40), (2, 'Blueberry Muffin', 'SKU004', 30000, 12000, 25);
        `);
      }
      
      const setRes = await db.query('SELECT count(key) as count FROM settings');
      if (setRes.values[0].count === 0) {
        await db.execute(`
          INSERT INTO settings (key, value) VALUES 
          ('store_name', 'Kasir-Ku Coffee'),
          ('store_address', 'Jl. Kopi No. 1, Jakarta'),
          ('store_phone', '081234567890'),
          ('tax_rate', '11');
        `);
      }
    } catch (err) {
      console.error('SQLite Init Error:', err);
      alert('Database Initialization Failed: ' + err.message);
    }
  },

  async getSettings() {
    if (isWeb) return { ...mockSettings };
    try {
      const res = await db.query("SELECT * FROM settings");
      const settings = {};
      (res.values || []).forEach(row => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (err) { console.error(err); return {}; }
  },

  async saveSettings(settingsObj) {
    if (isWeb) {
      mockSettings = { ...mockSettings, ...settingsObj };
      return { success: true };
    }
    try {
      for (const [key, value] of Object.entries(settingsObj)) {
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, value]);
      }
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },

  async getProducts() {
    if (isWeb) return mockProducts;
    const res = await db.query('SELECT * FROM products WHERE is_active = 1');
    return res.values || [];
  },

  async checkout(cartItems, total, paymentMethod = 'cash') {
    const invoiceNumber = 'INV-' + Date.now();
    
    if (isWeb) {
      const orderId = mockOrders.length + 1;
      const order = { id: orderId, invoice_number: invoiceNumber, total_amount: total, payment_method: paymentMethod, created_at: new Date().toISOString() };
      mockOrders.unshift(order);
      
      cartItems.forEach(item => {
        const prod = mockProducts.find(p => p.id === item.id);
        if (prod) prod.stock -= item.quantity;
        mockOrderItems.push({
          id: mockOrderItems.length + 1,
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          cost_price: item.cost_price,
          subtotal: item.price * item.quantity
        });
        mockStockLedger.unshift({
          id: mockStockLedger.length + 1,
          product_id: item.id,
          product_name: item.name,
          type: 'OUT',
          quantity: item.quantity,
          reference: `Sales ${invoiceNumber}`,
          created_at: new Date().toISOString()
        });
      });
      return { success: true, invoiceNumber };
    }

    try {
      await db.beginTransaction();
      const orderRes = await db.run('INSERT INTO orders (invoice_number, total_amount, payment_method) VALUES (?, ?, ?)', [invoiceNumber, total, paymentMethod]);
      const orderId = (orderRes.changes && orderRes.changes.lastId !== undefined) ? orderRes.changes.lastId : (orderRes.lastId || Date.now());

      for (const item of cartItems) {
        const subtotal = item.price * item.quantity;
        await db.run('INSERT INTO order_items (order_id, product_id, quantity, price, cost_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)', [orderId, item.id, item.quantity, item.price, item.cost_price || 0, subtotal]);
        await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
        await db.run('INSERT INTO stock_ledger (product_id, type, quantity, reference) VALUES (?, ?, ?, ?)', [item.id, 'OUT', item.quantity, `Sales ${invoiceNumber}`]);
      }
      await db.commitTransaction();
      return { success: true, invoiceNumber };
    } catch (err) {
      await db.rollbackTransaction();
      console.error('Checkout error:', err);
      return { success: false, error: err.message || JSON.stringify(err) };
    }
  },

  async getCategories() {
    if (isWeb) return [{ id: 1, name: 'Beverages', is_active: 1 }, { id: 2, name: 'Snacks', is_active: 1 }];
    const res = await db.query('SELECT * FROM categories WHERE is_active = 1');
    return res.values || [];
  },
  async addCategory(name) {
    if (isWeb) return { success: true };
    try {
      await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },
  async updateCategory(id, name) {
    if (isWeb) return { success: true };
    try {
      await db.run('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },
  async deleteCategory(id) {
    if (isWeb) return { success: true };
    try {
      await db.run('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },

  async addProduct(product) {
    if (isWeb) {
      product.id = mockProducts.length + 1;
      mockProducts.push(product);
      return { success: true };
    }
    try {
      await db.run('INSERT INTO products (category_id, name, sku, price, cost_price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [product.category_id, product.name, product.sku, product.price, product.cost_price, product.stock, product.image || null]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },
  async updateProduct(id, product) {
    if (isWeb) {
      const idx = mockProducts.findIndex(p => p.id === id);
      if (idx !== -1) mockProducts[idx] = { ...mockProducts[idx], ...product };
      return { success: true };
    }
    try {
      await db.run('UPDATE products SET category_id = ?, name = ?, sku = ?, price = ?, cost_price = ?, stock = ?, image = ? WHERE id = ?', 
        [product.category_id, product.name, product.sku, product.price, product.cost_price, product.stock, product.image || null, id]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },
  async deleteProduct(id) {
    if (isWeb) return { success: true };
    try {
      await db.run('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },

  async getOrders() {
    if (isWeb) return mockOrders;
    try {
      const res = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
      return res.values || [];
    } catch (err) { console.error(err); return []; }
  },
  
  async getOrderDetails(orderId) {
    if (isWeb) return mockOrderItems.filter(item => item.order_id === orderId);
    try {
      const query = `
        SELECT oi.*, p.name as product_name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `;
      const res = await db.query(query, [orderId]);
      return res.values || [];
    } catch (err) { console.error(err); return []; }
  },

  async getTodayReport() {
    if (isWeb) {
      const revenue = mockOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const itemsSold = mockOrderItems.reduce((sum, oi) => sum + oi.quantity, 0);
      const cogs = mockOrderItems.reduce((sum, oi) => sum + ((oi.cost_price || 0) * oi.quantity), 0);
      const grossProfit = revenue - cogs;
      
      const breakdownMap = {};
      mockOrderItems.forEach(oi => {
        if (!breakdownMap[oi.product_id]) {
          breakdownMap[oi.product_id] = {
            product_name: oi.product_name,
            quantity: 0,
            revenue: 0,
            total_cogs: 0
          };
        }
        breakdownMap[oi.product_id].quantity += oi.quantity;
        breakdownMap[oi.product_id].revenue += oi.subtotal;
        breakdownMap[oi.product_id].total_cogs += ((oi.cost_price || 0) * oi.quantity);
      });
      
      const itemBreakdown = Object.values(breakdownMap).map(item => ({
        ...item,
        avg_cogs: item.quantity > 0 ? item.total_cogs / item.quantity : 0,
        profit: item.revenue - item.total_cogs
      })).sort((a, b) => b.revenue - a.revenue);

      return { revenue, itemsSold, cogs, grossProfit, itemBreakdown };
    }
    try {
      const revQuery = "SELECT SUM(total_amount) as revenue FROM orders WHERE date(created_at, 'localtime') = date('now', 'localtime')";
      const revRes = await db.query(revQuery);
      const revenue = revRes.values[0]?.revenue || 0;

      const itemsQuery = `
        SELECT SUM(oi.quantity) as itemsSold, SUM(oi.cost_price * oi.quantity) as cogs 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE date(o.created_at, 'localtime') = date('now', 'localtime')
      `;
      const itemsRes = await db.query(itemsQuery);
      const itemsSold = itemsRes.values[0]?.itemsSold || 0;
      const cogs = itemsRes.values[0]?.cogs || 0;
      const grossProfit = revenue - cogs;

      const breakdownQuery = `
        SELECT 
          p.name as product_name,
          SUM(oi.quantity) as quantity,
          SUM(oi.subtotal) as revenue,
          SUM(oi.cost_price * oi.quantity) as total_cogs,
          SUM(oi.cost_price * oi.quantity) / SUM(oi.quantity) as avg_cogs,
          SUM(oi.subtotal) - SUM(oi.cost_price * oi.quantity) as profit
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE date(o.created_at, 'localtime') = date('now', 'localtime')
        GROUP BY oi.product_id
        ORDER BY revenue DESC
      `;
      const breakdownRes = await db.query(breakdownQuery);
      const itemBreakdown = breakdownRes.values || [];

      return { revenue, itemsSold, cogs, grossProfit, itemBreakdown };
    } catch (err) { console.error(err); return { revenue: 0, itemsSold: 0, cogs: 0, grossProfit: 0, itemBreakdown: [] }; }
  },

  async getStockReport() {
    if (isWeb) {
      const activeProducts = mockProducts.filter(p => p.is_active !== 0);
      const totalValue = activeProducts.reduce((sum, p) => sum + ((p.cost_price || 0) * (p.stock || 0)), 0);
      const products = [...activeProducts].sort((a, b) => a.stock - b.stock);
      return { totalValue, products };
    }
    try {
      const valueQuery = "SELECT SUM(cost_price * stock) as totalValue FROM products WHERE is_active = 1";
      const valueRes = await db.query(valueQuery);
      const totalValue = valueRes.values[0]?.totalValue || 0;

      const productsQuery = "SELECT id, sku, name, cost_price, price, stock FROM products WHERE is_active = 1 ORDER BY stock ASC";
      const productsRes = await db.query(productsQuery);
      
      return { totalValue, products: productsRes.values || [] };
    } catch (err) {
      console.error(err); return { totalValue: 0, products: [] };
    }
  },

  async getWeeklyTrends() {
    if (isWeb) {
      // Mock 7-day data
      const dates = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      return {
        labels: dates,
        revenue: [150000, 200000, 180000, 220000, 300000, 280000, mockOrders.reduce((sum, o) => sum + o.total_amount, 0) || 250000],
        cogs: [70000, 90000, 80000, 100000, 140000, 130000, mockOrderItems.reduce((sum, oi) => sum + ((oi.cost_price||0)*oi.quantity), 0) || 120000]
      };
    }
    try {
      const query = `
        SELECT 
          date(o.created_at, 'localtime') as date_label,
          SUM(o.total_amount) as daily_revenue,
          SUM(oi.cost_price * oi.quantity) as daily_cogs
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE date(o.created_at, 'localtime') >= date('now', '-6 days', 'localtime')
        GROUP BY date_label
        ORDER BY date_label ASC
      `;
      const res = await db.query(query);
      const records = res.values || [];
      
      // We need to ensure all 7 days are represented even if there's no sales
      const labels = [];
      const revenue = [];
      const cogs = [];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        labels.push(displayLabel);
        
        const record = records.find(r => r.date_label === dateStr);
        revenue.push(record ? record.daily_revenue : 0);
        cogs.push(record ? record.daily_cogs : 0);
      }
      
      return { labels, revenue, cogs };
    } catch (err) {
      console.error(err);
      return { labels: [], revenue: [], cogs: [] };
    }
  },

  async addStock(productId, qtyToAdd, reference = 'Manual Restock') {
    if (isWeb) {
      const idx = mockProducts.findIndex(p => p.id === productId);
      if (idx !== -1) {
        mockProducts[idx].stock += qtyToAdd;
        mockStockLedger.unshift({
          id: mockStockLedger.length + 1,
          product_id: productId,
          product_name: mockProducts[idx].name,
          type: 'IN',
          quantity: qtyToAdd,
          reference: reference,
          created_at: new Date().toISOString()
        });
      }
      return { success: true };
    }
    try {
      await db.beginTransaction();
      await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [qtyToAdd, productId]);
      await db.run('INSERT INTO stock_ledger (product_id, type, quantity, reference) VALUES (?, ?, ?, ?)', [productId, 'IN', qtyToAdd, reference]);
      await db.commitTransaction();
      return { success: true };
    } catch (err) {
      await db.rollbackTransaction();
      console.error(err); return { success: false, error: err };
    }
  },

  async cancelOrder(orderId) {
    if (isWeb) {
      const orderIdx = mockOrders.findIndex(o => o.id === orderId);
      if (orderIdx === -1) return { success: false, error: 'Order not found' };
      
      mockOrders[orderIdx].status = 'cancelled';
      const itemsToRestore = mockOrderItems.filter(oi => oi.order_id === orderId);
      
      itemsToRestore.forEach(item => {
        const prodIdx = mockProducts.findIndex(p => p.id === item.product_id);
        if (prodIdx !== -1) {
          mockProducts[prodIdx].stock += item.quantity;
        }
        mockStockLedger.unshift({
          id: mockStockLedger.length + 1,
          product_id: item.product_id,
          product_name: item.product_name,
          type: 'IN',
          quantity: item.quantity,
          reference: `Void ${mockOrders[orderIdx].invoice_number}`,
          created_at: new Date().toISOString()
        });
      });
      return { success: true };
    }
    try {
      await db.beginTransaction();
      await db.run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId]);
      
      const orderRes = await db.query("SELECT invoice_number FROM orders WHERE id = ?", [orderId]);
      const invoiceNumber = orderRes.values[0]?.invoice_number || 'Unknown';
      
      const itemsRes = await db.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId]);
      const items = itemsRes.values || [];
      
      for (const item of items) {
        await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        await db.run('INSERT INTO stock_ledger (product_id, type, quantity, reference) VALUES (?, ?, ?, ?)', [item.product_id, 'IN', item.quantity, `Void ${invoiceNumber}`]);
      }
      
      await db.commitTransaction();
      return { success: true };
    } catch (err) {
      await db.rollbackTransaction();
      console.error(err); return { success: false, error: err };
    }
  },

  async getStockLedger() {
    if (isWeb) return mockStockLedger;
    try {
      const query = `
        SELECT l.*, p.name as product_name, p.sku
        FROM stock_ledger l
        JOIN products p ON l.product_id = p.id
        ORDER BY l.created_at DESC
      `;
      const res = await db.query(query);
      return res.values || [];
    } catch (err) { console.error(err); return []; }
  },

  async getPurchases() {
    if (isWeb) return mockPurchases;
    try {
      const res = await db.query("SELECT * FROM purchases ORDER BY created_at DESC");
      return res.values || [];
    } catch (err) { console.error(err); return []; }
  },

  async submitPurchase(items, totalAmount) {
    const invoiceNumber = 'PURC-' + Date.now();
    if (isWeb) {
      const purchaseId = mockPurchases.length + 1;
      mockPurchases.unshift({ id: purchaseId, invoice_number: invoiceNumber, total_amount: totalAmount, created_at: new Date().toISOString() });
      
      items.forEach(item => {
        const prodIdx = mockProducts.findIndex(p => p.id === item.product_id);
        if (prodIdx !== -1) {
          const oldStock = mockProducts[prodIdx].stock;
          const oldHpp = mockProducts[prodIdx].cost_price || 0;
          
          const totalOldValue = oldStock * oldHpp;
          const totalNewValue = item.quantity * item.buy_price;
          const totalQty = oldStock + item.quantity;
          
          const newHpp = totalQty > 0 ? (totalOldValue + totalNewValue) / totalQty : 0;
          
          mockProducts[prodIdx].stock = totalQty;
          mockProducts[prodIdx].cost_price = newHpp;
          
          mockHppHistory.unshift({
            id: mockHppHistory.length + 1,
            product_id: item.product_id,
            old_hpp: oldHpp,
            new_hpp: newHpp,
            reason: `Purchase ${invoiceNumber}`,
            created_at: new Date().toISOString()
          });

          mockStockLedger.unshift({
            id: mockStockLedger.length + 1,
            product_id: item.product_id,
            product_name: mockProducts[prodIdx].name,
            type: 'IN',
            quantity: item.quantity,
            reference: `Purchase ${invoiceNumber}`,
            created_at: new Date().toISOString()
          });

          mockPurchaseItems.push({
            id: mockPurchaseItems.length + 1,
            purchase_id: purchaseId,
            product_id: item.product_id,
            quantity: item.quantity,
            buy_price: item.buy_price,
            subtotal: item.quantity * item.buy_price
          });
        }
      });
      return { success: true, invoiceNumber };
    }

    try {
      await db.beginTransaction();
      const purcRes = await db.run('INSERT INTO purchases (invoice_number, total_amount) VALUES (?, ?)', [invoiceNumber, totalAmount]);
      const purchaseId = (purcRes.changes && purcRes.changes.lastId !== undefined) ? purcRes.changes.lastId : (purcRes.lastId || Date.now());

      for (const item of items) {
        const subtotal = item.buy_price * item.quantity;
        await db.run('INSERT INTO purchase_items (purchase_id, product_id, quantity, buy_price, subtotal) VALUES (?, ?, ?, ?, ?)', [purchaseId, item.product_id, item.quantity, item.buy_price, subtotal]);
        
        // Moving Average HPP Calculation
        const prodRes = await db.query('SELECT stock, cost_price FROM products WHERE id = ?', [item.product_id]);
        if (prodRes.values && prodRes.values.length > 0) {
          const oldStock = prodRes.values[0].stock;
          const oldHpp = prodRes.values[0].cost_price || 0;
          
          const totalOldValue = oldStock * oldHpp;
          const totalNewValue = item.quantity * item.buy_price;
          const totalQty = oldStock + item.quantity;
          
          const newHpp = totalQty > 0 ? (totalOldValue + totalNewValue) / totalQty : 0;
          
          // Update Product
          await db.run('UPDATE products SET stock = ?, cost_price = ? WHERE id = ?', [totalQty, newHpp, item.product_id]);
          
          // Log HPP History
          await db.run('INSERT INTO hpp_history (product_id, old_hpp, new_hpp, reason) VALUES (?, ?, ?, ?)', [item.product_id, oldHpp, newHpp, `Purchase ${invoiceNumber}`]);
          
          // Log Stock Ledger
          await db.run('INSERT INTO stock_ledger (product_id, type, quantity, reference) VALUES (?, ?, ?, ?)', [item.product_id, 'IN', item.quantity, `Purchase ${invoiceNumber}`]);
        }
      }
      
      await db.commitTransaction();
      return { success: true, invoiceNumber };
    } catch (err) {
      await db.rollbackTransaction();
      console.error(err);
      return { success: false, error: err.message || JSON.stringify(err) };
    }
  },

  async getPurchaseDetails(purchaseId) {
    if (isWeb) {
      const items = mockPurchaseItems.filter(i => i.purchase_id === purchaseId);
      return items.map(i => {
        const product = mockProducts.find(p => p.id === i.product_id);
        return { ...i, product_name: product ? product.name : 'Unknown' };
      });
    }
    try {
      const query = `
        SELECT pi.*, p.name as product_name
        FROM purchase_items pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.purchase_id = ?
      `;
      const res = await db.query(query, [purchaseId]);
      return res.values || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getHppHistory(productId) {
    if (isWeb) {
      return mockHppHistory.filter(h => h.product_id === productId);
    }
    try {
      const query = `SELECT * FROM hpp_history WHERE product_id = ? ORDER BY created_at DESC`;
      const res = await db.query(query, [productId]);
      return res.values || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async submitOpname(productId, oldStock, newStock, reason) {
    const difference = newStock - oldStock;
    if (difference === 0) return { success: true };

    if (isWeb) {
      const prodIdx = mockProducts.findIndex(p => p.id === productId);
      if (prodIdx !== -1) {
        mockProducts[prodIdx].stock = newStock;
        mockStockAdjustments.unshift({
          id: mockStockAdjustments.length + 1,
          product_id: productId,
          old_stock: oldStock,
          new_stock: newStock,
          difference,
          reason,
          created_at: new Date().toISOString()
        });
        mockStockLedger.unshift({
          id: mockStockLedger.length + 1,
          product_id: productId,
          product_name: mockProducts[prodIdx].name,
          type: difference > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(difference),
          reference: `Opname: ${reason}`,
          created_at: new Date().toISOString()
        });
      }
      return { success: true };
    }

    try {
      await db.beginTransaction();
      
      // Update Stock
      await db.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
      
      // Log Adjustment
      await db.run('INSERT INTO stock_adjustments (product_id, old_stock, new_stock, difference, reason) VALUES (?, ?, ?, ?, ?)', [productId, oldStock, newStock, difference, reason]);
      
      // Log Ledger
      const type = difference > 0 ? 'IN' : 'OUT';
      await db.run('INSERT INTO stock_ledger (product_id, type, quantity, reference) VALUES (?, ?, ?, ?)', [productId, type, Math.abs(difference), `Opname: ${reason}`]);
      
      await db.commitTransaction();
      return { success: true };
    } catch (err) {
      await db.rollbackTransaction();
      console.error(err);
      return { success: false, error: err.message || JSON.stringify(err) };
    }
  },

  async exportDatabase() {
    try {
      let data = {};
      if (isWeb) {
        data = {
          categories: mockCategories,
          products: mockProducts,
          transactions: mockOrders,
          transaction_items: mockOrderItems,
          settings: mockSettings,
          stock_ledger: mockStockLedger,
          purchases: mockPurchases,
          purchase_items: mockPurchaseItems,
          hpp_history: mockHppHistory,
          stock_adjustments: mockStockAdjustments
        };
      } else {
        const tables = ['categories', 'products', 'transactions', 'transaction_items', 'settings', 'stock_ledger', 'purchases', 'purchase_items', 'hpp_history', 'stock_adjustments'];
        for (const table of tables) {
          const res = await db.query(`SELECT * FROM ${table}`);
          data[table] = res.values || [];
        }
      }
      return { success: true, data: JSON.stringify(data) };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  },

  async importDatabase(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (isWeb) {
        if (data.categories) mockCategories.splice(0, mockCategories.length, ...data.categories);
        if (data.products) mockProducts.splice(0, mockProducts.length, ...data.products);
        if (data.transactions) mockOrders.splice(0, mockOrders.length, ...data.transactions);
        if (data.transaction_items) mockOrderItems.splice(0, mockOrderItems.length, ...data.transaction_items);
        if (data.settings) mockSettings = data.settings;
        if (data.stock_ledger) mockStockLedger.splice(0, mockStockLedger.length, ...data.stock_ledger);
        if (data.purchases) mockPurchases.splice(0, mockPurchases.length, ...data.purchases);
        if (data.purchase_items) mockPurchaseItems.splice(0, mockPurchaseItems.length, ...data.purchase_items);
        if (data.hpp_history) mockHppHistory.splice(0, mockHppHistory.length, ...data.hpp_history);
        if (data.stock_adjustments) mockStockAdjustments.splice(0, mockStockAdjustments.length, ...data.stock_adjustments);
        return { success: true };
      }

      await db.beginTransaction();
      const tables = ['categories', 'products', 'transactions', 'transaction_items', 'settings', 'stock_ledger', 'purchases', 'purchase_items', 'hpp_history', 'stock_adjustments'];
      
      // Clear existing tables
      for (const table of tables) {
        await db.run(`DELETE FROM ${table}`);
        // Optional: Reset auto-increment
        try {
          await db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
        } catch (e) { /* ignore sequence errors if table has no autoincrement */ }
      }

      // Insert new data
      for (const table of tables) {
        if (data[table] && data[table].length > 0) {
          const columns = Object.keys(data[table][0]);
          const placeholders = columns.map(() => '?').join(',');
          for (const row of data[table]) {
            const values = columns.map(col => row[col]);
            await db.run(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`, values);
          }
        }
      }

      await db.commitTransaction();
      return { success: true };
    } catch (err) {
      if (!isWeb) await db.rollbackTransaction().catch(() => {});
      console.error(err);
      return { success: false, error: err.message };
    }
  }
};
