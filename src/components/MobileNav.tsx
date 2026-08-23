import React from 'react';
import { Home, ShoppingBag, Wrench, Package, User } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
}) => {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalog', label: 'Shop', icon: ShoppingBag },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'tracking', label: 'Orders', icon: Package },
    { id: 'dashboard', label: 'Profile', icon: User },
  ];

  return (
    <div
      id="mobile-bottom-navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-t border-[#e7dfd5] px-2 py-2 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#78350f] font-bold scale-105'
                  : 'text-[#8c7e75] hover:text-[#57483f]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
