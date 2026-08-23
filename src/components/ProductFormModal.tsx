import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  TreePine,
  DollarSign,
  IndianRupee,
  Package,
  Layers,
  Ruler,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Product, ProductCategory, WoodType } from '../types';
import { api } from '../services/api';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit: Product | null;
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
}

const WOOD_OPTIONS: Array<{ name: string; desc: string }> = [
  { name: 'Burma Teak', desc: 'Grade-A golden timber, supreme natural weather & water resistance' },
  { name: 'American White Oak', desc: 'Dense, dramatic cathedral grain, superior impact durability' },
  { name: 'Walnut', desc: 'Deep chocolate tone, luxurious dark grain with silky tactile finish' },
  { name: 'Indian Sheesham (Rosewood)', desc: 'Heavy heartwood with contrasting rich interlocking grain' },
  { name: 'Mahogany', desc: 'Rich reddish-amber luster with classic heirloom chatoyancy' },
  { name: 'Pine Wood', desc: 'Lightweight Scandinavian pale gold timber with rustic warmth' },
  { name: 'Birch Plywood & Veneer', desc: 'Multi-ply engineered Baltic core with solid hardwood edging' },
];

const CATEGORIES: ProductCategory[] = [
  'Dining Tables',
  'Beds',
  'Sofas',
  'Chairs',
  'Wardrobes',
  'TV Units',
  'Kitchen Cabinets',
  'Office Furniture',
  'Doors & Windows',
  'Custom Furniture',
];

