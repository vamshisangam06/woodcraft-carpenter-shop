export type UserRole = 'customer' | 'admin' | 'carpenter';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  specialty?: string; // for carpenter
}

export type ProductCategory =
  | 'Beds'
  | 'Sofas'
  | 'Dining Tables'
  | 'Chairs'
  | 'Wardrobes'
  | 'TV Units'
  | 'Kitchen Cabinets'
  | 'Office Furniture'
  | 'Doors & Windows'
  | 'Custom Furniture';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  };
  materials: string[];
  woodType?: WoodType | string;
  finishes: string[];
  description: string;
  shortDescription?: string;
  inStock: boolean;
  stockCount: number;
  images: string[];
  featured?: boolean;
  popular?: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
  estimatedDeliveryDays: number;
  careInstructions?: string;
}

export interface Review {
  id: string;
  productId?: string;
  serviceId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  images?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  shortDesc: string;
  description: string;
  startingPrice: number;
  estimatedHours: string;
  inclusions: string[];
  exclusions: string[];
  bannerImage: string;
  popular?: boolean;
}

export type WoodType =
  | 'Burma Teak'
  | 'American White Oak'
  | 'Walnut'
  | 'Indian Sheesham (Rosewood)'
  | 'Pine Wood'
  | 'Mahogany'
  | 'Birch Plywood & Veneer';

export type FinishType =
  | 'Natural Matte Oil'
  | 'Satin Polyurethane (PU)'
  | 'High Gloss PU'
  | 'Dark Walnut Stain'
  | 'Distressed Vintage'
  | 'Honey Oak Wax'
  | 'Raw Organic';

export type QuoteStatus =
  | 'pending_review'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'in_production'
  | 'completed';

export interface CustomFurnitureRequest {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  furnitureType: ProductCategory | string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  };
  woodType: WoodType | string;
  finishType: FinishType | string;
  designStyle?: string;
  referenceImageUrl?: string;
  notes: string;
  budgetRange?: string;
  preferredDeliveryDate: string;
  createdAt: string;
  status: QuoteStatus;
  
  // Admin Quotation breakdown
  quotation?: {
    id: string;
    materialCost: number;
    laborCost: number;
    finishCost: number;
    deliveryCost: number;
    customizationFee: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    grandTotal: number;
    validityDays: number;
    adminNotes: string;
    sentAt: string;
    materialsBreakdown: Array<{ item: string; qty: string; cost: number }>;
  };
}

export type ServiceBookingStatus =
  | 'booked'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceBooking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
  };
  preferredDate: string;
  preferredTimeSlot: string;
  problemDescription: string;
  photos?: string[];
  estimatedCost: number;
  finalCost?: number;
  status: ServiceBookingStatus;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  workerNotes?: string;
  createdAt: string;
  paymentStatus: 'pending' | 'paid' | 'pay_on_service';
}

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'In Production'
  | 'Quality Check'
  | 'Ready'
  | 'Shipped'
  | 'Delivered';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedFinish?: string;
  selectedDimensions?: string;
  isCustom?: boolean;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  description: string;
  updatedBy?: string;
  photoMilestoneUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  customizationCharges: number;
  deliveryCharges: number;
  taxAmount: number;
  discountAmount: number;
  couponApplied?: string;
  grandTotal: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  preferredDeliveryDate: string;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'paid' | 'pending' | 'cod_confirmed';
  paymentTransactionId?: string;
  orderStatus: OrderStatus;
  timeline: OrderTimelineEvent[];
  assignedCarpenterId?: string;
  assignedCarpenterName?: string;
  trackingNumber?: string;
  carrierName?: string;
  createdAt: string;
  notes?: string;
}

export interface CarpenterWorker {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialties: string[];
  experienceYears: number;
  rating: number;
  completedJobs: number;
  activeJobsCount: number;
  status: 'available' | 'on_site' | 'in_workshop' | 'on_leave';
  assignedOrders: string[]; // order IDs
  assignedBookings: string[]; // booking IDs
}

export type InventoryCategory =
  | 'Solid Wood'
  | 'Engineered Wood'
  | 'Hardware'
  | 'Finishing & Polish'
  | 'Fasteners & Adhesives';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  currentStock: number;
  unit: 'board ft' | 'sheets' | 'sq.ft' | 'pcs' | 'liters' | 'kg';
  minThreshold: number;
  unitCost: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Notification {
  id: string;
  userId: string; // or 'admin' or 'carpenter' or specific user
  type: 'order' | 'quote' | 'service' | 'inventory' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkAction?: string;
  actionPayload?: any;
}

export interface EmailLog {
  id: string;
  to: string;
  toName: string;
  subject: string;
  type: 'order_confirmation' | 'quotation_ready' | 'status_update' | 'service_dispatch' | 'quote_accepted' | 'invoice';
  htmlContent: string;
  sentAt: string;
  status: 'delivered' | 'queued';
  referenceId?: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  minOrderAmount: number;
  description: string;
  active: boolean;
}
