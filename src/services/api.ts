import {
  Product,
  Order,
  CustomFurnitureRequest,
  ServiceBooking,
  CarpenterWorker,
  InventoryItem,
  User,
  Coupon,
  Notification,
  EmailLog,
  OrderStatus,
  ServiceBookingStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS,
  INITIAL_SERVICE_BOOKINGS,
  INITIAL_CARPENTERS,
  INITIAL_INVENTORY,
  INITIAL_USERS,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EMAILS,
} from '../data/mockData';
import { firestoreService } from './firebase';

// API Client with automatic fallback to local state if offline and background Firestore replication
export const api = {
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_USERS;
  },

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_PRODUCTS;
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    let createdProduct: Product;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        createdProduct = await res.json();
      } else {
        createdProduct = { ...product, id: `prod-${Date.now()}` };
      }
    } catch {
      createdProduct = { ...product, id: `prod-${Date.now()}` };
    }
    firestoreService.saveProduct(createdProduct).catch(() => {});
    return createdProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    let updatedProduct: Product;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        updatedProduct = await res.json();
      } else {
        const existing = INITIAL_PRODUCTS.find((p) => p.id === id) || ({} as Product);
        updatedProduct = { ...existing, ...updates, id } as Product;
      }
    } catch {
      const existing = INITIAL_PRODUCTS.find((p) => p.id === id) || ({} as Product);
      updatedProduct = { ...existing, ...updates, id } as Product;
    }
    firestoreService.saveProduct(updatedProduct).catch(() => {});
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      firestoreService.deleteProduct(id).catch(() => {});
      if (res.ok) return true;
    } catch {}
    firestoreService.deleteProduct(id).catch(() => {});
    return true;
  },

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_ORDERS;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>): Promise<Order> {
    let order: Order;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        order = await res.json();
      } else {
        const orderNumber = `WC-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        order = {
          ...orderData,
          id: `ord-${Date.now()}`,
          orderNumber,
          createdAt: new Date().toISOString(),
          orderStatus: 'Order Placed',
          timeline: [
            {
              status: 'Order Placed',
              timestamp: new Date().toLocaleString(),
              description: `Order placed via ${orderData.paymentMethod.toUpperCase()}`,
            },
          ],
        };
      }
    } catch {
      const orderNumber = `WC-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      order = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber,
        createdAt: new Date().toISOString(),
        orderStatus: 'Order Placed',
        timeline: [
          {
            status: 'Order Placed',
            timestamp: new Date().toLocaleString(),
            description: `Order placed via ${orderData.paymentMethod.toUpperCase()}`,
          },
        ],
      };
    }
    firestoreService.saveOrder(order).catch(() => {});
    return order;
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    description: string,
    updatedBy?: string,
    photoMilestoneUrl?: string
  ): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, description, updatedBy, photoMilestoneUrl }),
      });
      if (res.ok) {
        const updated = await res.json();
        firestoreService.saveOrder(updated).catch(() => {});
        return updated;
      }
    } catch {}
    return null;
  },

  async assignCarpenterToOrder(orderId: string, carpenterId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carpenterId }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getQuotes(): Promise<CustomFurnitureRequest[]> {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_CUSTOM_REQUESTS;
  },

  async requestCustomFurniture(
    data: Omit<CustomFurnitureRequest, 'id' | 'quoteNumber' | 'createdAt' | 'status'>
  ): Promise<CustomFurnitureRequest> {
    let quote: CustomFurnitureRequest;
    try {
      const res = await fetch('/api/quotes/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        quote = await res.json();
      } else {
        quote = {
          ...data,
          id: `quote-req-${Date.now()}`,
          quoteNumber: `WC-QT-${Math.floor(4000 + Math.random() * 5000)}`,
          createdAt: new Date().toISOString(),
          status: 'pending_review',
        };
      }
    } catch {
      quote = {
        ...data,
        id: `quote-req-${Date.now()}`,
        quoteNumber: `WC-QT-${Math.floor(4000 + Math.random() * 5000)}`,
        createdAt: new Date().toISOString(),
        status: 'pending_review',
      };
    }
    firestoreService.saveQuote(quote).catch(() => {});
    return quote;
  },

  async submitAdminQuotation(
    quoteId: string,
    quotation: NonNullable<CustomFurnitureRequest['quotation']>
  ): Promise<CustomFurnitureRequest | null> {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/submit-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation),
      });
      if (res.ok) {
        const updated = await res.json();
        firestoreService.saveQuote(updated).catch(() => {});
        return updated;
      }
    } catch {}
    return null;
  },

  async respondToQuotation(
    quoteId: string,
    action: 'accepted' | 'rejected',
    notes?: string
  ): Promise<CustomFurnitureRequest | null> {
    try {
      const res = await fetch(`/api/quotes/${quoteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        const updated = await res.json();
        firestoreService.saveQuote(updated).catch(() => {});
        return updated;
      }
    } catch {}
    return null;
  },

  async getBookings(): Promise<ServiceBooking[]> {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_SERVICE_BOOKINGS;
  },

  async createBooking(
    data: Omit<ServiceBooking, 'id' | 'bookingNumber' | 'createdAt' | 'status'>
  ): Promise<ServiceBooking> {
    let booking: ServiceBooking;
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        booking = await res.json();
      } else {
        booking = {
          ...data,
          id: `bk-${Date.now()}`,
          bookingNumber: `WC-SRV-${Math.floor(100 + Math.random() * 900)}`,
          createdAt: new Date().toISOString(),
          status: 'booked',
        };
      }
    } catch {
      booking = {
        ...data,
        id: `bk-${Date.now()}`,
        bookingNumber: `WC-SRV-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        status: 'booked',
      };
    }
    firestoreService.saveBooking(booking).catch(() => {});
    return booking;
  },

  async assignCarpenterToBooking(bookingId: string, carpenterId: string): Promise<ServiceBooking | null> {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carpenterId }),
      });
      if (res.ok) {
        const updated = await res.json();
        firestoreService.saveBooking(updated).catch(() => {});
        return updated;
      }
    } catch {}
    return null;
  },

  async updateBookingStatus(
    bookingId: string,
    status: ServiceBookingStatus,
    workerNotes?: string,
    finalCost?: number
  ): Promise<ServiceBooking | null> {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, workerNotes, finalCost }),
      });
      if (res.ok) {
        const updated = await res.json();
        firestoreService.saveBooking(updated).catch(() => {});
        return updated;
      }
    } catch {}
    return null;
  },

  async getCarpenters(): Promise<CarpenterWorker[]> {
    try {
      const res = await fetch('/api/carpenters');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_CARPENTERS;
  },

  async getInventory(): Promise<InventoryItem[]> {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_INVENTORY;
  },

  async updateInventoryStock(id: string, currentStock: number): Promise<InventoryItem | null> {
    try {
      const res = await fetch(`/api/inventory/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStock }),
      });
      if (res.ok) {
        const updated = await res.json();
        firestoreService.saveInventoryItem(updated).catch(() => {});
        return updated;
      }
    } catch {}
    return null;
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>): Promise<InventoryItem> {
    let newItem: InventoryItem;
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        newItem = await res.json();
      } else {
        newItem = {
          ...item,
          id: `inv-${Date.now()}`,
          status: item.currentStock <= item.minThreshold ? 'low_stock' : 'in_stock',
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      }
    } catch {
      newItem = {
        ...item,
        id: `inv-${Date.now()}`,
        status: item.currentStock <= item.minThreshold ? 'low_stock' : 'in_stock',
        lastRestocked: new Date().toISOString().split('T')[0],
      };
    }
    firestoreService.saveInventoryItem(newItem).catch(() => {});
    return newItem;
  },

  async getNotifications(userId?: string, role?: string): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (role) params.append('role', role);
      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_NOTIFICATIONS;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch {}
  },

  async markAllNotificationsAsRead(userId?: string): Promise<void> {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch {}
  },

  async getEmails(): Promise<EmailLog[]> {
    try {
      const res = await fetch('/api/emails');
      if (res.ok) return await res.json();
    } catch {}
    return INITIAL_EMAILS;
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount?: number; coupon?: Coupon; message: string }> {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const c = INITIAL_COUPONS.find((cp) => cp.code.toUpperCase() === code.toUpperCase());
    if (c && subtotal >= c.minOrderAmount) {
      const disc = c.discountPercent ? (subtotal * c.discountPercent) / 100 : c.discountFlat || 0;
      return { valid: true, discount: disc, coupon: c, message: 'Coupon applied successfully!' };
    }
    return { valid: false, message: 'Invalid coupon code.' };
  },

  async getAnalytics(): Promise<any> {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) return await res.json();
    } catch {}
    return {
      totalSales: 3557.6,
      pendingOrdersCount: 2,
      completedOrdersCount: 1,
      pendingQuotesCount: 1,
      totalBookingsCount: 2,
      lowStockItemsCount: 4,
      customerCount: 2,
    };
  },

  async estimateCustomQuoteAI(params: any): Promise<any> {
    try {
      const res = await fetch('/api/ai/estimate-custom-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      estimatedTotal: 1250,
      materialCost: 650,
      laborCost: 450,
      finishCost: 90,
      deliveryCost: 60,
      estimatedDays: 14,
      boardFeet: 42,
      joineryRecommendation: 'Mortise and tenon with concealed biscuit joints',
      durabilityNotes: 'Premium kiln-dried timber suitable for lifetime durability.',
      materialsBreakdown: [
        { item: `${params.woodType} Solid Timber`, qty: '42 board ft', cost: 580 },
        { item: 'Concealed Fasteners & Glue', qty: '1 set', cost: 70 },
        { item: `${params.finishType} Sealer`, qty: '1 L', cost: 90 },
      ],
    };
  },

  async askWoodDoctor(message: string, history: Array<{ role: string; content: string }>): Promise<{ reply: string }> {
    try {
      const res = await fetch('/api/ai/wood-doctor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      reply: 'Solid hardwood expands and contracts with humidity. Keep furniture away from heat radiators and apply beeswax polish once a year.',
    };
  },

  async describeFurnitureImage(params: {
    image?: string;
    woodType?: string;
    category?: string;
    title?: string;
  }): Promise<{
    description: string;
    shortDescription: string;
    suggestedTitle: string;
    materials: string[];
    careInstructions: string;
  }> {
    try {
      const res = await fetch('/api/ai/describe-furniture-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {}
    const wood = params.woodType || 'Solid Timber';
    return {
      description: `Handcrafted in master-selected kiln-dried solid ${wood}. Features robust blind mortise-and-tenon structural joinery, softened tactile bevels, and hand-rubbed organic protective sealer for heirloom longevity.`,
      shortDescription: `Artisan solid ${wood} handcrafted with traditional joinery and protective finish.`,
      suggestedTitle: params.title || `Artisan Solid ${wood} Collection`,
      materials: [`Kiln-Dried ${wood}`, 'Reinforced Joinery Hardware', 'Protective Non-Toxic Matte Sealer'],
      careInstructions: 'Dust regularly with a dry soft cloth. Condition with natural wood wax twice a year.',
    };
  },
};
