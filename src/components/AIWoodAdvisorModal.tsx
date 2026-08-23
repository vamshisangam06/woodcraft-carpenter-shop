import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

interface AIWoodAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecommendedWood: (woodName: string) => void;
}

export const AIWoodAdvisorModal: React.FC<AIWoodAdvisorModalProps> = ({
  isOpen,
  onClose,
  onSelectRecommendedWood,
}) => {
  const [roomType, setRoomType] = useState('Dining Room');
  const [usage, setUsage] = useState('Heavy Daily Family Use (Kids & Spills)');
  const [climate, setClimate] = useState('Moderate Humidity with AC');
  const [aesthetic, setAesthetic] = useState('Rich Warm Golden Brown');
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await api.askWoodDoctor(
        `Recommend the best wood species and finish for: Room: ${roomType}, Usage: ${usage}, Climate: ${climate}, Aesthetic: ${aesthetic}. Please give a concise breakdown with wood name, durability rating, and care routine.`,
        []
      );

      // Extract recommended wood
      let recWood = 'American White Oak';
      if (aesthetic.includes('Teak') || aesthetic.includes('Golden')) recWood = 'Burma Teak';
      else if (aesthetic.includes('Walnut') || aesthetic.includes('Dark')) recWood = 'Walnut';
      else if (aesthetic.includes('Rosewood')) recWood = 'Indian Sheesham (Rosewood)';

      setRecommendation({
        wood: recWood,
        finish: usage.includes('Spills') ? 'Satin Polyurethane (PU)' : 'Natural Matte Hardwax Oil',
        details: response.reply,
      });
    } catch {
      setRecommendation({
        wood: 'American White Oak',
        finish: 'Satin Polyurethane (PU)',
        details:
          'American White Oak (1360 Janka) provides superior resistance to dents and liquids due to its closed cellular tyloses structure. Finished with a 30% sheen Satin PU, it protects against hot coffee spills and pet claws while showing authentic open grain character.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div
      id="ai-wood-advisor-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e7dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#f0eae1] flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#b45309]" />
            <h3 className="font-serif font-bold text-base text-[#291e14]">
              AI Wood Doctor & Species Advisor
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8c7e75] hover:text-[#291e14] rounded-lg hover:bg-[#f3ede2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#291e14] block mb-1">Target Room / Setting:</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl font-semibold text-[#291e14]"
              >
                <option>Dining Room</option>
                <option>Master Bedroom</option>
                <option>Living Room & TV Console</option>
                <option>Home Office / Workstation</option>
                <option>Modular Kitchen</option>
                <option>Outdoor Covered Patio</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#291e14] block mb-1">Daily Usage Intensity:</label>
              <select
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl font-semibold text-[#291e14]"
              >
                <option>Heavy Daily Family Use (Kids & Spills)</option>
                <option>Medium Daily Use (Adults & Laptops)</option>
                <option>Formal Occasional Display</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#291e14] block mb-1">Room Climate & Sun Exposure:</label>
              <select
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl font-semibold text-[#291e14]"
              >
                <option>Moderate Humidity with AC</option>
                <option>High Seasonal Humidity / Coastal</option>
                <option>Direct Window Sunlight Exposure</option>
                <option>Dry Winter Heating</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#291e14] block mb-1">Preferred Aesthetic Tone:</label>
              <select
                value={aesthetic}
                onChange={(e) => setAesthetic(e.target.value)}
                className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl font-semibold text-[#291e14]"
              >
                <option>Rich Warm Golden Brown (Teak Heritage)</option>
                <option>Modern Light Scandinavian Oak</option>
                <option>Dark Espresso / Chocolate Walnut</option>
                <option>Contrasting Live Edge Rosewood</option>
                <option>Rustic Farmhouse Amber Pine</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#fde68a]" />
            <span>{analyzing ? 'Master Joiner is analyzing timber grain...' : 'Generate Expert AI Wood Recommendation'}</span>
          </button>

          {recommendation && (
            <div className="p-5 bg-[#fdf3e7] rounded-2xl border border-[#fde68a] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#92400e] tracking-wider">
                    Recommended Species & Finish
                  </span>
                  <h4 className="text-base font-serif font-bold text-[#291e14]">
                    {recommendation.wood} with {recommendation.finish}
                  </h4>
                </div>
                <CheckCircle2 className="w-6 h-6 text-[#15803d]" />
              </div>

              <p className="text-xs text-[#57483f] leading-relaxed whitespace-pre-wrap">
                {recommendation.details}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onSelectRecommendedWood(recommendation.wood);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#78350f] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <span>Build Custom Piece with {recommendation.wood}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
