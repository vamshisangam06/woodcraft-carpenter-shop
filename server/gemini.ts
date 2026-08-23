import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY is not set. Utilizing internal master carpentry knowledge engine.');
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.warn('[Gemini] Client initialization error, fallback activated:', err);
    return null;
  }
}

export interface CustomQuoteEstimationParams {
  furnitureType: string;
  dimensions: { length: number; width: number; height: number; unit: string };
  woodType: string;
  finishType: string;
  notes?: string;
}

// Helper for transient error retry
async function tryWithModels<T>(
  models: string[],
  action: (model: string) => Promise<T>
): Promise<T | null> {
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      return await action(model);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (isTransient) {
        console.warn(`[Gemini API] ${model} transient status (${isTransient ? '503/429 high demand' : 'error'}), trying next fallback.`);
        if (i < models.length - 1) {
          // Short delay before next model
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
      } else {
        console.warn(`[Gemini API] Error calling model ${model}:`, errMsg);
      }
    }
  }
  return null;
}

// Master carpentry heuristic generator
function generateCarpentryEstimation(params: CustomQuoteEstimationParams) {
  const l = Number(params.dimensions.length) || 48;
  const w = Number(params.dimensions.width) || 24;
  const h = Number(params.dimensions.height) || 30;
  const isMetric = params.dimensions.unit === 'cm';

  const lengthInches = isMetric ? l / 2.54 : l;
  const widthInches = isMetric ? w / 2.54 : w;
  const heightInches = isMetric ? h / 2.54 : h;

  // Approximate solid timber board footage based on surface area & structural members
  let surfaceAreaSqInches = 2 * (lengthInches * widthInches + lengthInches * heightInches + widthInches * heightInches);
  let boardFeet = Math.max(14, Math.round((surfaceAreaSqInches * 0.85) / 144));

  const woodRates: Record<string, { rate: number; stability: string; notes: string }> = {
    'Burma Teak': {
      rate: 19.5,
      stability: 'Very High (High natural silica & essential teak oils)',
      notes: 'Natural resistance to moisture, termites, and dry rot. Ideal for high-humidity & heavy daily usage.',
    },
    'American White Oak': {
      rate: 15.0,
      stability: 'High (Tyloses block water absorption)',
      notes: 'Dense cathedral grain patterns with superb mechanical strength. Excellent for mortise-and-tenon joints.',
    },
    'Walnut': {
      rate: 18.0,
      stability: 'High (Moderate dimensional shrinkage)',
      notes: 'Deep chocolate sapwood tones with luxurious dark grain. Machine-surfaced and sealed for heirloom pieces.',
    },
    'Indian Sheesham (Rosewood)': {
      rate: 15.5,
      stability: 'High (Extremely dense hardwood)',
      notes: 'Striking interlocking grain with rich contrast. Highly resistant to natural bending and scratching.',
    },
    'Pine Wood': {
      rate: 8.0,
      stability: 'Moderate (Softwood with quick acclimation)',
      notes: 'Lightweight rustic aesthetic. Kiln-dried to 9% moisture content to prevent sap leakage.',
    },
    'Mahogany': {
      rate: 16.5,
      stability: 'Very High (Minimal wood movement)',
      notes: 'Classic reddish-brown luster with ribbon curls. Outstanding workability for fine hand-chiseled detailing.',
    },
    'Birch Plywood & Veneer': {
      rate: 9.5,
      stability: 'Exceptional (Cross-banded ply prevents warping)',
      notes: 'Multi-ply core with real hardwood face veneer. Perfect for internal carcase boxes and drawer bottoms.',
    },
  };

  const woodInfo = woodRates[params.woodType] || woodRates['American White Oak'];
  const materialBase = Math.round(boardFeet * woodInfo.rate * 1.35 + 85);
  const laborBase = Math.round(materialBase * 0.72 + 140);
  const finishBase = Math.round(boardFeet * 2.8 + 45);
  const deliveryCost = 60;
  const total = materialBase + laborBase + finishBase + deliveryCost;

  let joineryTip = 'Precision mortise & tenon structural joints with floating tenons and hidden reinforcement';
  const fType = (params.furnitureType || '').toLowerCase();
  if (fType.includes('table')) {
    joineryTip = 'Tabletop secured via expansion Z-clips to allow seasonal cross-grain timber movement; apron joined with double mortise-and-tenon.';
  } else if (fType.includes('bed')) {
    joineryTip = 'Heavy-duty steel teardrop bed-rail fasteners with center support beam and interlocking solid timber slats.';
  } else if (fType.includes('wardrobe') || fType.includes('cabinet')) {
    joineryTip = 'Dovetailed hardwood drawer boxes, soft-close Blum undermount slides, and rebated back panel.';
  } else if (fType.includes('chair') || fType.includes('bench')) {
    joineryTip = 'Interlocking finger joints and drawbored oak dowels with corner glue blocks for high dynamic load resistance.';
  }

  return {
    estimatedTotal: total,
    materialCost: materialBase,
    laborCost: laborBase,
    finishCost: finishBase,
    deliveryCost,
    estimatedDays: Math.min(21, Math.max(10, Math.round(boardFeet / 3) + 7)),
    boardFeet,
    joineryRecommendation: joineryTip,
    durabilityNotes: `${params.woodType}: ${woodInfo.notes} Kiln-dried to 8-10% equilibrium moisture content.`,
    materialsBreakdown: [
      {
        item: `Kiln-Dried ${params.woodType} Lumber`,
        qty: `${boardFeet} board ft`,
        cost: Math.round(boardFeet * woodInfo.rate),
      },
      {
        item: 'Joinery Fasteners, Titebond III Waterproof Glue & Hardware',
        qty: '1 custom kit',
        cost: 65,
      },
      {
        item: `${params.finishType} Premium Protective Coat & Sealant`,
        qty: '1.2 L',
        cost: finishBase,
      },
    ],
  };
}

