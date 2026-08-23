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
  QuoteStatus,
  ServiceBookingStatus,
} from '../src/types';
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
} from '../src/data/mockData';

class DatabaseStore {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private quotes: CustomFurnitureRequest[] = [...INITIAL_CUSTOM_REQUESTS];
  private bookings: ServiceBooking[] = [...INITIAL_SERVICE_BOOKINGS];
  private carpenters: CarpenterWorker[] = [...INITIAL_CARPENTERS];
  private inventory: InventoryItem[] = [...INITIAL_INVENTORY];
  private users: User[] = [...INITIAL_USERS];
  private coupons: Coupon[] = [...INITIAL_COUPONS];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  private emails: EmailLog[] = [...INITIAL_EMAILS];

  // Helper to trigger automated email and in-app notifications
  private triggerAutomatedEmail(
    to: string,
    toName: string,
    subject: string,
    type: EmailLog['type'],
    htmlContent: string,
    referenceId?: string
  ) {
    const email: EmailLog = {
      id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      toName,
      subject,
      type,
      htmlContent,
      sentAt: new Date().toLocaleString(),
      status: 'delivered',
      referenceId,
    };
    this.emails.unshift(email);
    return email;
  }

  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...notification,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  // USERS & AUTH
  getUsers() {
    return this.users;
  }

  getUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  // PRODUCTS
  getProducts() {
    return this.products;
  }

  getProductById(id: string) {
    return this.products.find((p) => p.id === id);
  }

