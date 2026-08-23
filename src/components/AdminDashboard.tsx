import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  Layers,
  FileText,
  Users,
  Wrench,
  Mail,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Send,
  DollarSign,
  IndianRupee,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  Product,
  Order,
  CustomFurnitureRequest,
  ServiceBooking,
  CarpenterWorker,
  InventoryItem,
  EmailLog,
  OrderStatus,
  ProductCategory,
  WoodType,
} from '../types';
import { api } from '../services/api';
import { ProductFormModal } from './ProductFormModal';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  quotes: CustomFurnitureRequest[];
  bookings: ServiceBooking[];
  carpenters: CarpenterWorker[];
  inventory: InventoryItem[];
  emails: EmailLog[];
  onRefreshData: () => void;
  onOpenInvoice: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  quotes,
  bookings,
  carpenters,
  inventory,
  emails,
  onRefreshData,
  onOpenInvoice,
}) => {
  const [adminTab, setAdminTab] = useState<
    'overview' | 'products' | 'orders' | 'quotes' | 'workers' | 'inventory' | 'emails'
  >('overview');

  // Product modal state (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSuccessToast, setProductSuccessToast] = useState<string | null>(null);

  // Quote itemization form
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [quoteMaterialCost, setQuoteMaterialCost] = useState(24000);
  const [quoteLaborCost, setQuoteLaborCost] = useState(16500);
  const [quoteFinishCost, setQuoteFinishCost] = useState(4800);
  const [quoteDeliveryCost, setQuoteDeliveryCost] = useState(2200);
  const [quoteDays, setQuoteDays] = useState(14);
  const [quoteNotes, setQuoteNotes] = useState('Burma Teak Grade-A with traditional mortise tenon joints.');

  // Order status update state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('In Production');
  const [orderLogDesc, setOrderLogDesc] = useState('Frame joined with mortise and tenon. Proceeding to sanding.');
  const [orderPhotoMilestone, setOrderPhotoMilestone] = useState('');

  // Analytics totals
  const totalSales = orders.reduce((sum, o) => sum + (o.grandTotal ?? (o as any).totalAmount ?? 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus !== 'Delivered');
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        setProductSuccessToast(`Successfully updated "${productData.name}" prices & photos!`);
      } else {
        await api.addProduct(productData);
        setProductSuccessToast(`Successfully added "${productData.name}" to catalog!`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      onRefreshData();
      setTimeout(() => setProductSuccessToast(null), 4500);
    } catch (err) {
      console.error('Failed to save product:', err);
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from the catalog?')) return;
    await api.deleteProduct(id);
    onRefreshData();
  };

  const handleUpdateOrderStatus = async (orderId: string) => {
    try {
      await api.updateOrderStatus(
        orderId,
        newOrderStatus,
        orderLogDesc,
        'Master Arthur Vance',
        orderPhotoMilestone || undefined
      );
      setUpdatingOrderId(null);
      onRefreshData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAssignCarpenterToOrder = async (orderId: string, carpId: string) => {
    await api.assignCarpenterToOrder(orderId, carpId);
    onRefreshData();
  };

  const handleSubmitFormalQuotation = async (quoteId: string) => {
    const sub = quoteMaterialCost + quoteLaborCost + quoteFinishCost + quoteDeliveryCost + 1500;
    const tax = Math.round(sub * 0.12);
    const grandTotal = sub + tax;
    try {
      await api.submitAdminQuotation(quoteId, {
        id: `quotation-${Date.now()}`,
        materialCost: quoteMaterialCost,
        laborCost: quoteLaborCost,
        finishCost: quoteFinishCost,
        deliveryCost: quoteDeliveryCost,
        customizationFee: 1500,
        subtotal: sub,
        taxAmount: tax,
        discountAmount: 0,
        grandTotal,
        validityDays: quoteDays,
        adminNotes: quoteNotes,
        sentAt: new Date().toISOString(),
        materialsBreakdown: [
          { item: 'Kiln-Dried Timber Lumber', qty: '38 bd. ft', cost: quoteMaterialCost },
          { item: 'Fasteners & Joinery Glue', qty: '1 set', cost: 1500 },
          { item: 'Multi-Coat PU Finish', qty: '1 L', cost: quoteFinishCost },
        ],
      });
      setActiveQuoteId(null);
      onRefreshData();
    } catch (err) {
      console.error('Failed to submit formal quote:', err);
    }
  };

  const handleAdjustInventoryStock = async (invId: string, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    await api.updateInventoryStock(invId, next);
    onRefreshData();
  };

  return (
    <div id="admin-dashboard-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[#e7dfd5] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#fee2e2] text-[#991b1b] text-[10px] font-bold uppercase rounded-md">
              Master Admin Terminal
            </span>
            <span className="text-xs text-[#8c7e75]">Workshop ERP & E-Commerce Control</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#291e14] mt-1">
            WoodCraft Executive Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Catalog Product</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="py-6 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#f0eae1]">
        {[
          { id: 'overview', label: 'Executive Analytics', icon: BarChart3 },
          { id: 'products', label: 'Products Catalog', icon: Package, count: products.length },
          { id: 'orders', label: 'Orders & Production Line', icon: Layers, count: orders.length },
          { id: 'quotes', label: 'Custom Quotes Studio', icon: FileText, count: quotes.length },
          { id: 'workers', label: 'Carpenters & Workers', icon: Users, count: carpenters.length },
          { id: 'inventory', label: 'Raw Materials & Inventory', icon: Wrench, count: lowStockItems.length > 0 ? `⚠️ ${lowStockItems.length}` : `${inventory.length}` },
          { id: 'emails', label: 'Automated Emails Outbox', icon: Mail, count: emails.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-[#991b1b] text-white shadow-xs'
                  : 'bg-[#f7f3eb] text-[#57483f] hover:bg-[#ede5d8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#e7dfd5] text-[#291e14]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW / ANALYTICS */}
      {adminTab === 'overview' && (
        <div className="py-6 space-y-8">
          {/* 4 Executive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7e75]">
                <span className="text-xs font-semibold">Total Revenue (YTD)</span>
                <IndianRupee className="w-4 h-4 text-[#15803d]" />
              </div>
              <p className="text-2xl font-bold text-[#291e14] mt-2">₹{totalSales.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-[#15803d] font-semibold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +18.4% from last month
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7e75]">
                <span className="text-xs font-semibold">Active Orders In Production</span>
                <Layers className="w-4 h-4 text-[#b45309]" />
              </div>
              <p className="text-2xl font-bold text-[#291e14] mt-2">{pendingOrders.length}</p>
              <span className="text-[11px] text-[#8c7e75] mt-1 block">
                {orders.filter((o) => o.orderStatus === 'In Production').length} in joinery assembly
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7e75]">
                <span className="text-xs font-semibold">Custom Quotations Pending</span>
                <FileText className="w-4 h-4 text-[#d97706]" />
              </div>
              <p className="text-2xl font-bold text-[#291e14] mt-2">
                {quotes.filter((q) => q.status === 'pending_review').length}
              </p>
              <span className="text-[11px] text-[#b45309] font-medium mt-1 block">
                Requires bill of materials pricing
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center justify-between text-[#8c7e75]">
                <span className="text-xs font-semibold">Low Stock Warnings</span>
                <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
              </div>
              <p className="text-2xl font-bold text-[#dc2626] mt-2">{lowStockItems.length}</p>
              <span className="text-[11px] text-[#dc2626] font-semibold mt-1 block">
                Below minimum safety threshold
              </span>
            </div>
          </div>

          {/* Revenue Breakdown & Active Production Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#e7dfd5] shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#291e14] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#b45309]" />
                <span>Monthly Timber Craftsmanship Revenue Flow</span>
              </h3>
              <div className="h-48 flex items-end gap-4 pt-8 px-2 border-b border-[#f0eae1]">
                {[
                  { month: 'Jan', val: '₹2.8L', height: '40%' },
                  { month: 'Feb', val: '₹3.4L', height: '52%' },
                  { month: 'Mar', val: '₹4.1L', height: '62%' },
                  { month: 'Apr', val: '₹4.9L', height: '70%' },
                  { month: 'May', val: '₹5.5L', height: '78%' },
                  { month: 'Jun', val: '₹6.8L', height: '92%' },
                  { month: 'Jul', val: '₹7.5L', height: '100%' },
                ].map((bar) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-[#78350f]">{bar.val}</span>
                    <div
                      className="w-full bg-[#78350f] rounded-t-lg hover:bg-[#5c280a] transition-all cursor-pointer"
                      style={{ height: bar.height }}
                    />
                    <span className="text-[11px] font-semibold text-[#8c7e75]">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#e7dfd5] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-[#291e14]">
                Top Selling Timber Pieces
              </h3>
              <div className="space-y-3 divide-y divide-[#f5efe6]">
                {products.slice(0, 4).map((p) => (
                  <div key={p.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-[#291e14] line-clamp-1">{p.name}</p>
                        <span className="text-[10px] text-[#8c7e75]">{p.category}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#291e14]">₹{p.price?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS CATALOG MANAGER */}
      {adminTab === 'products' && (
        <div className="py-6 space-y-4">
          {productSuccessToast && (
            <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl text-xs text-[#166534] font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                <span>{productSuccessToast}</span>
              </div>
              <button onClick={() => setProductSuccessToast(null)} className="text-[#166534] hover:opacity-75">
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#291e14]">
                Handcrafted Catalog & Inventory ({products.length} Products)
              </h3>
              <p className="text-xs text-[#8c7e75]">
                Manage solid timber collections, upload or capture photos, update prices, and edit wood specifications.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#e7dfd5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#57483f]">
                <thead className="bg-[#fdfbf7] text-[#291e14] font-bold border-b border-[#f0eae1]">
                  <tr>
                    <th className="p-4">Piece / Photo</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Wood Species Used</th>
                    <th className="p-4">Price / MSRP</th>
                    <th className="p-4">Inventory</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5efe6]">
                  {products.map((p) => {
                    const woodName = p.woodType || p.materials?.[0] || 'Burma Teak';
                    return (
                      <tr key={p.id} className="hover:bg-[#fdfbf7] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-14 h-14 rounded-2xl object-cover border border-[#e7dfd5] shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#291e14] line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-[#8c7e75] font-mono">{p.sku}</span>
                            {p.images.length > 1 && (
                              <span className="ml-1.5 text-[9px] text-[#78350f] font-semibold bg-[#fef3c7] px-1.5 py-0.5 rounded-md">
                                {p.images.length} photos
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-[#57483f]">{p.category}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-[#fbf8f2] text-[#78350f] font-bold text-[11px] rounded-lg border border-[#ede3d5]">
                            {woodName}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-[#291e14]">₹{p.price?.toLocaleString('en-IN')}</span>
                            {p.originalPrice != null && p.originalPrice > p.price && (
                              <span className="text-[10px] text-[#9ca3af] line-through">
                                ₹{p.originalPrice?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-block ${
                              p.inStock
                                ? 'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]'
                                : 'bg-[#fee2e2] text-[#991b1b]'
                            }`}
                          >
                            {p.stockCount} in stock
                          </span>
                        </td>
                        <td className="p-4 font-semibold">★ {p.rating} ({p.reviewCount})</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#f7f3eb] hover:bg-[#ede5d8] text-[#78350f] font-bold rounded-xl flex items-center gap-1 transition-colors"
                              title="Edit product details, prices, wood type, and photos"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-[#dc2626] hover:bg-[#fee2e2] rounded-xl transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDERS & WORKFLOW MANAGEMENT */}
      {adminTab === 'orders' && (
        <div className="py-6 space-y-6">
          <h3 className="font-serif font-bold text-lg text-[#291e14]">
            Order Production & Carpenter Assignment
          </h3>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f0eae1] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-[#291e14]">
                        Order #{order.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e] text-[11px] font-bold rounded-md uppercase">
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#8c7e75] mt-0.5">
                      Customer: {order.customerName} ({order.customerPhone}) • {order.items.length} items • ${(order.grandTotal ?? (order as any).totalAmount ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenInvoice(order)}
                      className="px-3 py-1.5 bg-[#f7f3eb] text-[#78350f] border border-[#dfd4c5] text-xs font-bold rounded-xl"
                    >
                      Invoice
                    </button>
                    <button
                      onClick={() => {
                        setUpdatingOrderId(order.id);
                        setNewOrderStatus(order.orderStatus);
                      }}
                      className="px-4 py-1.5 bg-[#78350f] text-white text-xs font-bold rounded-xl"
                    >
                      Update Stage
                    </button>
                  </div>
                </div>

                {/* Assign Carpenter & Milestone controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#f0eae1]">
                    <span className="font-bold text-[#291e14] block mb-1.5">
                      Assign Master Joiner:
                    </span>
                    <select
                      value={(order as any).assignedCarpenter?.id || order.assignedCarpenterId || ''}
                      onChange={(e) => handleAssignCarpenterToOrder(order.id, e.target.value)}
                      className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg font-semibold text-[#291e14]"
                    >
                      <option value="">-- Select Master Carpenter --</option>
                      {carpenters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#f0eae1]">
                    <span className="font-bold text-[#291e14] block mb-1">
                      Latest Workshop Milestone Log:
                    </span>
                    <p className="text-[#57483f]">
                      {(order.timeline && order.timeline.length > 0 ? order.timeline[order.timeline.length - 1]?.description : 'Order logged in ERP')}
                    </p>
                  </div>
                </div>

                {/* Update Modal / Subform if active */}
                {updatingOrderId === order.id && (
                  <div className="p-4 bg-[#fffbeb] rounded-2xl border border-[#fde68a] space-y-3 animate-in fade-in duration-200">
                    <h5 className="font-bold text-xs text-[#92400e]">
                      Progress Order #{order.orderNumber} to Next Milestone:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1 text-[#291e14]">Stage Status:</label>
                        <select
                          value={newOrderStatus}
                          onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                          className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg font-bold"
                        >
                          <option value="Order Placed">1. Order Placed</option>
                          <option value="Confirmed">2. Confirmed</option>
                          <option value="In Production">3. In Production</option>
                          <option value="Quality Check">4. Quality Check</option>
                          <option value="Ready">5. Ready</option>
                          <option value="Shipped">6. Shipped</option>
                          <option value="Delivered">7. Delivered</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold block mb-1 text-[#291e14]">Milestone Photo URL (Optional):</label>
                        <input
                          type="text"
                          value={orderPhotoMilestone}
                          onChange={(e) => setOrderPhotoMilestone(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-[#291e14]">Milestone Notes for Customer:</label>
                      <input
                        type="text"
                        value={orderLogDesc}
                        onChange={(e) => setOrderLogDesc(e.target.value)}
                        placeholder="e.g. Mortise and tenon joint glued. Quality check passed."
                        className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setUpdatingOrderId(null)}
                        className="px-3 py-1.5 bg-white text-xs font-bold rounded-lg border border-[#dfd4c5]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id)}
                        className="px-4 py-1.5 bg-[#78350f] text-white text-xs font-bold rounded-lg"
                      >
                        Save & Notify Customer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CUSTOM QUOTATIONS STUDIO */}
      {adminTab === 'quotes' && (
        <div className="py-6 space-y-6">
          <h3 className="font-serif font-bold text-lg text-[#291e14]">
            Custom Furniture Inquiries & Bill of Materials Quoting
          </h3>

          <div className="space-y-4">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0eae1] gap-2">
                  <div>
                    <span className="font-serif font-bold text-base text-[#291e14]">
                      Quote Request #{q.quoteNumber} — {q.customerName}
                    </span>
                    <p className="text-xs text-[#8c7e75]">
                      {q.furnitureType} • {q.woodType} • {q.dimensions.length}" × {q.dimensions.width}" × {q.dimensions.height}"
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                      q.status === 'quoted'
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : q.status === 'accepted'
                        ? 'bg-[#dbeafe] text-[#1e40af]'
                        : 'bg-[#fef3c7] text-[#92400e]'
                    }`}
                  >
                    {q.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#8c7e75] block">Customer Special Instructions:</span>
                    <p className="text-[#291e14] mt-0.5 bg-[#fdfbf7] p-2.5 rounded-xl border border-[#f0eae1]">
                      {q.notes || 'No special instructions.'}
                    </p>
                  </div>
                  {q.referenceImageUrl && (
                    <div>
                      <span className="text-[#8c7e75] block mb-1">Customer Reference Photo:</span>
                      <div className="w-32 h-20 rounded-xl overflow-hidden border border-[#dfd4c5]">
                        <img src={q.referenceImageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quoting Form Trigger */}
                {q.status === 'pending_review' && (
                  <div className="pt-3 border-t border-[#f0eae1]">
                    {activeQuoteId === q.id ? (
                      <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#e7dfd5] space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#b45309]" />
                          <h4 className="font-serif font-bold text-xs text-[#291e14]">
                            Build Formal Bill of Materials Quotation
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="font-semibold block mb-1 text-[#291e14]">Lumber Cost (₹):</label>
                            <input
                              type="number"
                              value={quoteMaterialCost}
                              onChange={(e) => setQuoteMaterialCost(Number(e.target.value))}
                              className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg font-bold"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-[#291e14]">Master Labor (₹):</label>
                            <input
                              type="number"
                              value={quoteLaborCost}
                              onChange={(e) => setQuoteLaborCost(Number(e.target.value))}
                              className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg font-bold"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-[#291e14]">PU Finish (₹):</label>
                            <input
                              type="number"
                              value={quoteFinishCost}
                              onChange={(e) => setQuoteFinishCost(Number(e.target.value))}
                              className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg font-bold"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1 text-[#291e14]">Delivery (₹):</label>
                            <input
                              type="number"
                              value={quoteDeliveryCost}
                              onChange={(e) => setQuoteDeliveryCost(Number(e.target.value))}
                              className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-bold text-[#92400e]">
                            Total Formal Quote: ₹{(quoteMaterialCost + quoteLaborCost + quoteFinishCost + quoteDeliveryCost).toLocaleString('en-IN')}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveQuoteId(null)}
                              className="px-3 py-1.5 bg-white text-xs font-semibold rounded-lg border border-[#dfd4c5]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSubmitFormalQuotation(q.id)}
                              className="px-4 py-1.5 bg-[#78350f] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" /> Send Quote to Customer
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveQuoteId(q.id)}
                        className="px-4 py-2 bg-[#78350f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Price & Dispatch Formal Quotation</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CARPENTERS & WORKERS */}
      {adminTab === 'workers' && (
        <div className="py-6 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#291e14]">
            Master Joiners & Service Technicians ({carpenters.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {carpenters.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-[#e7dfd5] p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img src={c.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#78350f]" />
                  <div>
                    <h4 className="font-bold text-sm text-[#291e14]">{c.name}</h4>
                    <p className="text-xs text-[#786b62]">{c.specialty}</p>
                    <span className="text-[10px] text-[#15803d] font-bold">★ {c.rating} Rating</span>
                  </div>
                </div>

                <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#f0eae1] text-xs space-y-1 text-[#57483f]">
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <strong>{c.experienceYears} Years</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Builds:</span>
                    <strong>{c.activeJobsCount} Jobs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <strong>{c.completedJobsCount} Finished</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. RAW MATERIALS & INVENTORY */}
      {adminTab === 'inventory' && (
        <div className="py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#291e14]">
              Workshop Timber Lumber, Hardware & Polish Stocks
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-[#e7dfd5] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-[#57483f]">
              <thead className="bg-[#fdfbf7] text-[#291e14] font-bold border-b border-[#f0eae1]">
                <tr>
                  <th className="p-4">Material / Timber</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Safety Threshold</th>
                  <th className="p-4">Unit Cost</th>
                  <th className="p-4 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5efe6]">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fdfbf7]">
                    <td className="p-4 font-bold text-[#291e14]">{item.name}</td>
                    <td className="p-4 capitalize">{item.category.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                        item.currentStock <= item.minThreshold
                          ? 'bg-[#fee2e2] text-[#991b1b]'
                          : 'bg-[#dcfce7] text-[#15803d]'
                      }`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">{item.minThreshold} {item.unit}</td>
                    <td className="p-4 font-bold">₹{item.costPerUnit.toLocaleString('en-IN')}/{item.unit}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustInventoryStock(item.id, item.currentStock, -5)}
                          className="px-2 py-1 bg-[#f7f3eb] hover:bg-[#ede5d8] rounded font-bold"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustInventoryStock(item.id, item.currentStock, 10)}
                          className="px-2 py-1 bg-[#78350f] text-white hover:bg-[#5c280a] rounded font-bold"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. AUTOMATED EMAILS OUTBOX */}
      {adminTab === 'emails' && (
        <div className="py-6 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#291e14]">
            Automated Transactional Emails Log ({emails.length})
          </h3>

          <div className="space-y-3">
            {emails.map((em) => (
              <div key={em.id} className="bg-white p-5 rounded-2xl border border-[#e7dfd5] shadow-xs text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#291e14]">{em.subject}</span>
                  <span className="text-[10px] text-[#15803d] font-bold uppercase bg-[#dcfce7] px-2 py-0.5 rounded">
                    {em.status}
                  </span>
                </div>
                <p className="text-[#8c7e75]">
                  To: <strong>{em.to}</strong> • Sent on {new Date(em.sentAt).toLocaleString()}
                </p>
                <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#f0eae1] text-[#57483f] whitespace-pre-wrap font-sans mt-2">
                  {em.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Form Modal (Add & Edit with Camera, Upload, Wood Species & AI Descriptions) */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        productToEdit={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
