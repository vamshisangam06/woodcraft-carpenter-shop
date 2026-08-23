import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Ruler,
  Layers,
  Upload,
  Calendar,
  DollarSign,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Hammer,
  Image as ImageIcon,
} from 'lucide-react';
import { ProductCategory, WoodType, FinishType, User } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface CustomFurnitureBuilderProps {
  currentUser: User;
  onQuoteSubmitted: () => void;
  prefillProduct?: any;
}

const FURNITURE_TYPES: ProductCategory[] = [
  'Dining Tables',
  'Beds',
  'Wardrobes',
  'Sofas',
  'TV Units',
  'Kitchen Cabinets',
  'Office Furniture',
  'Doors & Windows',
  'Chairs',
  'Custom Furniture',
];

const WOOD_OPTIONS: Array<{
  name: WoodType;
  density: string;
  grain: string;
  bestFor: string;
  swatchColor: string;
}> = [
  {
    name: 'Burma Teak',
    density: 'High Density (Grade A)',
    grain: 'Rich golden-brown with high natural silica oils',
    bestFor: 'Heirloom Beds, Luxury Dining, Main Doors',
    swatchColor: '#96552a',
  },
  {
    name: 'American White Oak',
    density: 'Very Hard (1360 Janka)',
    grain: 'Distinctive open straight grain with ray flecks',
    bestFor: 'Modern Desks, Dining Sets, Louver Wardrobes',
    swatchColor: '#c29b68',
  },
  {
    name: 'Walnut',
    density: 'Medium-Hard (1010 Janka)',
    grain: 'Luxurious dark chocolate waves & purplish undertones',
    bestFor: 'Acoustic TV Consoles, Executive Workstations',
    swatchColor: '#533827',
  },
  {
    name: 'Indian Sheesham (Rosewood)',
    density: 'Heavy Hardwood (1780 Janka)',
    grain: 'Dramatic contrasting sapwood & live edge ribbons',
    bestFor: 'Live-Edge Dining Slabs, Heavy Armchairs',
    swatchColor: '#6a341e',
  },
  {
    name: 'Pine Wood',
    density: 'Softwood (Kiln-Dried)',
    grain: 'Light creamy amber with rustic warm knots',
    bestFor: 'Bookcases, Farmhouse Tables, Wall Paneling',
    swatchColor: '#deb887',
  },
  {
    name: 'Mahogany',
    density: 'Medium-Hard (900 Janka)',
    grain: 'Deep reddish-brown fine interlocking luster',
    bestFor: 'Classical Cabinets, Entrance Frames',
    swatchColor: '#7b241c',
  },
  {
    name: 'Birch Plywood & Veneer',
    density: 'Cross-Laminated Baltic Ply',
    grain: 'Smooth uniform core with architectural veneer face',
    bestFor: 'Modular Kitchen Carcases, Walk-in Partitions',
    swatchColor: '#e0cda9',
  },
];

const FINISH_OPTIONS: Array<{ name: FinishType; desc: string; look: string }> = [
  { name: 'Natural Matte Oil', desc: 'Zero gloss organic oil penetrating deep into wood pores.', look: 'Natural & Tactile' },
  { name: 'Satin Polyurethane (PU)', desc: 'Silky 30% sheen with heavy water and scratch barrier.', look: 'Most Popular' },
  { name: 'High Gloss PU', desc: 'Italian mirror-like reflection with multi-coat clear lacquer.', look: 'Ultra Luxury' },
  { name: 'Dark Walnut Stain', desc: 'Deep espresso tones while accentuating natural growth rings.', look: 'Classic Heritage' },
  { name: 'Distressed Vintage', desc: 'Hand-wire-brushed weathered patina with soft antiquing wax.', look: 'Rustic Farmhouse' },
  { name: 'Honey Oak Wax', desc: 'Warm amber glow conditioned with pure beeswax.', look: 'Warm Scandinavian' },
];