  addProduct(productData: Omit<Product, 'id'>) {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...updates };
    return this.products[idx];
  }

  deleteProduct(id: string) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }

  // ORDERS
  getOrders() {
    return this.orders;
  }

  getOrderById(id: string) {
    return this.orders.find((o) => o.id === id);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>) {
    const orderNumber = `WC-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      orderStatus: 'Order Placed',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toLocaleString(),
          description: `Order successfully placed via ${orderData.paymentMethod.toUpperCase()} (${orderData.paymentStatus}).`,
        },
      ],
    };

    // Deduct stock for standard products
    orderData.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockCount = Math.max(0, prod.stockCount - item.quantity);
        if (prod.stockCount === 0) prod.inStock = false;
      }
    });

    this.orders.unshift(newOrder);

    // Send customer notification and automated email
    this.addNotification({
      userId: newOrder.customerId,
      type: 'order',
      title: `Order Placed: ${orderNumber}`,
      message: `Your order for $${newOrder.grandTotal.toFixed(2)} has been placed and is awaiting craftsman assignment.`,
      linkAction: 'view_order',
      actionPayload: { orderId: newOrder.id },
    });

    this.addNotification({
      userId: 'admin',
      type: 'order',
      title: `New Order Received: ${orderNumber}`,
      message: `${newOrder.customerName} placed order #${orderNumber} ($${newOrder.grandTotal.toFixed(2)}).`,
      linkAction: 'admin_orders',
      actionPayload: { orderId: newOrder.id },
    });

    this.triggerAutomatedEmail(
      newOrder.customerEmail,
      newOrder.customerName,
      `Order Confirmation - WoodCraft Carpentry #${orderNumber}`,
      'order_confirmation',
      `<h2>Thank you for your order, ${newOrder.customerName}!</h2>
       <p>We have received your order <strong>#${orderNumber}</strong> for <strong>$${newOrder.grandTotal.toFixed(2)}</strong>.</p>
       <p>Shipping to: ${newOrder.shippingAddress.street}, ${newOrder.shippingAddress.city}, ${newOrder.shippingAddress.state} ${newOrder.shippingAddress.postalCode}</p>
       <p>Preferred Delivery Date: ${newOrder.preferredDeliveryDate}</p>
       <p>Our workshop team is now preparing the timber and hardware.</p>`,
      newOrder.id
    );

    return newOrder;
  }

  updateOrderStatus(
    id: string,
    status: OrderStatus,
    description: string,
    updatedBy?: string,
    photoMilestoneUrl?: string
  ) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = status;
    order.timeline.push({
      status,
      timestamp: new Date().toLocaleString(),
      description,
      updatedBy,
      photoMilestoneUrl,
    });

    // Notify customer
    this.addNotification({
      userId: order.customerId,
      type: 'order',
      title: `Order Status: ${status}`,
      message: `Your order #${order.orderNumber} is now '${status}'. ${description}`,
      linkAction: 'view_order',
      actionPayload: { orderId: order.id },
    });

    this.triggerAutomatedEmail(
      order.customerEmail,
      order.customerName,
      `Order Milestone Update: ${status} - #${order.orderNumber}`,
      'status_update',
      `<h2>Order Milestone: ${status}</h2>
       <p>Dear ${order.customerName},</p>
       <p>Your WoodCraft Carpentry order <strong>#${order.orderNumber}</strong> has reached a new milestone:</p>
       <div style="padding: 12px; background: #fdfbf7; border-left: 4px solid #b45309; margin: 15px 0;">
         <strong>${status}</strong>: ${description}
       </div>
       ${photoMilestoneUrl ? `<p><img src="${photoMilestoneUrl}" style="max-width: 400px; border-radius: 8px;" alt="Milestone" /></p>` : ''}
       <p>Thank you for choosing WoodCraft Carpentry!</p>`,
      order.id
    );

    return order;
  }

  assignCarpenterToOrder(orderId: string, carpenterId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    const carpenter = this.carpenters.find((c) => c.id === carpenterId);
    if (!order || !carpenter) return null;

    order.assignedCarpenterId = carpenter.id;
    order.assignedCarpenterName = carpenter.name;

    if (!carpenter.assignedOrders.includes(orderId)) {
      carpenter.assignedOrders.push(orderId);
      carpenter.activeJobsCount += 1;
    }

    this.addNotification({
      userId: carpenter.id,
      type: 'order',
      title: `New Job Assigned: #${order.orderNumber}`,
      message: `You have been assigned to construct order #${order.orderNumber} for ${order.customerName}.`,
      linkAction: 'carpenter_jobs',
    });

    return order;
  }

  // CUSTOM FURNITURE & QUOTES
  getQuotes() {
    return this.quotes;
  }

  getQuoteById(id: string) {
    return this.quotes.find((q) => q.id === id);
  }

  createCustomFurnitureRequest(
    data: Omit<CustomFurnitureRequest, 'id' | 'quoteNumber' | 'createdAt' | 'status'>
  ) {
    const quoteNumber = `WC-QT-${Math.floor(4000 + Math.random() * 5000)}`;
    const newQuoteReq: CustomFurnitureRequest = {
      ...data,
      id: `quote-req-${Date.now()}`,
      quoteNumber,
      createdAt: new Date().toISOString(),
      status: 'pending_review',
    };

    this.quotes.unshift(newQuoteReq);

    // Notifications
    this.addNotification({
      userId: 'admin',
      type: 'quote',
      title: `New Custom Furniture Request: ${quoteNumber}`,
      message: `${data.customerName} requested a quote for custom ${data.furnitureType} in ${data.woodType}.`,
      linkAction: 'admin_quotes',
      actionPayload: { quoteId: newQuoteReq.id },
    });

    this.addNotification({
      userId: data.customerId,
      type: 'quote',
      title: `Custom Quote Request Received: ${quoteNumber}`,
      message: `Our master craftsmen are reviewing your specifications for ${data.furnitureType}. We will provide an itemized quote shortly.`,
      linkAction: 'view_quote',
      actionPayload: { quoteId: newQuoteReq.id },
    });

    this.triggerAutomatedEmail(
      data.customerEmail,
      data.customerName,
      `Quotation Request Received - #${quoteNumber}`,
      'quotation_ready',
      `<h2>Custom Furniture Quotation Request Received</h2>
       <p>Dear ${data.customerName},</p>
       <p>Thank you for submitting your custom ${data.furnitureType} design requirement (<strong>#${quoteNumber}</strong>).</p>
       <p>Dimensions: ${data.dimensions.length}" x ${data.dimensions.width}" x ${data.dimensions.height}" ${data.dimensions.unit}</p>
       <p>Selected Wood: <strong>${data.woodType}</strong> (${data.finishType})</p>
       <p>Our master joiner will generate a detailed bill of materials and formal estimate within 24 hours.</p>`,
      newQuoteReq.id
    );

    return newQuoteReq;
  }

  submitAdminQuotation(
    quoteId: string,
    quotationData: NonNullable<CustomFurnitureRequest['quotation']>
  ) {
    const quote = this.quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    quote.quotation = quotationData;
    quote.status = 'quoted';

    // Notify customer
    this.addNotification({
      userId: quote.customerId,
      type: 'quote',
      title: `Quotation Prepared: ${quote.quoteNumber}`,
      message: `Quotation for ${quote.furnitureType} ($${quotationData.grandTotal.toFixed(2)}) is ready for your review and approval.`,
      linkAction: 'view_quote',
      actionPayload: { quoteId: quote.id },
    });

    this.triggerAutomatedEmail(
      quote.customerEmail,
      quote.customerName,
      `Your Custom Furniture Quotation is Ready - #${quote.quoteNumber}`,
      'quotation_ready',
      `<h2>Your Custom Furniture Quotation is Ready!</h2>
       <p>Dear ${quote.customerName},</p>
       <p>Master Craftsman Arthur Vance has calculated the custom bill of materials for your <strong>${quote.furnitureType}</strong>.</p>
       <div style="background: #fdfbf7; border: 1px solid #d4c5b9; padding: 15px; border-radius: 8px; margin: 15px 0;">
         <p><strong>Material Cost:</strong> $${quotationData.materialCost.toFixed(2)}</p>
         <p><strong>Master Labor & Joinery:</strong> $${quotationData.laborCost.toFixed(2)}</p>
         <p><strong>Finishing (${quote.finishType}):</strong> $${quotationData.finishCost.toFixed(2)}</p>
         <p><strong>Delivery & Installation:</strong> $${quotationData.deliveryCost.toFixed(2)}</p>
         <hr style="border: 0; border-top: 1px solid #d4c5b9;" />
         <h3 style="color: #92400e;">Total Quoted Price: $${quotationData.grandTotal.toFixed(2)}</h3>
       </div>
       <p>Log in to your WoodCraft account to approve and initiate production.</p>`,
      quote.id
    );

    return quote;
  }

  respondToQuotation(quoteId: string, action: 'accepted' | 'rejected', notes?: string) {
    const quote = this.quotes.find((q) => q.id === quoteId);
    if (!quote || !quote.quotation) return null;

    quote.status = action;

    if (action === 'accepted') {
      // Create a production order automatically
      const newOrder = this.createOrder({
        customerId: quote.customerId,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        items: [
          {
            productId: `custom-${quote.id}`,
            name: `Custom ${quote.furnitureType} (${quote.woodType})`,
            image:
              quote.referenceImageUrl ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
            price: quote.quotation.grandTotal,
            quantity: 1,
            selectedFinish: String(quote.finishType),
            selectedDimensions: `${quote.dimensions.length}"L x ${quote.dimensions.width}"W x ${quote.dimensions.height}"H`,
            isCustom: true,
          },
        ],
        subtotal: quote.quotation.subtotal,
        customizationCharges: quote.quotation.customizationFee,
        deliveryCharges: quote.quotation.deliveryCost,
        taxAmount: quote.quotation.taxAmount,
        discountAmount: quote.quotation.discountAmount,
        grandTotal: quote.quotation.grandTotal,
        shippingAddress: {
          fullName: quote.customerName,
          phone: quote.customerPhone,
          street: 'Registered Customer Address',
          city: 'City',
          state: 'State',
          postalCode: '10001',
        },
        preferredDeliveryDate: quote.preferredDeliveryDate,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'Confirmed',
      });

      this.addNotification({
        userId: 'admin',
        type: 'quote',
        title: `Quotation Accepted: #${quote.quoteNumber}`,
        message: `${quote.customerName} accepted the quote ($${quote.quotation.grandTotal.toFixed(2)}). Production Order #${newOrder.orderNumber} automatically created.`,
        linkAction: 'admin_orders',
      });

      this.triggerAutomatedEmail(
        quote.customerEmail,
        quote.customerName,
        `Quotation Accepted - Production Order Created #${newOrder.orderNumber}`,
        'quote_accepted',
        `<h2>Quotation Accepted & Order Created!</h2>
         <p>Thank you for approving quotation <strong>#${quote.quoteNumber}</strong>.</p>
         <p>Production Order <strong>#${newOrder.orderNumber}</strong> has been created with priority workshop scheduling.</p>`,
        newOrder.id
      );
    } else {
      this.addNotification({
        userId: 'admin',
        type: 'quote',
        title: `Quotation Declined: #${quote.quoteNumber}`,
        message: `${quote.customerName} declined quote #${quote.quoteNumber}. Notes: ${notes || 'No reason provided'}`,
        linkAction: 'admin_quotes',
      });
    }

    return quote;
  }

  // SERVICE BOOKINGS
  getBookings() {
    return this.bookings;
  }

  getBookingById(id: string) {
    return this.bookings.find((b) => b.id === id);
  }

  createBooking(
    bookingData: Omit<ServiceBooking, 'id' | 'bookingNumber' | 'createdAt' | 'status'>
  ) {
    const bookingNumber = `WC-SRV-${Math.floor(100 + Math.random() * 900)}`;
    const newBooking: ServiceBooking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      bookingNumber,
      createdAt: new Date().toISOString(),
      status: 'booked',
    };

    this.bookings.unshift(newBooking);

    this.addNotification({
      userId: 'admin',
      type: 'service',
      title: `New Service Booking: ${bookingNumber}`,
      message: `${bookingData.customerName} booked '${bookingData.serviceName}' for ${bookingData.preferredDate} (${bookingData.preferredTimeSlot}).`,
      linkAction: 'admin_services',
    });

    this.addNotification({
      userId: bookingData.customerId,
      type: 'service',
      title: `Service Booked: ${bookingNumber}`,
      message: `Your booking for ${bookingData.serviceName} on ${bookingData.preferredDate} is confirmed. A carpenter will be assigned shortly.`,
      linkAction: 'view_service',
    });

    this.triggerAutomatedEmail(
      bookingData.customerEmail,
      bookingData.customerName,
      `Carpenter Service Booked - #${bookingNumber}`,
      'service_dispatch',
      `<h2>Carpenter Service Booking Confirmed</h2>
       <p>Dear ${bookingData.customerName},</p>
       <p>We have scheduled your <strong>${bookingData.serviceName}</strong> appointment (<strong>#${bookingNumber}</strong>).</p>
       <p><strong>Date & Time:</strong> ${bookingData.preferredDate} at ${bookingData.preferredTimeSlot}</p>
       <p><strong>Service Location:</strong> ${bookingData.address.street}, ${bookingData.address.city}</p>
       <p>Estimated Cost: $${bookingData.estimatedCost.toFixed(2)}</p>`,
      newBooking.id
    );

    return newBooking;
  }

  assignCarpenterToBooking(bookingId: string, carpenterId: string) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    const carpenter = this.carpenters.find((c) => c.id === carpenterId);
    if (!booking || !carpenter) return null;

    booking.assignedWorkerId = carpenter.id;
    booking.assignedWorkerName = carpenter.name;
    booking.status = 'assigned';

    if (!carpenter.assignedBookings.includes(bookingId)) {
      carpenter.assignedBookings.push(bookingId);
      carpenter.activeJobsCount += 1;
    }

    this.addNotification({
      userId: carpenter.id,
      type: 'service',
      title: `On-Site Service Job Assigned`,
      message: `You have been dispatched for ${booking.serviceName} at ${booking.address.street} (${booking.preferredDate}).`,
      linkAction: 'carpenter_jobs',
    });

    this.addNotification({
      userId: booking.customerId,
      type: 'service',
      title: `Carpenter Assigned: ${carpenter.name}`,
      message: `Master Carpenter ${carpenter.name} (${carpenter.phone}) has been assigned to your service request for ${booking.preferredDate}.`,
      linkAction: 'view_service',
    });

    this.triggerAutomatedEmail(
      booking.customerEmail,
      booking.customerName,
      `Carpenter Dispatched: ${carpenter.name} - #${booking.bookingNumber}`,
      'service_dispatch',
      `<h2>Carpenter Assigned to Your Booking</h2>
       <p>Dear ${booking.customerName},</p>
       <p>Carpenter <strong>${carpenter.name}</strong> (${carpenter.experienceYears} yrs experience, Rating: ${carpenter.rating}★) has been assigned to your <strong>${booking.serviceName}</strong>.</p>
       <p>Contact Carpenter: ${carpenter.phone}</p>
       <p>Scheduled: ${booking.preferredDate} (${booking.preferredTimeSlot})</p>`,
      booking.id
    );

    return booking;
  }

  updateBookingStatus(
    bookingId: string,
    status: ServiceBookingStatus,
    workerNotes?: string,
    finalCost?: number
  ) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    booking.status = status;
    if (workerNotes) booking.workerNotes = workerNotes;
    if (finalCost !== undefined) booking.finalCost = finalCost;

    if (status === 'completed' && booking.assignedWorkerId) {
      const carp = this.carpenters.find((c) => c.id === booking.assignedWorkerId);
      if (carp) {
        carp.completedJobs += 1;
        carp.activeJobsCount = Math.max(0, carp.activeJobsCount - 1);
      }
    }

    this.addNotification({
      userId: booking.customerId,
      type: 'service',
      title: `Service Booking Status: ${status}`,
      message: `Your booking #${booking.bookingNumber} is marked as '${status}'.`,
      linkAction: 'view_service',
    });

    return booking;
  }

  // CARPENTERS & WORKERS
  getCarpenters() {
    return this.carpenters;
  }

  getCarpenterById(id: string) {
    return this.carpenters.find((c) => c.id === id);
  }

  addCarpenter(carpenterData: Omit<CarpenterWorker, 'id' | 'completedJobs' | 'activeJobsCount' | 'assignedOrders' | 'assignedBookings'>) {
    const newCarp: CarpenterWorker = {
      ...carpenterData,
      id: `carp-${Date.now()}`,
      completedJobs: 0,
      activeJobsCount: 0,
      assignedOrders: [],
      assignedBookings: [],
    };
    this.carpenters.unshift(newCarp);
    return newCarp;
  }

  updateCarpenter(id: string, updates: Partial<CarpenterWorker>) {
    const idx = this.carpenters.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.carpenters[idx] = { ...this.carpenters[idx], ...updates };
    return this.carpenters[idx];
  }

  // INVENTORY
  getInventory() {
    return this.inventory;
  }

  updateInventoryStock(id: string, newStock: number) {
    const item = this.inventory.find((i) => i.id === id);
    if (!item) return null;

    item.currentStock = newStock;
    if (item.currentStock <= 0) {
      item.status = 'out_of_stock';
    } else if (item.currentStock <= item.minThreshold) {
      item.status = 'low_stock';
    } else {
      item.status = 'in_stock';
    }

    if (item.status === 'low_stock' || item.status === 'out_of_stock') {
      this.addNotification({
        userId: 'admin',
        type: 'inventory',
        title: `Inventory Warning: ${item.name}`,
        message: `${item.name} (${item.sku}) is currently ${item.status.replace('_', ' ')} (${item.currentStock} ${item.unit} remaining).`,
        linkAction: 'admin_inventory',
      });
    }

    return item;
  }

  addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'status' | 'lastRestocked'>) {
    const status: InventoryItem['status'] =
      itemData.currentStock <= 0
        ? 'out_of_stock'
        : itemData.currentStock <= itemData.minThreshold
        ? 'low_stock'
        : 'in_stock';

    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    this.inventory.unshift(newItem);
    return newItem;
  }

  // NOTIFICATIONS
  getNotifications(userId?: string, role?: string) {
    if (!userId && !role) return this.notifications;
    return this.notifications.filter((n) => {
      if (role === 'admin' && (n.userId === 'admin' || n.userId === 'all')) return true;
      if (role === 'carpenter' && (n.userId.startsWith('carp-') || n.userId === 'carpenter')) return true;
      return n.userId === userId || n.userId === 'all';
    });
  }

  markNotificationAsRead(id: string) {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) n.read = true;
    return n;
  }

  markAllNotificationsAsRead(userId?: string) {
    this.notifications.forEach((n) => {
      if (!userId || n.userId === userId || n.userId === 'admin') {
        n.read = true;
      }
    });
    return true;
  }

  // EMAILS
  getEmails() {
    return this.emails;
  }

  // COUPONS
  getCoupons() {
    return this.coupons;
  }

  validateCoupon(code: string, orderSubtotal: number) {
    const coupon = this.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active
    );
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired promo code.' };
    }
    if (orderSubtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order of $${coupon.minOrderAmount} required for coupon ${coupon.code}.`,
      };
    }
    const discount = coupon.discountPercent
      ? (orderSubtotal * coupon.discountPercent) / 100
      : coupon.discountFlat || 0;

    return {
      valid: true,
      coupon,
      discount: Math.min(discount, orderSubtotal),
      message: `Coupon ${coupon.code} applied successfully!`,
    };
  }

  // ANALYTICS & STATS
  getAnalyticsSummary() {
    const totalSales = this.orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.grandTotal : 0), 0);
    const pendingOrdersCount = this.orders.filter((o) => o.orderStatus !== 'Delivered').length;
    const completedOrdersCount = this.orders.filter((o) => o.orderStatus === 'Delivered').length;
    const pendingQuotesCount = this.quotes.filter((q) => q.status === 'pending_review').length;
    const totalBookingsCount = this.bookings.length;
    const lowStockItemsCount = this.inventory.filter((i) => i.status !== 'in_stock').length;
    const customerCount = this.users.filter((u) => u.role === 'customer').length;

    // Category breakdown
    const categorySales: Record<string, { count: number; revenue: number }> = {};
    this.orders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = this.products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'Custom Furniture';
        if (!categorySales[cat]) {
          categorySales[cat] = { count: 0, revenue: 0 };
        }
        categorySales[cat].count += item.quantity;
        categorySales[cat].revenue += item.price * item.quantity;
      });
    });

    // Monthly revenue simulation
    const monthlyRevenue = [
      { month: 'Apr 2026', revenue: 14200, orders: 12 },
      { month: 'May 2026', revenue: 18500, orders: 16 },
      { month: 'Jun 2026', revenue: 22100, orders: 19 },
      { month: 'Jul 2026', revenue: 27800, orders: 24 },
      { month: 'Aug 2026', revenue: totalSales + 19400, orders: this.orders.length + 15 },
    ];

    return {
      totalSales,
      pendingOrdersCount,
      completedOrdersCount,
      pendingQuotesCount,
      totalBookingsCount,
      lowStockItemsCount,
      customerCount,
      categorySales,
      monthlyRevenue,
    };
  }
}

export const db = new DatabaseStore();
