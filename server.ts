import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { estimateCustomFurnitureWithAI, askWoodDoctorAI, describeFurnitureImageWithAI } from './server/gemini.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API HEALTH
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // USERS & CURRENT PROFILE
  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // PRODUCTS
  app.get('/api/products', (req, res) => {
    res.json(db.getProducts());
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    try {
      const newProduct = db.addProduct(req.body);
      res.status(201).json(newProduct);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  });

  // ORDERS
  app.get('/api/orders', (req, res) => {
    res.json(db.getOrders());
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    try {
      const order = db.createOrder(req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status, description, updatedBy, photoMilestoneUrl } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status, description, updatedBy, photoMilestoneUrl);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  });

  app.patch('/api/orders/:id/assign', (req, res) => {
    const { carpenterId } = req.body;
    const updated = db.assignCarpenterToOrder(req.params.id, carpenterId);
    if (!updated) return res.status(404).json({ error: 'Order or Carpenter not found' });
    res.json(updated);
  });

  // CUSTOM FURNITURE QUOTES
  app.get('/api/quotes', (req, res) => {
    res.json(db.getQuotes());
  });

  app.get('/api/quotes/:id', (req, res) => {
    const quote = db.getQuoteById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  });

  app.post('/api/quotes/request', (req, res) => {
    try {
      const quote = db.createCustomFurnitureRequest(req.body);
      res.status(201).json(quote);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/quotes/:id/submit-quote', (req, res) => {
    const updated = db.submitAdminQuotation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Quote request not found' });
    res.json(updated);
  });

  app.post('/api/quotes/:id/respond', (req, res) => {
    const { action, notes } = req.body;
    const updated = db.respondToQuotation(req.params.id, action, notes);
    if (!updated) return res.status(404).json({ error: 'Quote request not found' });
    res.json(updated);
  });

  // SERVICES & BOOKINGS
  app.get(['/api/bookings', '/api/service-bookings'], (req, res) => {
    res.json(db.getBookings());
  });

  app.post(['/api/bookings', '/api/service-bookings'], (req, res) => {
    try {
      const booking = db.createBooking(req.body);
      res.status(201).json(booking);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch(['/api/bookings/:id/assign', '/api/service-bookings/:id/assign'], (req, res) => {
    const { carpenterId } = req.body;
    const updated = db.assignCarpenterToBooking(req.params.id, carpenterId);
    if (!updated) return res.status(404).json({ error: 'Booking or Carpenter not found' });
    res.json(updated);
  });

  app.patch(['/api/bookings/:id/status', '/api/service-bookings/:id/status'], (req, res) => {
    const { status, workerNotes, finalCost } = req.body;
    const updated = db.updateBookingStatus(req.params.id, status, workerNotes, finalCost);
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json(updated);
  });

  // CARPENTERS & WORKERS
  app.get('/api/carpenters', (req, res) => {
    res.json(db.getCarpenters());
  });

  app.post('/api/carpenters', (req, res) => {
    const carp = db.addCarpenter(req.body);
    res.status(201).json(carp);
  });

  app.put('/api/carpenters/:id', (req, res) => {
    const updated = db.updateCarpenter(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Carpenter not found' });
    res.json(updated);
  });

  // INVENTORY
  app.get('/api/inventory', (req, res) => {
    res.json(db.getInventory());
  });

  app.post('/api/inventory', (req, res) => {
    const item = db.addInventoryItem(req.body);
    res.status(201).json(item);
  });

  app.patch('/api/inventory/:id/stock', (req, res) => {
    const { currentStock } = req.body;
    const updated = db.updateInventoryStock(req.params.id, Number(currentStock));
    if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(updated);
  });

  // NOTIFICATIONS
  app.get('/api/notifications', (req, res) => {
    const { userId, role } = req.query;
    res.json(db.getNotifications(userId as string, role as string));
  });

  app.patch('/api/notifications/:id/read', (req, res) => {
    const notif = db.markNotificationAsRead(req.params.id);
    res.json(notif || { success: true });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    const { userId } = req.body;
    db.markAllNotificationsAsRead(userId);
    res.json({ success: true });
  });

  // EMAILS OUTBOX
  app.get('/api/emails', (req, res) => {
    res.json(db.getEmails());
  });

  // COUPONS
  app.get('/api/coupons', (req, res) => {
    res.json(db.getCoupons());
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    const result = db.validateCoupon(code, Number(subtotal));
    res.json(result);
  });

  // ANALYTICS
  app.get('/api/analytics', (req, res) => {
    res.json(db.getAnalyticsSummary());
  });

  // GEMINI AI ENDPOINTS
  app.post('/api/ai/estimate-custom-quote', async (req, res) => {
    try {
      const estimation = await estimateCustomFurnitureWithAI(req.body);
      res.json(estimation);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/wood-doctor-chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const response = await askWoodDoctorAI(message, history || []);
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/describe-furniture-image', async (req, res) => {
    try {
      const { image, woodType, category, title } = req.body;
      const response = await describeFurnitureImageWithAI({ image, woodType, category, title });
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WoodCraft Carpentry Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
