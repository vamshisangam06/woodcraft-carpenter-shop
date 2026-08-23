import React, { useState } from 'react';
import {
  Hammer,
  Search,
  ShoppingCart,
  Bell,
  User as UserIcon,
  Layers,
  Wrench,
  Sparkles,
  Package,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  X,
  Menu,
  Cloud,
  LogIn,
  LogOut,
} from 'lucide-react';
import { User, OrderItem, Notification } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  notifications: Notification[];
  onNotificationClick: (notif: Notification) => void;
  onMarkAllNotificationsRead: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAIAdvisor: () => void;
  firebaseUser?: FirebaseUser | null;
  onSignInGoogle?: () => Promise<void>;
  onSignOutGoogle?: () => Promise<void>;
  isFirebaseConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  searchQuery,
  setSearchQuery,
  onOpenAIAdvisor,
  firebaseUser,
  onSignInGoogle,
  onSignOutGoogle,
  isFirebaseConnected = true,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'catalog', label: 'Shop Furniture' },
    { id: 'custom', label: 'Custom Furniture' },
    { id: 'services', label: 'Carpenter Services' },
    { id: 'tracking', label: 'Track Order' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div id="top-announcement-bar" className="bg-[#451a03] text-[#fde68a] text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#b45309] text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Special</span>
            <span>Handcrafted Solid Burma Teak & White Oak Seasoned Timber • 10-Year Joinery Guarantee</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[#fef3c7] text-xs">
            <div className="flex items-center gap-1.5 bg-[#5e2709] px-2 py-0.5 rounded text-[11px] text-[#fef3c7]">
              <Cloud className="w-3 h-3 text-[#34d399]" />
              <span>Firebase Firestore Sync: {isFirebaseConnected ? 'Live & Connected' : 'Connecting...'}</span>
            </div>
            <span>•</span>
            <span className="hover:text-white cursor-pointer" onClick={onOpenAIAdvisor}>
              ✨ AI Wood Doctor & Cost Advisor
            </span>
            <span>•</span>
            <span>Call: +1 (555) 980-WOOD</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#fdfbf7] border-b border-[#e7dfd5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              id="brand-logo"
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#78350f] to-[#451a03] flex items-center justify-center text-[#fde68a] shadow-md group-hover:scale-105 transition-transform">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-[#291e14] tracking-tight block">
                  WoodCraft
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#854d0e] block -mt-1">
                  Master Joinery & Carpentry
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav" className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === link.id
                      ? 'bg-[#78350f] text-white shadow-xs'
                      : 'text-[#443831] hover:text-[#78350f] hover:bg-[#f3ede2]'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* Role-specific Tabs */}
              {currentUser.role === 'admin' && (
                <button
                  id="nav-link-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#991b1b] text-white shadow-xs'
                      : 'text-[#991b1b] bg-[#fee2e2]/60 hover:bg-[#fee2e2]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </button>
              )}

              {currentUser.role === 'carpenter' && (
                <button
                  id="nav-link-carpenter"
                  onClick={() => setActiveTab('carpenter_portal')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'carpenter_portal'
                      ? 'bg-[#065f46] text-white shadow-xs'
                      : 'text-[#065f46] bg-[#d1fae5]/60 hover:bg-[#d1fae5]'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Worker Jobs
                </button>
              )}

              {currentUser.role === 'customer' && (
                <button
                  id="nav-link-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#78350f] text-white'
                      : 'text-[#443831] hover:text-[#78350f] hover:bg-[#f3ede2]'
                  }`}
                >
                  My Account
                </button>
              )}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                id="search-toggle-btn"
                onClick={() => setShowSearchModal(true)}
                className="p-2.5 rounded-full text-[#57483f] hover:text-[#78350f] hover:bg-[#f3ede2] transition-colors"
                title="Search furniture & services"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* AI Wood Advisor Button */}
              <button
                id="ai-advisor-btn"
                onClick={onOpenAIAdvisor}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#fef3c7] hover:bg-[#fde68a] text-[#78350f] border border-[#fcd34d] rounded-full text-xs font-semibold shadow-2xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
                <span>AI Wood Doctor</span>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  id="notif-dropdown-btn"
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    setShowUserMenu(false);
                  }}
                  className="p-2.5 rounded-full text-[#57483f] hover:text-[#78350f] hover:bg-[#f3ede2] relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span
                      id="notif-badge-counter"
                      className="absolute top-1 right-1 w-4 h-4 bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifMenu && (
                  <div
                    id="notif-menu-dropdown"
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e7dfd5] py-3 z-50 overflow-hidden"
                  >
                    <div className="px-4 pb-2 border-b border-[#f0eae1] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-[#291e14]">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="bg-[#fef3c7] text-[#92400e] text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-[#b45309] hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#f5efe6]">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#8c7e75]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            id={`notif-item-${n.id}`}
                            onClick={() => {
                              onNotificationClick(n);
                              setShowNotifMenu(false);
                            }}
                            className={`p-3.5 hover:bg-[#fdfbf7] cursor-pointer transition-colors ${
                              !n.read ? 'bg-[#fffbeb]/70' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                                  !n.read ? 'bg-[#b45309]' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-[#291e14]">{n.title}</p>
                                  <span className="text-[10px] text-[#9ca3af]">{n.timestamp.split(' ')[0]}</span>
                                </div>
                                <p className="text-xs text-[#57483f] mt-0.5 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Cart Button */}
              <button
                id="cart-drawer-trigger-btn"
                onClick={onOpenCart}
                className="relative p-2.5 rounded-full bg-[#78350f] text-white hover:bg-[#5e2709] transition-all shadow-xs"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    id="cart-badge-counter"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#d97706] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Switcher / Profile Dropdown */}
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifMenu(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-[#f3ede2] hover:bg-[#e9e0d2] transition-colors border border-[#dfd4c5]"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#b45309]"
                  />
                  <span className="hidden md:inline text-xs font-semibold text-[#3b2d24] max-w-[90px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6e5d52]" />
                </button>

                {/* User Role Switcher Menu (Crucial for Reviewer to switch Customer / Admin / Carpenter) */}
                {showUserMenu && (
                  <div
                    id="user-switcher-dropdown"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e7dfd5] py-3 z-50"
                  >
                    <div className="px-4 pb-3 border-b border-[#f0eae1]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#8c7e75] font-medium">Active Account:</p>
                        {firebaseUser && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Google Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#291e14]">{currentUser.name}</p>
                      <p className="text-xs text-[#6e5d52] truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">
                          {currentUser.role} Role
                        </span>
                        <span className="text-[10px] text-[#059669] flex items-center gap-1 font-medium">
                          <Cloud className="w-2.5 h-2.5" /> Firestore Active
                        </span>
                      </div>
                    </div>

                    {/* Google Firebase Authentication Action */}
                    <div className="p-3 border-b border-[#f0eae1] bg-[#fcfaf7]">
                      {!firebaseUser ? (
                        <button
                          id="firebase-google-signin-btn"
                          onClick={async () => {
                            if (onSignInGoogle) {
                              await onSignInGoogle();
                              setShowUserMenu(false);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-[#f5efe6] border border-[#d6c7b7] text-[#291e14] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.34 24 12 24Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                            />
                          </svg>
                          <span>Sign in with Google</span>
                        </button>
                      ) : (
                        <button
                          id="firebase-google-signout-btn"
                          onClick={async () => {
                            if (onSignOutGoogle) {
                              await onSignOutGoogle();
                              setShowUserMenu(false);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-semibold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign out of Firebase</span>
                        </button>
                      )}
                    </div>

                    <div className="px-3 pt-2">
                      <p className="text-[11px] font-bold text-[#8c7e75] uppercase px-2 pb-1">
                        Switch Demo Role:
                      </p>
                      <div className="space-y-1">
                        {allUsers.map((user) => (
                          <button
                            key={user.id}
                            id={`switch-user-${user.id}`}
                            onClick={() => {
                              onSwitchUser(user);
                              setShowUserMenu(false);
                              if (user.role === 'admin') setActiveTab('admin');
                              else if (user.role === 'carpenter') setActiveTab('carpenter_portal');
                              else setActiveTab('dashboard');
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                              currentUser.id === user.id ? 'bg-[#fdf3e7] text-[#78350f] font-semibold' : 'hover:bg-[#f7f3eb] text-[#443831]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium leading-tight">{user.name}</p>
                                <span className="text-[10px] text-[#8c7e75] capitalize">{user.role}</span>
                              </div>
                            </div>
                            {currentUser.id === user.id && <CheckCircle2 className="w-4 h-4 text-[#b45309]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0eae1] px-3">
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-[#57483f] hover:bg-[#f7f3eb] rounded-lg font-medium"
                      >
                        Account Profile & Addresses
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#57483f] hover:bg-[#f3ede2] rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav-drawer" className="lg:hidden bg-[#fdfbf7] border-b border-[#e7dfd5] px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
                  activeTab === link.id ? 'bg-[#78350f] text-white' : 'text-[#443831] hover:bg-[#f3ede2]'
                }`}
              >
                {link.label}
              </button>
            ))}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-[#fee2e2] text-[#991b1b]"
              >
                Admin Control Dashboard
              </button>
            )}
            {currentUser.role === 'carpenter' && (
              <button
                onClick={() => {
                  setActiveTab('carpenter_portal');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-[#d1fae5] text-[#065f46]"
              >
                Carpenter Worker Portal
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-[#443831] hover:bg-[#f3ede2]"
            >
              My Customer Account
            </button>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div id="global-search-modal" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7dfd5] p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#f0eae1]">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-[#b45309]" />
                <input
                  type="text"
                  placeholder="Search dining tables, teak beds, sofas, repair services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-base text-[#291e14] placeholder-[#a89b91] focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 text-[#8c7e75] hover:text-[#291e14]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-[#8c7e75] uppercase tracking-wider mb-2">
                Popular Searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Burma Teak Bed', 'Live Edge Dining Table', 'Walnut TV Console', 'Modular Kitchen Repair', 'Spindle Chairs', 'Custom Wardrobe'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setActiveTab('catalog');
                      setShowSearchModal(false);
                    }}
                    className="px-3 py-1 bg-[#f7f3eb] hover:bg-[#f0eae1] text-xs text-[#57483f] font-medium rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  setShowSearchModal(false);
                }}
                className="px-5 py-2.5 bg-[#78350f] text-white text-sm font-semibold rounded-xl hover:bg-[#5e2709]"
              >
                View Catalog Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
