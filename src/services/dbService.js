import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const isWeb = Capacitor.getPlatform() === 'web';
const sqlite = new SQLiteConnection(CapacitorSQLite);
let db;

// Mock data for immediate browser testing
let mockProducts = [
  { id: 1, category_id: 1, name: 'Premium Espresso', sku: 'SKU001', price: 3.50, stock: 100 },
  { id: 2, category_id: 1, name: 'Vanilla Latte', sku: 'SKU002', price: 4.50, stock: 85 },
  { id: 3, category_id: 2, name: 'Butter Croissant', sku: 'SKU003', price: 2.75, stock: 40 },
  { id: 4, category_id: 2, name: 'Blueberry Muffin', sku: 'SKU004', price: 3.00, stock: 25 }
];

let mockOrders = [];
let mockOrderItems = [];

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
        CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, name TEXT NOT NULL, sku TEXT UNIQUE, price REAL NOT NULL, stock INTEGER NOT NULL, is_active INTEGER DEFAULT 1, FOREIGN KEY (category_id) REFERENCES categories (id));
        CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_number TEXT UNIQUE NOT NULL, total_amount REAL NOT NULL, payment_method TEXT NOT NULL, status TEXT DEFAULT 'completed', is_synced INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, price REAL NOT NULL, subtotal REAL NOT NULL, FOREIGN KEY (order_id) REFERENCES orders (id), FOREIGN KEY (product_id) REFERENCES products (id));
      `;
      await db.execute(query);
      
      const res = await db.query('SELECT count(id) as count FROM products');
      if (res.values[0].count === 0) {
        await db.execute(`
          INSERT INTO categories (name) VALUES ('Beverages'), ('Snacks');
          INSERT INTO products (category_id, name, sku, price, stock) VALUES 
          (1, 'Premium Espresso', 'SKU001', 3.50, 100), (1, 'Vanilla Latte', 'SKU002', 4.50, 85), 
          (2, 'Butter Croissant', 'SKU003', 2.75, 40), (2, 'Blueberry Muffin', 'SKU004', 3.00, 25);
        `);
      }
    } catch (err) {
      console.error('SQLite Init Error:', err);
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
          subtotal: item.price * item.quantity
        });
      });
      return { success: true, invoiceNumber };
    }

    try {
      await db.beginTransaction();
      const orderRes = await db.run('INSERT INTO orders (invoice_number, total_amount, payment_method) VALUES (?, ?, ?)', [invoiceNumber, total, paymentMethod]);
      const orderId = orderRes.changes.lastId;

      for (const item of cartItems) {
        const subtotal = item.price * item.quantity;
        await db.run('INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)', [orderId, item.id, item.quantity, item.price, subtotal]);
        await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
      }
      await db.commitTransaction();
      return { success: true, invoiceNumber };
    } catch (err) {
      await db.rollbackTransaction();
      console.error('Checkout error:', err);
      return { success: false, error: err };
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
    if (isWeb) return { success: true };
    try {
      await db.run('INSERT INTO products (category_id, name, sku, price, stock) VALUES (?, ?, ?, ?, ?)', 
        [product.category_id, product.name, product.sku, product.price, product.stock]);
      return { success: true };
    } catch (err) {
      console.error(err); return { success: false, error: err };
    }
  },
  async updateProduct(id, product) {
    if (isWeb) return { success: true };
    try {
      await db.run('UPDATE products SET category_id = ?, name = ?, sku = ?, price = ?, stock = ? WHERE id = ?', 
        [product.category_id, product.name, product.sku, product.price, product.stock, id]);
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
      return { revenue, itemsSold };
    }
    try {
      const revQuery = "SELECT SUM(total_amount) as revenue FROM orders WHERE date(created_at, 'localtime') = date('now', 'localtime')";
      const revRes = await db.query(revQuery);
      const revenue = revRes.values[0]?.revenue || 0;

      const itemsQuery = `
        SELECT SUM(oi.quantity) as itemsSold 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE date(o.created_at, 'localtime') = date('now', 'localtime')
      `;
      const itemsRes = await db.query(itemsQuery);
      const itemsSold = itemsRes.values[0]?.itemsSold || 0;

      return { revenue, itemsSold };
    } catch (err) { console.error(err); return { revenue: 0, itemsSold: 0 }; }
  }
};
