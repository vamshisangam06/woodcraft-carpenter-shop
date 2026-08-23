import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomFurnitureBuilder } from './components/CustomFurnitureBuilder';
import { CarpenterServiceBooking } from './components/CarpenterServiceBooking';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CarpenterPortal } from './components/CarpenterPortal';
import { InvoiceModal } from './components/InvoiceModal';
import { AIWoodAdvisorModal } from './components/AIWoodAdvisorModal';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

import {
  Product,
  Order,
  CustomFurnitureRequest,
  ServiceBooking,
  CarpenterWorker,
  InventoryItem,
  User,
  OrderItem,
  Notification,
  EmailLog,
} from './types';
import { api } from './services/api';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  firestoreService,
  testFirestoreConnection,
} from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS,
  INITIAL_SERVICE_BOOKINGS,
  INITIAL_CARPENTERS,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_EMAILS,
} from './data/mockData';

export function App() {
  // Firebase Auth & Live Status
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Authentication / Active Persona
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Customer John Doe

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [quotes, setQuotes] = useState<CustomFurnitureRequest[]>(INITIAL_CUSTOM_REQUESTS);
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_SERVICE_BOOKINGS);
  const [carpenters, setCarpenters] = useState<CarpenterWorker[]>(INITIAL_CARPENTERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [emails, setEmails] = useState<EmailLog[]>(INITIAL_EMAILS);

  // Cart & Checkout
  const [cartItems, setCartItems] = useState<OrderItem[]>([
    {
      productId: 'prod-1',
      name: 'Burma Teak Heritage King Platform Bed',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
      price: 1290,
      quantity: 1,
      selectedFinish: 'Natural Matte Oil',
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState<string | undefined>(undefined);

  // Modals
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [customBuilderPrefill, setCustomBuilderPrefill] = useState<Product | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState<boolean>(false);

  // Test Firebase Firestore Connection on Mount
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const isAdminUser =
          fbUser.email?.toLowerCase() === 'tharurs990@gmail.com' ||
          fbUser.email?.includes('admin');
        const role = isAdminUser ? 'admin' : 'customer';

        const syncedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'WoodCraft User',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '+1 555-019-2831',
          role: role as any,
          avatar:
            fbUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          address: '742 Evergreen Terrace, Springfield',
        };

        setCurrentUser(syncedUser);
        setAllUsers((prev) => {
          const exists = prev.some((u) => u.id === syncedUser.id);
          return exists ? prev.map((u) => (u.id === syncedUser.id ? syncedUser : u)) : [syncedUser, ...prev];
        });

        // Save profile to Firestore
        try {
          await firestoreService.saveUserProfile(syncedUser);
        } catch (e) {
          console.warn('Firestore user profile sync error:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In Failed:', err);
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await signOutUser();
      setFirebaseUser(null);
      setCurrentUser(INITIAL_USERS[0]);
    } catch (err) {
      console.error('Sign Out Failed:', err);
    }
  };

  // Fetch live state from backend API on mount & on refresh
  const refreshAllData = async () => {
    try {
      const [u, p, o, q, b, c, inv, notifs, em] = await Promise.all([
        api.getUsers(),
        api.getProducts(),
        api.getOrders(),
        api.getQuotes(),
        api.getBookings(),
        api.getCarpenters(),
        api.getInventory(),
        api.getNotifications(currentUser.id, currentUser.role),
        api.getEmails(),
      ]);
      setAllUsers((prev) => {
        // Keep authenticated Google user if present
        if (firebaseUser) {
          const exists = u.some((item) => item.id === currentUser.id);
          return exists ? u : [currentUser, ...u];
        }
        return u;
      });
      setProducts(p);
      setOrders(o);
      setQuotes(q);
      setBookings(b);
      setCarpenters(c);
      setInventory(inv);
      setNotifications(notifs);
      setEmails(em);
    } catch (err) {
      console.warn('API sync warning:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUser]);

  // Cart Handlers
  const handleAddToCart = (product: Product, selectedFinish?: string, quantity: number = 1) => {
    const finish = selectedFinish || product.finishes[0] || 'Natural Matte Oil';
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product.id && i.selectedFinish === finish
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          quantity,
          selectedFinish: finish,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, selectedFinish?: string) => {
    handleAddToCart(product, selectedFinish, 1);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, finish?: string) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId, finish);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.selectedFinish === finish
          ? { ...i, quantity }
          : i
      )
    );
  };

  const handleRemoveCartItem = (productId: string, finish?: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.selectedFinish === finish))
    );
  };

  const handleProceedToCheckout = (appliedDiscount: number, couponCode?: string) => {
    setCheckoutDiscount(appliedDiscount);
    setCheckoutCoupon(couponCode);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (createdOrder: Order) => {
    setCartItems([]);
    setOrders((prev) => [createdOrder, ...prev]);
    refreshAllData();
  };

  const handleRequestCustomization = (product: Product) => {
    setCustomBuilderPrefill(product);
    setActiveTab('custom');
  };

  const handleNotificationClick = (notif: Notification) => {
    api.markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.type === 'order') {
      if (currentUser.role === 'admin') setActiveTab('admin');
      else setActiveTab('tracking');
    } else if (notif.type === 'quote') {
      if (currentUser.role === 'admin') setActiveTab('admin');
      else setActiveTab('dashboard');
    } else if (notif.type === 'service') {
      if (currentUser.role === 'carpenter') setActiveTab('carpenter_portal');
      else if (currentUser.role === 'admin') setActiveTab('admin');
      else setActiveTab('dashboard');
    } else if (notif.type === 'inventory') {
      setActiveTab('admin');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsAsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7] text-[#291e14] font-sans antialiased selection:bg-[#fde68a] selection:text-[#78350f]">
      {/* Top Navbar with Role Switcher */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
        }}
        allUsers={allUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        firebaseUser={firebaseUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <>
            <HeroSection
              onShopFurniture={() => setActiveTab('catalog')}
              onBookCarpenter={() => setActiveTab('services')}
              onGetQuote={() => setActiveTab('custom')}
              onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
            />

            {/* Featured Product Preview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
              <div className="flex items-end justify-between pb-6 border-b border-[#e7dfd5]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#92400e]">
                    Master Highlights
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#291e14] mt-1">
                    Featured Handcrafted Pieces
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs font-bold text-[#78350f] hover:underline"
                >
                  View All Collections →
                </button>
              </div>
            </div>

            <ProductCatalog
              products={products.filter((p) => p.featured)}
              onSelectProduct={(p) => setSelectedProductForDetail(p)}
              onAddToCart={handleAddToCart}
              onRequestCustomization={handleRequestCustomization}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenCustomBuilder={() => setActiveTab('custom')}
            />
          </>
        )}

        {/* VIEW 2: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onRequestCustomization={handleRequestCustomization}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCustomBuilder={() => setActiveTab('custom')}
          />
        )}

        {/* VIEW 3: CUSTOM FURNITURE BUILDER */}
        {activeTab === 'custom' && (
          <CustomFurnitureBuilder
            currentUser={currentUser}
            onQuoteSubmitted={() => {
              refreshAllData();
              setTimeout(() => setActiveTab('dashboard'), 1200);
            }}
            prefillProduct={customBuilderPrefill}
          />
        )}

        {/* VIEW 4: CARPENTER SERVICES */}
        {activeTab === 'services' && (
          <CarpenterServiceBooking
            currentUser={currentUser}
            onBookingSuccess={() => {
              refreshAllData();
              setTimeout(() => setActiveTab('dashboard'), 1200);
            }}
          />
        )}

        {/* VIEW 5: ORDER TRACKING */}
        {activeTab === 'tracking' && (
          <OrderTrackingView
            orders={orders}
            onOpenInvoice={(ord) => setSelectedOrderForInvoice(ord)}
          />
        )}

        {/* VIEW 6: CUSTOMER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <CustomerDashboard
            currentUser={currentUser}
            orders={orders}
            quotes={quotes}
            bookings={bookings}
            onOpenTracking={() => setActiveTab('tracking')}
            onOpenInvoice={(ord) => setSelectedOrderForInvoice(ord)}
            onRefreshData={refreshAllData}
          />
        )}

        {/* VIEW 7: ADMIN CONTROL DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            quotes={quotes}
            bookings={bookings}
            carpenters={carpenters}
            inventory={inventory}
            emails={emails}
            onRefreshData={refreshAllData}
            onOpenInvoice={(ord) => setSelectedOrderForInvoice(ord)}
          />
        )}

        {/* VIEW 8: CARPENTER WORKER PORTAL */}
        {activeTab === 'carpenter_portal' && (
          <CarpenterPortal
            currentUser={currentUser}
            orders={orders}
            bookings={bookings}
            onRefreshData={refreshAllData}
          />
        )}
      </main>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        currentUser={currentUser}
        items={cartItems}
        appliedDiscount={checkoutDiscount}
        couponCode={checkoutCoupon}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onRequestCustomization={handleRequestCustomization}
      />

      {/* Official Tax Invoice & Quotation Printable Modal */}
      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      {/* AI Wood Doctor Modal */}
      <AIWoodAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        onSelectRecommendedWood={(woodName) => {
          setActiveTab('custom');
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Floating WhatsApp Support Launcher */}
      <WhatsAppFloatingButton />

      {/* Footer */}
      <Footer
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
      />
    </div>
  );
}

export default App;