export async function estimateCustomFurnitureWithAI(params: CustomQuoteEstimationParams) {
  const heuristicData = generateCarpentryEstimation(params);
  const ai = getAIClient();

  if (!ai) {
    return heuristicData;
  }

  const prompt = `You are a Master Carpenter & Cost Estimator for WoodCraft Carpentry.
Analyze the following custom bespoke build request:
- Furniture Type: ${params.furnitureType}
- Dimensions: ${params.dimensions.length} x ${params.dimensions.width} x ${params.dimensions.height} ${params.dimensions.unit}
- Wood Species: ${params.woodType}
- Finish: ${params.finishType}
- Special Requirements: ${params.notes || 'Standard craftsmanship standards'}

Provide realistic pricing, board footage calculation, master joinery techniques, durability insights, and itemized materials breakdown.`;

  const aiResult = await tryWithModels(['gemini-3.7-flash', 'gemini-flash-latest'], async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedTotal: { type: Type.NUMBER },
            materialCost: { type: Type.NUMBER },
            laborCost: { type: Type.NUMBER },
            finishCost: { type: Type.NUMBER },
            deliveryCost: { type: Type.NUMBER },
            estimatedDays: { type: Type.NUMBER },
            boardFeet: { type: Type.NUMBER },
            joineryRecommendation: { type: Type.STRING },
            durabilityNotes: { type: Type.STRING },
            materialsBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  qty: { type: Type.STRING },
                  cost: { type: Type.NUMBER },
                },
                required: ['item', 'qty', 'cost'],
              },
            },
          },
          required: [
            'estimatedTotal',
            'materialCost',
            'laborCost',
            'finishCost',
            'deliveryCost',
            'estimatedDays',
            'boardFeet',
            'joineryRecommendation',
            'durabilityNotes',
            'materialsBreakdown',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (parsed && typeof parsed.estimatedTotal === 'number' && parsed.estimatedTotal > 0) {
      return parsed;
    }
    return null;
  });

  return aiResult || heuristicData;
}

