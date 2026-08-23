import React from 'react';
import { motion } from 'motion/react';
import {
  Hammer,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Heart,
  Sparkles,
  TreePine,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAIAdvisor: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAIAdvisor }) => {
  return (
    <footer id="main-footer" className="bg-[#1f160e] text-[#e7dfd5] pt-16 pb-12 border-t border-[#3a2211]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#3d2d20]">
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#b45309] to-[#78350f] flex items-center justify-center text-white shadow-lg border border-[#d97706]/40">
                <Hammer className="w-6 h-6 text-[#fde68a]" />
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-white tracking-tight block">
                  WoodCraft
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d97706] block">
                  Master Joinery & Carpentry
                </span>
              </div>
            </div>
            <p className="text-xs text-[#b8aba0] leading-relaxed max-w-sm">
              Heirloom-grade solid wood furniture hand-joined by master carpenters. We source certified sustainably harvested Burma Teak, White Oak, Walnut, and Indian Sheesham.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-[#fde68a]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>10-Year Structural Guarantee • 100% Solid Kiln-Dried Hardwood</span>
              </div>
              <div className="flex items-center gap-2 text-[#cbd5e1]">
                <TreePine className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Zero Engineered Particle Board • FSC Certified Seasoned Timber</span>
              </div>
            </div>
          </div>

          {/* Col 2: Furniture Collections */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Furniture</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#b8aba0]">
              {['Beds & Headboards', 'Dining Tables & Slabs', 'Louver Wardrobes', 'Acoustic TV Consoles', 'Modular Kitchen Cabinets', 'Office Desks'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="hover:text-[#fde68a] hover:translate-x-1 transition-all inline-block cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Carpenter Services & Tools */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Carpentry Services
            </h4>
            <ul className="space-y-2 text-xs text-[#b8aba0]">
              {['Furniture Repair & Joinery', 'Polishing & PU Painting', 'Modular Kitchen Fitting', 'Door & Lock Alignment', 'Custom Woodwork Consultation', 'On-Site Carpenter Booking'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate('services')}
                    className="hover:text-[#fde68a] hover:translate-x-1 transition-all inline-block cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button
                  onClick={onOpenAIAdvisor}
                  className="text-[#fde68a] font-semibold hover:text-white flex items-center gap-1.5 bg-[#451a03] px-2.5 py-1 rounded-lg border border-[#78350f] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>AI Wood Doctor</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Workshop & Location */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Master Workshop
            </h4>
            <div className="space-y-2.5 text-xs text-[#b8aba0]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <span>Plot 42, Timber Yard Industrial Estate, Whitefield, Bengaluru, Karnataka 560066</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>+91 98450 22189 / +91 80 4122 8890</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>Mon - Sat: 8:00 AM – 8:00 PM IST</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8c7e75] gap-4">
          <p>© {new Date().getFullYear()} WoodCraft Carpentry Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-[#b8aba0]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              Kiln-Dried Moisture Guarantee (8-10%)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              Zero Particle-Board Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

