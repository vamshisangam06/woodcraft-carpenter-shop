import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(
    "Hi WoodCraft Carpentry! I'd like to ask about custom solid wood furniture dimensions and carpenter home visits."
  );

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/15559809663?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div id="whatsapp-floating-container" className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-3xl shadow-2xl border border-[#e7dfd5] p-5 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0eae1]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#291e14]">WoodCraft Support</h4>
                <p className="text-[10px] text-[#16a34a] font-semibold">Online • Responds in ~5 mins</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#8c7e75] hover:text-[#291e14]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-[#57483f]">
            <p className="p-3 bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0] text-[11px] leading-relaxed">
              👋 Need instant help with furniture dimensions, live timber photos, or booking a carpenter for today?
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#25D366]"
            />
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start WhatsApp Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        id="whatsapp-floating-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
};