// Master Arthur Vance contextual response engine
function generateMasterArthurReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('teak') || msg.includes('burma')) {
    return 'Burma Teak is the gold standard of architectural hardwoods. Because of its dense natural silica and organic oils, it is naturally waterproof and pest-resistant. For indoor dining or bedroom furniture, we recommend a 3-coat hand-rubbed Danish Oil or Natural Matte Polyurethane to let the golden honey patina develop over time.';
  }

  if (msg.includes('oak') || msg.includes('white oak')) {
    return 'American White Oak features tyloses in its cellular anatomy which closed-cell pores, making it exceptionally resistant to decay. It takes stains and reactive wood finishes beautifully. For White Oak dining tables or bed frames, we apply a hardwax oil (like Rubio Monocoat) to maintain the authentic raw-wood touch while guarding against liquid stains.';
  }

  if (msg.includes('walnut')) {
    return 'Black Walnut is prized for its dimensional stability and rich chocolate hues with smoky undertones. It machines cleanly and holds sharp crisp edges. We always recommend pairing Walnut with mortise-and-tenon joinery and sealing it with satin conversion varnish for maximum depth and protection.';
  }

  if (msg.includes('sheesham') || msg.includes('rosewood')) {
    return 'Indian Sheesham (Dalbergia sissoo) is exceptionally dense and heavy with vibrant two-tone grain streaks. It requires strict kiln-drying to 8-10% moisture content before joinery to avoid post-assembly movement. Wipe with a lint-free cloth and condition with natural beeswax twice a year.';
  }

  if (msg.includes('scratch') || msg.includes('dent') || msg.includes('damage') || msg.includes('repair')) {
    return 'For surface scratches in solid hardwood: First, clean the surface with mineral spirits. For shallow scratches, use 400-grit silicon carbide sandpaper sanding strictly along the grain, then apply matching wood touch-up stain or natural beeswax. For shallow dents, place a damp cotton cloth over the indentation and gently apply a hot household iron for 15 seconds—the steam will expand the compressed wood fibers back into place!';
  }

  if (msg.includes('moisture') || msg.includes('warp') || msg.includes('humidity') || msg.includes('water')) {
    return 'Solid wood is hygroscopic—it breathes with relative humidity. To prevent warping: Maintain 40-55% indoor humidity, keep furniture at least 3 feet away from heating vents/radiators, and ensure all tabletops have slotted screw holes or Z-clips underneath so the wood can expand and contract across its width without splitting.';
  }

  if (msg.includes('polish') || msg.includes('finish') || msg.includes('clean') || msg.includes('wax')) {
    return 'For routine care: Wipe daily with a dry or barely damp microfiber cloth. Avoid silicone-based aerosol sprays, as they build a sticky residue. Every 6-12 months, apply a thin coat of pure carnauba/beeswax paste along the wood grain and buff vigorously with a soft flannel cloth for an authentic satin sheen.';
  }

  if (msg.includes('quote') || msg.includes('custom') || msg.includes('order') || msg.includes('build') || msg.includes('price')) {
    return 'We craft custom dining tables, platform beds, live-edge consoles, and modular wardrobes to your exact millimeter dimensions! You can use our interactive 3D Custom Furniture Builder to configure wood species, edge chamfers, and finishes, or submit your bespoke dimensions for an instant craftsman quote.';
  }

  return `Greetings! I am Master Arthur Vance, Chief Woodwright at WoodCraft Carpentry. For your question on "${message}": All our pieces are crafted from FSC-certified kiln-dried solid hardwoods with reinforced joinery. Let me know the wood species (Teak, White Oak, Walnut, Sheesham, Mahogany) or furniture type, and I will share exact timber specifications, joinery blueprints, or maintenance advice!`;
}

export async function askWoodDoctorAI(message: string, history: Array<{ role: string; content: string }>) {
  const ai = getAIClient();

  if (!ai) {
    return { reply: generateMasterArthurReply(message) };
  }

  const formattedHistory = history.map((h) => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  const aiResult = await tryWithModels(['gemini-3.7-flash', 'gemini-flash-latest'], async (model) => {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: `You are "Master Arthur Vance", chief woodwright, master joiner, and furniture doctor at WoodCraft Carpentry.
Provide expert, warm, authoritative, and practical woodworking guidance on timber selection (Burma Teak, American White Oak, Walnut, Sheesham, Mahogany, Pine), moisture acclimation, polish care (beeswax, polyurethane, hardwax oil, melamine), joint repair, and custom furniture construction. Keep answers concise, highly knowledgeable, and conversational.`,
      },
      history: formattedHistory as any,
    });

    const response = await chat.sendMessage({ message });
    return response.text?.trim() || null;
  });

  if (aiResult) {
    return { reply: aiResult };
  }

  return { reply: generateMasterArthurReply(message) };
}

export interface FurnitureImageDescriptionParams {
  image?: string;
  woodType?: string;
  category?: string;
  title?: string;
}

export interface FurnitureDescriptionResult {
  description: string;
  shortDescription: string;
  suggestedTitle: string;
  materials: string[];
  careInstructions: string;
}