export const CustomFurnitureBuilder: React.FC<CustomFurnitureBuilderProps> = ({
  currentUser,
  onQuoteSubmitted,
  prefillProduct,
}) => {
  const [furnitureType, setFurnitureType] = useState<ProductCategory>(
    prefillProduct?.category || 'Dining Tables'
  );
  const [length, setLength] = useState<number>(prefillProduct?.dimensions?.length || 72);
  const [width, setWidth] = useState<number>(prefillProduct?.dimensions?.width || 36);
  const [height, setHeight] = useState<number>(prefillProduct?.dimensions?.height || 30);
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [selectedWood, setSelectedWood] = useState<WoodType>('American White Oak');
  const [selectedFinish, setSelectedFinish] = useState<FinishType>('Natural Matte Oil');
  const [designStyle, setDesignStyle] = useState<string>('Modern Scandinavian with tapered legs');
  const [notes, setNotes] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('$800 - $1,400');
  const [preferredDate, setPreferredDate] = useState<string>('2026-09-15');
  const [referenceImage, setReferenceImage] = useState<string>(
    prefillProduct?.images?.[0] || 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80'
  );

  // AI & Dynamic Cost Estimation
  const [estimating, setEstimating] = useState<boolean>(false);
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [quoteIdCreated, setQuoteIdCreated] = useState<string>('');

  // Calculate instant AI cost estimation whenever dimensions or wood changes
  useEffect(() => {
    const fetchEstimate = async () => {
      setEstimating(true);
      try {
        const est = await api.estimateCustomQuoteAI({
          furnitureType,
          dimensions: { length, width, height, unit },
          woodType: selectedWood,
          finishType: selectedFinish,
          notes,
        });
        setAiEstimate(est);
      } catch (err) {
        console.error('Estimation error:', err);
      } finally {
        setEstimating(false);
      }
    };

    const timer = setTimeout(fetchEstimate, 400);
    return () => clearTimeout(timer);
  }, [furnitureType, length, width, height, unit, selectedWood, selectedFinish]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const created = await api.requestCustomFurniture({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone,
        furnitureType,
        dimensions: { length, width, height, unit },
        woodType: selectedWood,
        finishType: selectedFinish,
        designStyle,
        referenceImageUrl: referenceImage,
        notes: `${notes}. (Estimated price guide: $${aiEstimate?.estimatedTotal || 1100})`,
        budgetRange,
        preferredDeliveryDate: preferredDate,
      });

      setQuoteIdCreated(created.quoteNumber);
      setSubmittedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#78350f', '#b45309', '#f59e0b', '#d97706'],
      });
      onQuoteSubmitted();
    } catch (err) {
      console.error('Failed to submit quote:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="custom-furniture-builder-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
          <span>Interactive 3D Dimensional Customizer & AI Joinery Estimator</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#291e14]">
          Bespoke Custom Furniture Studio
        </h2>
        <p className="text-sm text-[#6e5d52] mt-2 leading-relaxed">
          Specify your exact room dimensions, select hand-picked seasoned timber species, choose artisanal edge details, and receive an instant AI quotation verified by our master carpenter.
        </p>
      </div>

      {submittedSuccess ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#bbf7d0] p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
            Quotation Request Received
          </span>
          <h3 className="text-2xl font-serif font-bold text-[#291e14] mt-1">
            Quote #{quoteIdCreated} Submitted!
          </h3>
          <p className="text-xs text-[#57483f] mt-2 max-w-md mx-auto leading-relaxed">
            Master Craftsman Arthur Vance is reviewing your dimensional requirements for custom <strong>{selectedWood} {furnitureType}</strong>. You will receive an email and in-app quotation notification with a detailed bill of materials.
          </p>

          <div className="mt-6 p-4 bg-[#fdfbf7] rounded-2xl border border-[#f0eae1] text-xs text-left space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-[#8c7e75]">Furniture:</span>
              <span className="font-semibold text-[#291e14]">{furnitureType} ({selectedWood})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8c7e75]">Dimensions:</span>
              <span className="font-semibold text-[#291e14]">{length}"L × {width}"W × {height}"H</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8c7e75]">Estimated Range:</span>
              <span className="font-semibold text-[#92400e]">${aiEstimate?.estimatedTotal ? (aiEstimate.estimatedTotal - 100) + ' - $' + (aiEstimate.estimatedTotal + 150) : '$1,100 - $1,400'}</span>
            </div>
          </div>

          <button
            onClick={() => setSubmittedSuccess(false)}
            className="mt-6 px-6 py-2.5 bg-[#78350f] text-white text-xs font-semibold rounded-xl hover:bg-[#5c280a]"
          >
            Create Another Custom Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitQuote} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Columns: Configurator Steps */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Furniture Category */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#78350f] text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="text-base font-serif font-bold text-[#291e14]">
                  Select Furniture Type
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FURNITURE_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setFurnitureType(type)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      furnitureType === type
                        ? 'bg-[#78350f] text-white border-[#78350f] shadow-xs'
                        : 'bg-[#fdfbf7] text-[#57483f] border-[#e7dfd5] hover:bg-[#f3ede2]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Dimensions */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#78350f] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#291e14]">
                    Custom Dimensions
                  </h3>
                </div>

                <div className="flex items-center bg-[#f3ede2] p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setUnit('inches')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      unit === 'inches' ? 'bg-[#78350f] text-white' : 'text-[#6e5d52]'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      unit === 'cm' ? 'bg-[#78350f] text-white' : 'text-[#6e5d52]'
                    }`}
                  >
                    Centimeters
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Length */}
                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Length ({unit}):
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="180"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-sm font-bold text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                  <input
                    type="range"
                    min="24"
                    max="120"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full accent-[#78350f] mt-2"
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Width / Depth ({unit}):
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-sm font-bold text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                  <input
                    type="range"
                    min="12"
                    max="60"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full accent-[#78350f] mt-2"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Height ({unit}):
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="120"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-sm font-bold text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                  <input
                    type="range"
                    min="12"
                    max="96"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-[#78350f] mt-2"
                  />
                </div>
              </div>

              {/* Volume preview */}
              <div className="mt-4 p-3 bg-[#f7f3eb] rounded-xl flex items-center justify-between text-xs text-[#57483f]">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#b45309]" />
                  <span>Calculated Footprint: <strong>{((length * width) / 144).toFixed(1)} sq. ft</strong></span>
                </div>
                <span className="font-semibold text-[#78350f]">
                  Est. Raw Timber: ~{aiEstimate?.boardFeet || 35} Board Feet
                </span>
              </div>
            </div>

            {/* Step 3: Wood Species */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#78350f] text-white text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h3 className="text-base font-serif font-bold text-[#291e14]">
                  Select Hardwood / Wood Species
                </h3>
              </div>

              <div className="space-y-2.5">
                {WOOD_OPTIONS.map((wood) => (
                  <div
                    key={wood.name}
                    onClick={() => setSelectedWood(wood.name)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      selectedWood === wood.name
                        ? 'bg-[#fdf3e7] border-[#b45309] shadow-xs'
                        : 'bg-[#fdfbf7] border-[#e7dfd5] hover:bg-[#f3ede2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-black/20 shadow-2xs shrink-0"
                        style={{ backgroundColor: wood.swatchColor }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#291e14]">{wood.name}</p>
                          <span className="text-[10px] text-[#786b62] bg-[#ede5d8] px-2 py-0.5 rounded-full">
                            {wood.density}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6e5d52] mt-0.5">{wood.grain}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {selectedWood === wood.name ? (
                        <CheckCircle2 className="w-5 h-5 text-[#b45309]" />
                      ) : (
                        <span className="text-[11px] text-[#8c7e75]">Select</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Finish & Polish */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7dfd5] shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#78350f] text-white text-xs font-bold flex items-center justify-center">
                  4
                </div>
                <h3 className="text-base font-serif font-bold text-[#291e14]">
                  Surface Finish & Protective Coating
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FINISH_OPTIONS.map((f) => (
                  <div
                    key={f.name}
                    onClick={() => setSelectedFinish(f.name)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedFinish === f.name
                        ? 'bg-[#78350f] text-white border-[#78350f] shadow-xs'
                        : 'bg-[#fdfbf7] text-[#443831] border-[#e7dfd5] hover:bg-[#f3ede2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold">{f.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        selectedFinish === f.name ? 'bg-white/20 text-white' : 'bg-[#e7dfd5] text-[#57483f]'
                      }`}>
                        {f.look}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${
                      selectedFinish === f.name ? 'text-[#fef3c7]' : 'text-[#6e5d52]'
                    }`}>
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Reference Image, Budget & Notes */}
            <div className="bg-white p-6 rounded-2xl border border-[#e7dfd5] shadow-xs space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#78350f] text-white text-xs font-bold flex items-center justify-center">
                  5
                </div>
                <h3 className="text-base font-serif font-bold text-[#291e14]">
                  Design References & Special Instructions
                </h3>
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Design Style & Special Inlays:
                </label>
                <input
                  type="text"
                  value={designStyle}
                  onChange={(e) => setDesignStyle(e.target.value)}
                  placeholder="e.g. Mid-Century with brass inlay, live edge butterfly keys, floating drawers..."
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Reference Image URL / Photo Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                </div>
                {referenceImage && (
                  <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-[#dfd4c5]">
                    <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Your Target Budget:
                  </label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. $900 - $1,500"
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Preferred Delivery Date:
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Detailed Joinery / Room Fit Notes:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention room wall constraints, concealed cable pass-throughs, child safety rounded edges..."
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs text-[#291e14] focus:outline-hidden focus:border-[#78350f]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time AI Joinery & Cost Estimation Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 bg-white rounded-3xl border border-[#e7dfd5] p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#f0eae1]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#b45309]" />
                  <h3 className="text-lg font-serif font-bold text-[#291e14]">
                    AI Engineering Estimate
                  </h3>
                </div>
                {estimating ? (
                  <span className="text-[11px] text-[#b45309] font-bold animate-pulse">
                    Calculating...
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-[#dcfce7] text-[#15803d] text-[10px] font-bold rounded-full">
                    Instant Guide
                  </span>
                )}
              </div>

              {/* Estimate Total */}
              <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#f0eae1] text-center">
                <span className="text-xs text-[#8c7e75] font-medium">Estimated Build Range</span>
                <div className="text-3xl font-serif font-bold text-[#92400e] mt-1">
                  ${aiEstimate?.estimatedTotal ? (aiEstimate.estimatedTotal - 70).toLocaleString() + ' - $' + (aiEstimate.estimatedTotal + 120).toLocaleString() : '$1,150 - $1,450'}
                </div>
                <p className="text-[11px] text-[#6e5d52] mt-1">
                  Includes raw {selectedWood} lumber, master labor, 3-coat {selectedFinish}, and delivery.
                </p>
              </div>

              {/* Breakdown List */}
              <div className="space-y-3 text-xs">
                <p className="font-bold text-[#291e14] uppercase tracking-wider text-[10px]">
                  Estimated Cost Breakdown:
                </p>

                <div className="flex justify-between text-[#57483f]">
                  <span>{selectedWood} Timber ({aiEstimate?.boardFeet || 35} bd. ft):</span>
                  <span className="font-bold text-[#291e14]">
                    ${aiEstimate?.materialCost ? aiEstimate.materialCost : '580'}
                  </span>
                </div>

                <div className="flex justify-between text-[#57483f]">
                  <span>Master Joinery & Mortise Labor:</span>
                  <span className="font-bold text-[#291e14]">
                    ${aiEstimate?.laborCost ? aiEstimate.laborCost : '420'}
                  </span>
                </div>

                <div className="flex justify-between text-[#57483f]">
                  <span>Finish Application ({selectedFinish}):</span>
                  <span className="font-bold text-[#291e14]">
                    ${aiEstimate?.finishCost ? aiEstimate.finishCost : '95'}
                  </span>
                </div>

                <div className="flex justify-between text-[#57483f]">
                  <span>White-Glove Delivery & Positioning:</span>
                  <span className="font-bold text-[#291e14]">
                    ${aiEstimate?.deliveryCost ? aiEstimate.deliveryCost : '60'}
                  </span>
                </div>
              </div>

              {/* Joinery Recommendation */}
              {aiEstimate?.joineryRecommendation && (
                <div className="p-3.5 bg-[#f7f3eb] rounded-xl border border-[#e7dfd5] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#78350f]">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Master Joiner's Recommendation:</span>
                  </div>
                  <p className="text-[11px] text-[#57483f] leading-relaxed">
                    {aiEstimate.joineryRecommendation}
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                id="submit-custom-quote-btn"
                disabled={submitting}
                className="w-full py-4 px-6 bg-[#78350f] hover:bg-[#5c280a] text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting to Workshop...' : 'Request Official Formal Quotation'}</span>
              </button>

              <p className="text-[11px] text-center text-[#8c7e75]">
                🔒 No payment required now. Our master craftsman will review your measurements and send an itemized bill of materials for your approval.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