const SAMPLE_PRESET_IMAGES = [
  {
    label: 'Teak Dining Table',
    wood: 'Burma Teak',
    url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'White Oak Platform Bed',
    wood: 'American White Oak',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Walnut Media Credenza',
    wood: 'Walnut',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sheesham Wardrobe',
    wood: 'Indian Sheesham (Rosewood)',
    url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Artisan Armchair',
    wood: 'American White Oak',
    url: 'https://images.unsplash.com/photo-1580481077197-0f81c9be4126?w=1000&auto=format&fit=crop&q=80',
  },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(productToEdit);

  // Core Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Dining Tables');
  const [woodType, setWoodType] = useState<string>('Burma Teak');
  const [customWood, setCustomWood] = useState('');
  const [price, setPrice] = useState<number>(38000);
  const [originalPrice, setOriginalPrice] = useState<number>(48000);
  const [stockCount, setStockCount] = useState<number>(5);
  const [inStock, setInStock] = useState<boolean>(true);
  const [deliveryDays, setDeliveryDays] = useState<number>(10);

  // Dimensions
  const [dimLength, setDimLength] = useState<number>(60);
  const [dimWidth, setDimWidth] = useState<number>(36);
  const [dimHeight, setDimHeight] = useState<number>(30);
  const [dimUnit, setDimUnit] = useState<'inches' | 'cm'>('inches');

  // Descriptions
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [materials, setMaterials] = useState<string[]>(['Kiln-Dried Solid Hardwood', 'German Steel Hardware']);
  const [finishes, setFinishes] = useState<string[]>(['Natural Matte Oil', 'Satin Polyurethane', 'Dark Walnut Stain']);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'camera' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // AI Description Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate data when modal opens or productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategory(productToEdit.category || 'Dining Tables');
      const foundWood = WOOD_OPTIONS.find((w) => w.name === productToEdit.woodType);
      if (foundWood) {
        setWoodType(productToEdit.woodType || 'Burma Teak');
        setCustomWood('');
      } else if (productToEdit.woodType) {
        setWoodType('Custom');
        setCustomWood(productToEdit.woodType);
      } else {
        // Check materials
        const matWood = WOOD_OPTIONS.find((w) => productToEdit.materials?.some((m) => m.includes(w.name)));
        if (matWood) {
          setWoodType(matWood.name);
        } else {
          setWoodType('Burma Teak');
        }
      }

      setPrice(productToEdit.price || 0);
      setOriginalPrice(productToEdit.originalPrice || Math.round((productToEdit.price || 0) * 1.25));
      setStockCount(productToEdit.stockCount ?? 5);
      setInStock(productToEdit.inStock ?? true);
      setDeliveryDays(productToEdit.estimatedDeliveryDays ?? 10);

      if (productToEdit.dimensions) {
        setDimLength(productToEdit.dimensions.length || 60);
        setDimWidth(productToEdit.dimensions.width || 36);
        setDimHeight(productToEdit.dimensions.height || 30);
        setDimUnit(productToEdit.dimensions.unit || 'inches');
      }

      setDescription(productToEdit.description || '');
      setShortDescription(productToEdit.shortDescription || '');
      setCareInstructions(productToEdit.careInstructions || '');
      setMaterials(productToEdit.materials?.length ? productToEdit.materials : ['Solid Hardwood', 'German Steel Hardware']);
      setFinishes(productToEdit.finishes?.length ? productToEdit.finishes : ['Natural Matte Oil', 'Satin Polyurethane']);
      setImages(productToEdit.images?.length ? [...productToEdit.images] : [SAMPLE_PRESET_IMAGES[0].url]);
    } else {
      // New product defaults
      setName('');
      setCategory('Dining Tables');
      setWoodType('Burma Teak');
      setCustomWood('');
      setPrice(850);
      setOriginalPrice(1050);
      setStockCount(5);
      setInStock(true);
      setDeliveryDays(10);
      setDimLength(60);
      setDimWidth(36);
      setDimHeight(30);
      setDimUnit('inches');
      setDescription('Handcrafted in kiln-dried solid timber with traditional mortise-and-tenon joinery and organic hand-rubbed finish.');
      setShortDescription('Artisan solid timber piece with reinforced joinery and smooth tactile finish.');
      setCareInstructions('Dust regularly with a dry soft cloth. Condition with natural wood wax twice a year.');
      setMaterials(['Kiln-Dried Burma Teak', 'German Steel Hardware', 'Non-Toxic Matte Protective Sealant']);
      setFinishes(['Natural Matte Oil', 'Satin Polyurethane', 'Dark Walnut Stain']);
      setImages([SAMPLE_PRESET_IMAGES[0].url]);
    }
    setAiGeneratedSuccess(false);
    setCapturedSnapshot(null);
    stopCamera();
  }, [productToEdit, isOpen]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setCapturedSnapshot(null);

    // Stop any existing stream first
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera stream is not supported in this browser context. You can use the Native Device Camera / Upload button below.');
        setIsCameraActive(false);
        return;
      }

      // Try with facingMode constraint first, fallback to basic video if constraint fails
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (constraintErr: any) {
        if (constraintErr?.name === 'OverconstrainedError' || constraintErr?.name === 'ConstraintNotSatisfiedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } else {
          throw constraintErr;
        }
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      setFacingMode(targetFacing);
    } catch (err: any) {
      const errName = err?.name || '';
      const errMsg = String(err?.message || '');

      if (errName === 'NotAllowedError' || errMsg.includes('dismissed') || errMsg.includes('denied') || errName === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was dismissed or not granted. You can grant access and retry, or use the Native Device Camera / File Upload button below.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError('No camera device detected. Please use the File Upload option.');
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraError('Camera is already in use by another app or browser tab. Please close other camera apps and retry.');
      } else {
        setCameraError(errMsg || 'Unable to start camera stream. Please use the Device Camera / File Upload option.');
      }
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedSnapshot(dataUrl);
    }
  };

  const acceptCapturedPhoto = () => {
    if (capturedSnapshot) {
      setImages((prev) => [capturedSnapshot, ...prev.filter((i) => i !== capturedSnapshot)]);
      setCapturedSnapshot(null);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          setImages((prev) => [result, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (urlInput.trim()) {
      setImages((prev) => [urlInput.trim(), ...prev]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
  };

  const effectiveWood = woodType === 'Custom' ? customWood || 'Solid Hardwood' : woodType;

  // AI Description Generator based on Image & Wood Species
  const handleGenerateAIDescription = async () => {
    setIsGeneratingAI(true);
    setAiGeneratedSuccess(false);
    try {
      const primaryImage = images[0] || '';
      const res = await api.describeFurnitureImage({
        image: primaryImage,
        woodType: effectiveWood,
        category,
        title: name || `Solid ${effectiveWood} ${category}`,
      });

      if (res) {
        if (res.description) setDescription(res.description);
        if (res.shortDescription) setShortDescription(res.shortDescription);
        if (res.careInstructions) setCareInstructions(res.careInstructions);
        if (res.materials?.length) setMaterials(res.materials);
        if (res.suggestedTitle && !name) {
          setName(res.suggestedTitle);
        }
        setAiGeneratedSuccess(true);
      }
    } catch (err) {
      console.error('AI Description error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please add at least one product photo (upload, camera snapshot, or URL).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim() || `Solid ${effectiveWood} ${category}`,
        category,
        woodType: effectiveWood,
        price: Number(price),
        originalPrice: Number(originalPrice) || Math.round(Number(price) * 1.25),
        stockCount: Number(stockCount),
        inStock: Number(stockCount) > 0 && inStock,
        estimatedDeliveryDays: Number(deliveryDays) || 10,
        description: description.trim(),
        shortDescription: shortDescription.trim() || description.slice(0, 100),
        dimensions: {
          length: Number(dimLength),
          width: Number(dimWidth),
          height: Number(dimHeight),
          unit: dimUnit,
        },
        materials: materials.length ? materials : [`Kiln-Dried Solid ${effectiveWood}`, 'German Hardware'],
        finishes: finishes.length ? finishes : ['Natural Matte Oil', 'Satin Polyurethane'],
        images: images,
        careInstructions: careInstructions.trim(),
      };

      if (!isEditing) {
        payload.sku = `WC-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.rating = 5.0;
        payload.reviewCount = 1;
        payload.featured = true;
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please check form values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#e7dfd5] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#f0eae1] flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#78350f] text-white flex items-center justify-center font-bold">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#291e14]">
                {isEditing ? 'Edit Furniture Piece & Pricing' : 'Add Handcrafted Piece to Catalog'}
              </h3>
              <p className="text-xs text-[#8c7e75]">
                Configure wood species, take/upload photos, update pricing, and generate AI descriptions.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-[#8c7e75] hover:bg-[#f3ede2] hover:text-[#291e14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Basic Info & Wood Species */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#78350f] uppercase tracking-wider">
              <Package className="w-4 h-4" />
              <span>1. Product Identity & Wood Species</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="text-xs font-bold text-[#291e14] block mb-1.5">
                  Product Title <span className="text-[#dc2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Burma Teak Handcrafted Live-Edge Dining Table"
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#78350f]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-bold text-[#291e14] block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#78350f]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wood Species Field (Requested by User) */}
            <div className="p-4 bg-[#fbf8f2] rounded-2xl border border-[#ede3d5] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#291e14] flex items-center gap-1.5">
                  <TreePine className="w-4 h-4 text-[#78350f]" />
                  <span>Wood Species Used in this Piece <span className="text-[#dc2626]">*</span></span>
                </label>
                <span className="text-[11px] font-semibold text-[#78350f]">
                  Active: <strong>{effectiveWood}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WOOD_OPTIONS.map((wood) => {
                  const isSelected = woodType === wood.name;
                  return (
                    <button
                      key={wood.name}
                      type="button"
                      onClick={() => setWoodType(wood.name)}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#78350f] text-white border-[#78350f] shadow-xs'
                          : 'bg-white text-[#4a3b32] border-[#e2d7c9] hover:bg-[#f5ede2]'
                      }`}
                    >
                      <span className="font-bold">{wood.name}</span>
                      <span
                        className={`text-[10px] line-clamp-1 mt-1 ${
                          isSelected ? 'text-[#fde68a]' : 'text-[#8c7e75]'
                        }`}
                      >
                        {wood.desc.split(',')[0]}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setWoodType('Custom')}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                    woodType === 'Custom'
                      ? 'bg-[#78350f] text-white border-[#78350f] shadow-xs'
                      : 'bg-white text-[#4a3b32] border-[#e2d7c9] hover:bg-[#f5ede2]'
                  }`}
                >
                  <span className="font-bold">Custom Timber</span>
                  <span
                    className={`text-[10px] line-clamp-1 mt-1 ${
                      woodType === 'Custom' ? 'text-[#fde68a]' : 'text-[#8c7e75]'
                    }`}
                  >
                    Specify custom lumber
                  </span>
                </button>
              </div>

              {woodType === 'Custom' && (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-[#57483f] block mb-1">
                    Custom Wood Species Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customWood}
                    onChange={(e) => setCustomWood(e.target.value)}
                    placeholder="e.g. African Padauk / Reclaimed Heart Pine"
                    className="w-full p-2 bg-white border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Photo Upload & Camera Capture (Requested by User) */}
          <div className="space-y-4 pt-2 border-t border-[#f0eae1]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#78350f] uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" />
                <span>2. Product Images (Upload / Take Camera Snapshot / URL)</span>
              </div>
              <span className="text-xs text-[#8c7e75] font-semibold">
                {images.length} {images.length === 1 ? 'photo' : 'photos'} attached
              </span>
            </div>

            {/* Input Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-[#f5efe6] rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setImageInputMode('upload');
                  stopCamera();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  imageInputMode === 'upload'
                    ? 'bg-[#78350f] text-white shadow-xs'
                    : 'text-[#6e5d52] hover:text-[#291e14]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>

              <button
                type="button"
                onClick={() => {
                  setImageInputMode('camera');
                  startCamera();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  imageInputMode === 'camera'
                    ? 'bg-[#78350f] text-white shadow-xs'
                    : 'text-[#6e5d52] hover:text-[#291e14]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Take Picture (Camera)
              </button>

              <button
                type="button"
                onClick={() => {
                  setImageInputMode('url');
                  stopCamera();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  imageInputMode === 'url'
                    ? 'bg-[#78350f] text-white shadow-xs'
                    : 'text-[#6e5d52] hover:text-[#291e14]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Presets & URL
              </button>
            </div>

            {/* Tab 1: Upload File */}
            {imageInputMode === 'upload' && (
              <div className="border-2 border-dashed border-[#dfd4c5] hover:border-[#78350f] rounded-2xl p-6 text-center bg-[#fdfbf7] transition-all">
                <input
                  type="file"
                  id="product-photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="product-photo-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-[#f3ede2] text-[#78350f] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#291e14]">
                      Click to choose pictures from your device or drag & drop
                    </p>
                    <p className="text-[11px] text-[#8c7e75] mt-0.5">
                      Supports JPG, PNG, WEBP high-resolution photos
                    </p>
                  </div>
                  <span className="mt-2 px-4 py-1.5 bg-[#78350f] text-white text-xs font-bold rounded-xl hover:bg-[#5c280a]">
                    Browse Files
                  </span>
                </label>
              </div>
            )}

            {/* Tab 2: Take Picture (Direct Camera Capture) */}
            {imageInputMode === 'camera' && (
              <div className="bg-[#1c1917] rounded-2xl p-4 text-white space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
                  <span className="font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#fde68a]" /> Workshop Camera & Viewfinder
                  </span>
                  <div className="flex items-center gap-2">
                    {isCameraActive && (
                      <>
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                          title="Switch between front and back camera"
                        >
                          <RotateCcw className="w-3 h-3" /> Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})
                        </button>
                        <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live Stream
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Option: Native Device Camera */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#fde68a]">Fastest on Mobile & Tablets:</p>
                    <p className="text-[11px] text-stone-300">Open your device's built-in camera app directly to snap a photo.</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="native-device-camera-input"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="native-device-camera-input"
                      className="px-3.5 py-1.5 bg-[#fde68a] hover:bg-[#fcd34d] text-[#78350f] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all whitespace-nowrap"
                    >
                      <Camera className="w-3.5 h-3.5" /> Launch Device Camera
                    </label>
                  </div>
                </div>

                {cameraError ? (
                  <div className="p-4 bg-amber-950/70 border border-amber-800/80 rounded-xl text-xs space-y-2.5">
                    <div className="flex items-start gap-2 text-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="font-medium leading-relaxed">{cameraError}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => startCamera(facingMode)}
                        className="px-3.5 py-1.5 bg-[#fde68a] hover:bg-[#fcd34d] text-[#78350f] rounded-xl font-bold transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Grant / Retry Stream
                      </button>
                      <label
                        htmlFor="native-device-camera-input"
                        className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" /> Use Native Camera
                      </label>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-stone-300 rounded-xl font-medium transition-colors"
                      >
                        Switch to File Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-16/9 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className={`w-full h-full object-contain ${capturedSnapshot ? 'hidden' : 'block'}`}
                      />
                      {capturedSnapshot && (
                        <img
                          src={capturedSnapshot}
                          alt="Captured preview"
                          className="w-full h-full object-contain"
                        />
                      )}
                      <canvas ref={canvasRef} className="hidden" />

                      {!isCameraActive && !capturedSnapshot && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-stone-900/90 gap-2">
                          <Camera className="w-8 h-8 text-stone-500" />
                          <p className="text-xs text-stone-300">Live viewfinder is ready</p>
                          <button
                            type="button"
                            onClick={() => startCamera(facingMode)}
                            className="px-4 py-2 bg-[#fde68a] hover:bg-[#fcd34d] text-[#78350f] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                          >
                            <Camera className="w-4 h-4" /> Start Live Viewfinder
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-1">
                      {!capturedSnapshot ? (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={!isCameraActive}
                          className="px-6 py-2.5 bg-[#fde68a] text-[#78350f] text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Camera className="w-4 h-4" /> Snap Photo Now
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCapturedSnapshot(null);
                              startCamera(facingMode);
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Retake
                          </button>
                          <button
                            type="button"
                            onClick={acceptCapturedPhoto}
                            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> Use This Photo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: URL & Workshop Presets */}
            {imageInputMode === 'url' && (
              <div className="space-y-4 bg-[#fdfbf7] p-4 rounded-2xl border border-[#dfd4c5]">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste image web link (https://...)"
                    className="flex-1 p-2 bg-white border border-[#dfd4c5] rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="px-4 py-2 bg-[#78350f] text-white text-xs font-bold rounded-xl"
                  >
                    Add Image
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#8c7e75] block mb-2">
                    Or select from Workshop High-Res Samples:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SAMPLE_PRESET_IMAGES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImages((prev) => [sample.url, ...prev.filter((i) => i !== sample.url)]);
                          if (woodType === 'Burma Teak' && sample.wood) {
                            setWoodType(sample.wood);
                          }
                        }}
                        className="group relative rounded-xl overflow-hidden border border-[#e7dfd5] text-left aspect-4/3 hover:border-[#78350f] transition-all"
                      >
                        <img src={sample.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[9px] p-1 font-bold line-clamp-1">
                          {sample.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attached Images Gallery & Management */}
            {images.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#291e14] block">
                  Current Product Gallery ({images.length} Images):
                </label>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 group shadow-xs ${
                        idx === 0 ? 'border-[#78350f] ring-2 ring-[#78350f]/20' : 'border-[#e7dfd5]'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#78350f] text-white text-[8px] font-bold rounded-md uppercase">
                          Primary
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            title="Set as primary"
                            className="p-1 bg-white text-[#78350f] rounded-md hover:bg-yellow-100"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Delete photo"
                          className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. AI Description Generator (Requested by User) */}
          <div className="space-y-4 pt-2 border-t border-[#f0eae1]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#78350f] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>3. AI Craftsmanship Description & Content</span>
              </div>

              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI}
                className="px-4 py-2 bg-linear-to-r from-[#78350f] to-[#92400e] text-[#fef3c7] hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#fde68a]" />
                    <span>Analyzing Image & Wood Grain...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#fde68a]" />
                    <span>✨ Generate AI Description from Photo & Wood</span>
                  </>
                )}
              </button>
            </div>

            {aiGeneratedSuccess && (
              <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-xs text-[#166534] flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#16a34a]" />
                <span>
                  <strong>AI Craftsman Description Generated!</strong> It has been loaded below. Feel free to keep it, edit it, or rewrite any details before saving.
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Full Catalog Description <span className="text-[#8c7e75] font-normal">(Keep as is or rewrite freely)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed craftsmanship narrative detailing timber grain, joinery durability, and finish..."
                  className="w-full p-3 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs leading-relaxed focus:outline-none focus:border-[#78350f]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Short Summary (Card Preview)
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Concise 1-sentence punchy summary"
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#291e14] block mb-1">
                    Timber Care Instructions
                  </label>
                  <input
                    type="text"
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    placeholder="e.g. Dust with dry cloth, polish with beeswax once a year."
                    className="w-full p-2.5 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Pricing, Stock & Dimensions */}
          <div className="space-y-4 pt-2 border-t border-[#f0eae1]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#78350f] uppercase tracking-wider">
              <IndianRupee className="w-4 h-4" />
              <span>4. Pricing, Stock & Physical Dimensions</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Sale Price (₹) <span className="text-[#dc2626]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8c7e75] font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-bold text-[#291e14]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Original / MSRP (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8c7e75] font-bold">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-semibold text-[#8c7e75]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockCount}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    setStockCount(count);
                    setInStock(count > 0);
                  }}
                  className="w-full p-2 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#291e14] block mb-1">
                  Delivery Lead Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="w-full pr-10 pl-3 py-2 bg-[#fdfbf7] border border-[#dfd4c5] rounded-xl text-xs font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-[#8c7e75] font-bold">days</span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#dfd4c5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#291e14] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#78350f]" /> Dimensions ({dimUnit})
                </span>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDimUnit('inches')}
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      dimUnit === 'inches' ? 'bg-[#78350f] text-white' : 'text-[#8c7e75]'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setDimUnit('cm')}
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      dimUnit === 'cm' ? 'bg-[#78350f] text-white' : 'text-[#8c7e75]'
                    }`}
                  >
                    Centimeters
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-[#8c7e75] font-semibold block mb-0.5">Length</label>
                  <input
                    type="number"
                    value={dimLength}
                    onChange={(e) => setDimLength(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8c7e75] font-semibold block mb-0.5">Width / Depth</label>
                  <input
                    type="number"
                    value={dimWidth}
                    onChange={(e) => setDimWidth(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8c7e75] font-semibold block mb-0.5">Height</label>
                  <input
                    type="number"
                    value={dimHeight}
                    onChange={(e) => setDimHeight(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-[#dfd4c5] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#f0eae1] flex items-center justify-between">
            <div className="text-xs text-[#8c7e75]">
              {isEditing ? 'Editing existing product' : 'Creating new product item'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2.5 bg-[#f5efe6] hover:bg-[#ede5d8] text-[#57483f] text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#78350f] hover:bg-[#5c280a] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Catalog...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'Update & Save Catalog Item' : 'Save to Catalog'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