function generateCraftsmanDescriptionHeuristic(params: FurnitureImageDescriptionParams): FurnitureDescriptionResult {
  const wood = params.woodType || 'Burma Teak';
  const category = params.category || 'Handcrafted Furniture';
  const title = params.title || `Artisan Solid ${wood} ${category}`;

  const woodDescriptions: Record<string, string> = {
    'Burma Teak':
      'Hand-chiseled from premium kiln-dried Burma Teak (Grade A), celebrated worldwide for its rich golden-honey tone, tight linear grain, and naturally high silica and essential oils that grant supreme natural resistance against moisture and humidity.',
    'American White Oak':
      'Sculpted from select-grade American White Oak, showcasing striking cathedral grain arches and exceptional cellular density. Features closed-cell tyloses that resist liquid absorption, reinforced with traditional blind mortise and tenon joinery.',
    'Walnut':
      'Crafted from sustainably sourced American Black Walnut, exhibiting luxurious deep chocolate hues, subtle auburn streaks, and a silky smooth tactile presence finished with organic matte oils.',
    'Indian Sheesham (Rosewood)':
      'Built with dense, heartwood Indian Sheesham (Rosewood) displaying an extraordinary contrasting dark-and-light interlocking grain. Carefully kiln-seasoned to eliminate warping and finished with hand-buffed protective wax.',
    'Mahogany':
      'Precision-joined in authentic African Mahogany, famous for its deep reddish-amber luster, warm chatoyancy, and ribbon curl grain patterns that deepen gracefully with age.',
    'Pine Wood':
      'Hand-crafted from select knot-free Scandinavian Pine, imparting a cozy rustic warmth with clean, pale-gold tones, finished with protective water-based sealant for timeless everyday use.',
    'Birch Plywood & Veneer':
      'Engineered with multi-ply Baltic Birch core and continuous solid timber edge-banding, combining maximum structural stability with flawless architectural minimalism.',
  };

  const woodText = woodDescriptions[wood] || woodDescriptions['Burma Teak'];
  const fullDesc = `${woodText} Each structural member is precision-milled and hand-finished by master joiners. The piece features seamless corner joints, softened tactile edges, and multi-stage protective finishing that highlights the raw organic grain while guarding against daily wear and heat. Built to become an enduring heirloom piece in your home.`;
  const shortDesc = `Handcrafted in kiln-dried solid ${wood} with reinforced master joinery and hand-rubbed protective finish.`;

  return {
    description: fullDesc,
    shortDescription: shortDesc,
    suggestedTitle: title,
    materials: [`Kiln-Dried Solid ${wood}`, 'German Soft-Close / Steel Hardware', 'Non-Toxic Matte Protective Sealant'],
    careInstructions: `Wipe clean with a dry or slightly damp microfiber cloth along the wood grain. Avoid abrasive chemical cleaners. Recondition with natural beeswax paste once every 6 to 12 months.`,
  };
}

export async function describeFurnitureImageWithAI(
  params: FurnitureImageDescriptionParams
): Promise<FurnitureDescriptionResult> {
  const fallback = generateCraftsmanDescriptionHeuristic(params);
  const ai = getAIClient();

  if (!ai) {
    return fallback;
  }

  const wood = params.woodType || 'Solid Hardwood';
  const category = params.category || 'Furniture';
  const title = params.title || '';

  const parts: any[] = [];

  // Parse image if provided
  if (params.image && params.image.startsWith('data:image/')) {
    const match = params.image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    }
  }

  const promptText = `You are a Master Craftsman and Architectural Furniture Catalog Author for WoodCraft Carpentry.
Analyze the provided furniture photo and product details:
- Selected Wood Type / Species: ${wood}
- Category: ${category}
- Working Title: ${title || 'Unassigned'}

Please produce a comprehensive, captivating catalog product description tailored to this specific piece:
1. "description": A rich, 2-3 paragraph captivating craftsmanship description highlighting timber grain, silhouette, joinery durability, and aesthetic allure.
2. "shortDescription": A concise 1-sentence punchy summary.
3. "suggestedTitle": A refined, elegant commercial title (e.g., "Burma Teak Minimalist Platform Bed").
4. "materials": Array of 3-4 key material items used (e.g. ["Kiln-Dried Burma Teak", "Hand-Rubbed Matte Oil"]).
5. "careInstructions": Practical timber maintenance guidelines.`;

  parts.push({ text: promptText });

  const aiResult = await tryWithModels(['gemini-3.7-flash', 'gemini-flash-latest'], async (model) => {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            shortDescription: { type: Type.STRING },
            suggestedTitle: { type: Type.STRING },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            careInstructions: { type: Type.STRING },
          },
          required: ['description', 'shortDescription', 'suggestedTitle', 'materials', 'careInstructions'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (parsed && parsed.description) {
      return parsed as FurnitureDescriptionResult;
    }
    return null;
  });

  return aiResult || fallback;
}
