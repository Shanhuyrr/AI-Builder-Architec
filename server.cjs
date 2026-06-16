var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
app.use(import_express.default.json());
var PORT = 3e3;
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var calculateMaterialsAndCosts = (plotMarla, floors, style, budgetPKR) => {
  const builtUpAreaPerFloor = plotMarla === 5 ? 850 : plotMarla === 10 ? 1700 : 3300;
  const totalBuiltUpArea = builtUpAreaPerFloor * floors;
  const bricksCount = Math.round(totalBuiltUpArea * 38);
  const cementBags = Math.round(totalBuiltUpArea * 0.44);
  const steelTons = Number((totalBuiltUpArea * 4.1 / 1e3).toFixed(2));
  const sandCft = Math.round(totalBuiltUpArea * 1.3);
  const crushCft = Math.round(totalBuiltUpArea * 0.85);
  let styleMultiplier = 1;
  if (style === "Luxury" /* LUXURY */) styleMultiplier = 1.45;
  if (style === "Traditional" /* TRADITIONAL */) styleMultiplier = 0.95;
  const rates = {
    brick: 18,
    // PKR per brick
    cement: 1450,
    // PKR per bag
    steel: 26e4,
    // PKR per ton
    sand: 75,
    // PKR per cft
    crush: 120,
    // PKR per cft
    labor: 550,
    // PKR per sqft of built-up area
    finishingPlasterPaint: 350,
    finishingTilesFlooring: 650,
    fittingsSanitaryElectric: 500
  };
  if (style === "Luxury" /* LUXURY */) {
    rates.finishingTilesFlooring = 1500;
    rates.fittingsSanitaryElectric = 1200;
    rates.labor = 750;
  }
  const materialsList = [
    {
      name: "Bricks (A-Grade First Class Clay)",
      quantity: bricksCount,
      unit: "pcs",
      rate: rates.brick,
      totalPrice: bricksCount * rates.brick,
      icon: "Grid",
      category: "structural"
    },
    {
      name: "Portland Cement (Solf/Maple Leaf/Bestway)",
      quantity: cementBags,
      unit: "bags",
      rate: rates.cement,
      totalPrice: cementBags * rates.cement,
      icon: "Cuboid",
      category: "structural"
    },
    {
      name: "Grade 60 Deformed Steel Bars",
      quantity: steelTons,
      unit: "tons",
      rate: rates.steel,
      totalPrice: Math.round(steelTons * rates.steel),
      icon: "Wrench",
      category: "structural"
    },
    {
      name: "Ravi/Chenab River Sand",
      quantity: sandCft,
      unit: "cft",
      rate: rates.sand,
      totalPrice: sandCft * rates.sand,
      icon: "Sparkles",
      category: "structural"
    },
    {
      name: "Margalla Crush (Gravel/Sargodha)",
      quantity: crushCft,
      unit: "cft",
      rate: rates.crush,
      totalPrice: crushCft * rates.crush,
      icon: "Layers",
      category: "structural"
    },
    {
      name: "Premium Tiles & Marble Flooring",
      quantity: totalBuiltUpArea,
      unit: "sqft",
      rate: rates.finishingTilesFlooring,
      totalPrice: totalBuiltUpArea * rates.finishingTilesFlooring,
      icon: "Box",
      category: "finishing"
    },
    {
      name: "WeatherSheet Exterior Paint & Interior Emulsion",
      quantity: totalBuiltUpArea,
      unit: "sqft",
      rate: rates.finishingPlasterPaint,
      totalPrice: totalBuiltUpArea * rates.finishingPlasterPaint,
      icon: "Paintbrush",
      category: "finishing"
    },
    {
      name: "Sanitary Fittings, Electrical Wiring & Lighting",
      quantity: totalBuiltUpArea,
      unit: "units",
      rate: rates.fittingsSanitaryElectric,
      totalPrice: totalBuiltUpArea * rates.fittingsSanitaryElectric,
      icon: "Plug",
      category: "fittings"
    }
  ];
  const structuralSum = materialsList.filter((m) => m.category === "structural").reduce((sum, m) => sum + m.totalPrice, 0);
  const finishingSum = materialsList.filter((m) => m.category !== "structural").reduce((sum, m) => sum + m.totalPrice, 0);
  const laborCostTotal = totalBuiltUpArea * rates.labor;
  const grandTotalCost = structuralSum + finishingSum + laborCostTotal;
  const categories = [
    {
      name: "Grey Structure Materials",
      amount: structuralSum,
      percentage: Number((structuralSum / grandTotalCost * 100).toFixed(1)),
      color: "#808080"
      // Dark Grey
    },
    {
      name: "Finishing & Paint Materials",
      amount: finishingSum,
      percentage: Number((finishingSum / grandTotalCost * 100).toFixed(1)),
      color: "#9333EA"
      // Purple
    },
    {
      name: "Labor & Contracting Wages",
      amount: laborCostTotal,
      percentage: Number((laborCostTotal / grandTotalCost * 100).toFixed(1)),
      color: "#10B981"
      // Green
    }
  ];
  return {
    materialsList,
    costBreakdown: {
      totalCost: grandTotalCost,
      materialCost: structuralSum + finishingSum,
      laborCost: laborCostTotal,
      categories
    }
  };
};
var getLayoutForPlot = (plotSize, floorsCount) => {
  const rooms = [];
  const marlas = plotSize.unit === "marla" ? plotSize.value : plotSize.value / 225;
  if (marlas < 7) {
    rooms.push({ id: "g_lawn", name: "Front Lawn", type: "lawn", floor: 0, x: 0, y: 0, width: 25, height: 5, color: "#10B981" });
    rooms.push({ id: "g_garage", name: "Car Porch / Garage", type: "garage", floor: 0, x: 13, y: 5, width: 12, height: 12, color: "#4B5563" });
    rooms.push({ id: "g_drawing", name: "Drawing Room", type: "lounge", floor: 0, x: 0, y: 5, width: 13, height: 12, color: "#9333EA" });
    rooms.push({ id: "g_lounge", name: "TV Lounge & Family Area", type: "lounge", floor: 0, x: 0, y: 17, width: 16, height: 13, color: "#7C3AED" });
    rooms.push({ id: "g_kitchen", name: "American Kitchen", type: "kitchen", floor: 0, x: 16, y: 17, width: 9, height: 10, color: "#F59E0B" });
    rooms.push({ id: "g_bedroom1", name: "Master Bedroom (GF)", type: "bedroom", floor: 0, x: 0, y: 30, width: 14, height: 15, color: "#3B82F6" });
    rooms.push({ id: "g_bath1", name: "Attached Washroom", type: "bathroom", floor: 0, x: 14, y: 35, width: 6, height: 10, color: "#06B6D4" });
    rooms.push({ id: "g_stairs", name: "Stairs Hall & Lobby", type: "stairs", floor: 0, x: 20, y: 30, width: 5, height: 15, color: "#EC4899" });
    if (floorsCount >= 2) {
      rooms.push({ id: "f_terrace", name: "Front View Balcony", type: "patio", floor: 1, x: 0, y: 0, width: 25, height: 6, color: "#10B981" });
      rooms.push({ id: "f_lounge", name: "First Floor Living Area", type: "lounge", floor: 1, x: 0, y: 17, width: 15, height: 13, color: "#7C3AED" });
      rooms.push({ id: "f_kitchen", name: "Compact Kitchenette", type: "kitchen", floor: 1, x: 15, y: 17, width: 10, height: 7, color: "#F59E0B" });
      rooms.push({ id: "f_bed1", name: "Front Bedroom (FF)", type: "bedroom", floor: 1, x: 0, y: 6, width: 13, height: 11, color: "#3B82F6" });
      rooms.push({ id: "f_bath1", name: "Attached Washroom 2", type: "bathroom", floor: 1, x: 13, y: 6, width: 6, height: 6, color: "#06B6D4" });
      rooms.push({ id: "f_bed2", name: "Luxury Master Bedroom (FF)", type: "bedroom", floor: 1, x: 0, y: 30, width: 14, height: 15, color: "#3B82F6" });
      rooms.push({ id: "f_bath2", name: "Premium Attached Bath", type: "bathroom", floor: 1, x: 14, y: 35, width: 6, height: 10, color: "#06B6D4" });
      rooms.push({ id: "f_stairs", name: "Upper Stairs Lobby", type: "stairs", floor: 1, x: 20, y: 30, width: 5, height: 15, color: "#EC4899" });
    }
    if (floorsCount >= 3) {
      rooms.push({ id: "s_roof", name: "Spacious Open Roof Garden", type: "lawn", floor: 2, x: 0, y: 0, width: 25, height: 30, color: "#10B981" });
      rooms.push({ id: "s_servant", name: "Guest Room / Servant Quarter", type: "bedroom", floor: 2, x: 0, y: 30, width: 14, height: 15, color: "#3B82F6" });
      rooms.push({ id: "s_bath", name: "Attached Bath", type: "bathroom", floor: 2, x: 14, y: 35, width: 6, height: 10, color: "#06B6D4" });
      rooms.push({ id: "s_stairs", name: "Roof Exit Mumty", type: "stairs", floor: 2, x: 20, y: 30, width: 5, height: 15, color: "#EC4899" });
    }
  } else if (marlas < 17) {
    rooms.push({ id: "g10_lawn", name: "Lush Green Front Lawn", type: "lawn", floor: 0, x: 0, y: 0, width: 35, height: 8, color: "#10B981" });
    rooms.push({ id: "g10_garage", name: "Double Vehicle Garage", type: "garage", floor: 0, x: 18, y: 8, width: 17, height: 15, color: "#4B5563" });
    rooms.push({ id: "g10_drawing", name: "Formal Drawing Room", type: "lounge", floor: 0, x: 0, y: 8, width: 18, height: 15, color: "#9333EA" });
    rooms.push({ id: "g10_lounge", name: "Central double-height TV Lounge", type: "lounge", floor: 0, x: 0, y: 23, width: 23, height: 22, color: "#7C3AED" });
    rooms.push({ id: "g10_kitchen", name: "Premium Main Kitchen & Dirty Kitchen", type: "kitchen", floor: 0, x: 23, y: 23, width: 12, height: 12, color: "#F59E0B" });
    rooms.push({ id: "g10_patio", name: "Rear Ventilation Yard", type: "patio", floor: 0, x: 23, y: 35, width: 12, height: 5, color: "#9CA3AF" });
    rooms.push({ id: "g10_bed1", name: "Master Bedroom (GF)", type: "bedroom", floor: 0, x: 0, y: 45, width: 16, height: 20, color: "#3B82F6" });
    rooms.push({ id: "g10_bath1", name: "Master luxury washroom with tub", type: "bathroom", floor: 0, x: 16, y: 55, width: 8, height: 10, color: "#06B6D4" });
    rooms.push({ id: "g10_bed2", name: "Guest Bedroom (GF)", type: "bedroom", floor: 0, x: 24, y: 45, width: 11, height: 14, color: "#3B82F6" });
    rooms.push({ id: "g10_bath2", name: "Attached bathroom (GF)", type: "bathroom", floor: 0, x: 24, y: 59, width: 11, height: 6, color: "#06B6D4" });
    rooms.push({ id: "g10_stairs", name: "Staircase Hall", type: "stairs", floor: 0, x: 16, y: 45, width: 8, height: 10, color: "#EC4899" });
    if (floorsCount >= 2) {
      rooms.push({ id: "f10_terrace", name: "Open front terrace", type: "patio", floor: 1, x: 0, y: 0, width: 18, height: 8, color: "#10B981" });
      rooms.push({ id: "f10_lounge", name: "Spacious Upper Lounge", type: "lounge", floor: 1, x: 0, y: 23, width: 23, height: 16, color: "#7C3AED" });
      rooms.push({ id: "f10_kitchen", name: "Compact Open Kitchen", type: "kitchen", floor: 1, x: 23, y: 23, width: 12, height: 10, color: "#F59E0B" });
      rooms.push({ id: "f10_bed1", name: "Executive Front Bedroom", type: "bedroom", floor: 1, x: 0, y: 8, width: 18, height: 15, color: "#3B82F6" });
      rooms.push({ id: "f10_bath1", name: "Attached Bath", type: "bathroom", floor: 1, x: 18, y: 8, width: 10, height: 6, color: "#06B6D4" });
      rooms.push({ id: "f10_bed2", name: "Luxury Bedroom 3", type: "bedroom", floor: 1, x: 0, y: 45, width: 16, height: 20, color: "#3B82F6" });
      rooms.push({ id: "f10_bath2", name: "Attached Modern Bath", type: "bathroom", floor: 1, x: 16, y: 55, width: 8, height: 10, color: "#06B6D4" });
      rooms.push({ id: "f10_bed3", name: "Luxury Bedroom 4", type: "bedroom", floor: 1, x: 24, y: 45, width: 11, height: 14, color: "#3B82F6" });
      rooms.push({ id: "f10_bath3", name: "Attached Bath 4", type: "bathroom", floor: 1, x: 24, y: 59, width: 11, height: 6, color: "#06B6D4" });
      rooms.push({ id: "f10_stairs", name: "Staircase Hall", type: "stairs", floor: 1, x: 16, y: 45, width: 8, height: 10, color: "#EC4899" });
    }
    if (floorsCount >= 3) {
      rooms.push({ id: "s10_roof", name: "Open tiled roof terrace", type: "lawn", floor: 2, x: 0, y: 0, width: 35, height: 45, color: "#10B981" });
      rooms.push({ id: "s10_servant", name: "Servant Suite", type: "bedroom", floor: 2, x: 0, y: 45, width: 16, height: 20, color: "#3B82F6" });
      rooms.push({ id: "s10_bath", name: "Attached Bath", type: "bathroom", floor: 2, x: 16, y: 55, width: 8, height: 10, color: "#06B6D4" });
      rooms.push({ id: "s10_stairs", name: "Roof Mumty Hall", type: "stairs", floor: 2, x: 24, y: 45, width: 11, height: 20, color: "#EC4899" });
    }
  } else {
    rooms.push({ id: "g50_lawn", name: "Beautiful Landscaped Front Lawn", type: "lawn", floor: 0, x: 0, y: 0, width: 50, height: 15, color: "#10B981" });
    rooms.push({ id: "g50_garage", name: "3-Car Portico & Garage", type: "garage", floor: 0, x: 28, y: 15, width: 22, height: 18, color: "#4B5563" });
    rooms.push({ id: "g50_drawing", name: "State Drawing Lounge", type: "lounge", floor: 0, x: 0, y: 15, width: 18, height: 20, color: "#9333EA" });
    rooms.push({ id: "g50_dining", name: "Formal Dining Hall", type: "lounge", floor: 0, x: 18, y: 15, width: 10, height: 20, color: "#8B5CF6" });
    rooms.push({ id: "g50_lobby", name: "Double Height Imperial Lobby", type: "stairs", floor: 0, x: 15, y: 35, width: 15, height: 15, color: "#EC4899" });
    rooms.push({ id: "g50_lounge", name: "Grand TV & Family Lounge", type: "lounge", floor: 0, x: 0, y: 50, width: 28, height: 20, color: "#7C3AED" });
    rooms.push({ id: "g50_kitchen", name: "Master Chef Kitchen & Pantry", type: "kitchen", floor: 0, x: 28, y: 50, width: 12, height: 15, color: "#F59E0B" });
    rooms.push({ id: "g50_powder", name: "Powder Room", type: "bathroom", floor: 0, x: 40, y: 50, width: 10, height: 7, color: "#06B6D4" });
    rooms.push({ id: "g50_bed1", name: "Imperial Master Bed (GF)", type: "bedroom", floor: 0, x: 0, y: 70, width: 18, height: 20, color: "#3B82F6" });
    rooms.push({ id: "g50_bath1", name: "Jacuzzi Bath & Wardrobe Room", type: "bathroom", floor: 0, x: 18, y: 70, width: 10, height: 20, color: "#06B6D4" });
    rooms.push({ id: "g50_bed2", name: "Guest Suite 2 (GF)", type: "bedroom", floor: 0, x: 28, y: 70, width: 12, height: 16, color: "#3B82F6" });
    rooms.push({ id: "g50_bath2", name: "En-suite Bath", type: "bathroom", floor: 0, x: 28, y: 86, width: 12, height: 4, color: "#06B6D4" });
    rooms.push({ id: "g50_backyard", name: "Royal Patio & backyard pool", type: "lawn", floor: 0, x: 40, y: 70, width: 10, height: 20, color: "#10B981" });
    if (floorsCount >= 2) {
      rooms.push({ id: "f50_terrace", name: "Panoramic Upper Guard Terrace", type: "patio", floor: 1, x: 0, y: 0, width: 50, height: 15, color: "#10B981" });
      rooms.push({ id: "f50_lounge", name: "Luxury Lounge & Sitting Area", type: "lounge", floor: 1, x: 0, y: 50, width: 28, height: 20, color: "#7C3AED" });
      rooms.push({ id: "f50_kitchen", name: "First Floor Elite Kitchenette", type: "kitchen", floor: 1, x: 28, y: 55, width: 12, height: 10, color: "#F59E0B" });
      rooms.push({ id: "f50_bed1", name: "Royal Bed Suite 3", type: "bedroom", floor: 1, x: 0, y: 15, width: 18, height: 18, color: "#3B82F6" });
      rooms.push({ id: "f50_bath1", name: "Attached Dressing & bath", type: "bathroom", floor: 1, x: 18, y: 15, width: 10, height: 10, color: "#06B6D4" });
      rooms.push({ id: "f50_bed2", name: "Executive Bed Suite 4", type: "bedroom", floor: 1, x: 0, y: 70, width: 18, height: 20, color: "#3B82F6" });
      rooms.push({ id: "f50_bath2", name: "Dressing Bath Suite 4", type: "bathroom", floor: 1, x: 18, y: 70, width: 10, height: 20, color: "#06B6D4" });
      rooms.push({ id: "f50_bed3", name: "Premium Bed Suite 5", type: "bedroom", floor: 1, x: 28, y: 70, width: 12, height: 20, color: "#3B82F6" });
      rooms.push({ id: "f50_bath3", name: "Attached Bath Suite 5", type: "bathroom", floor: 1, x: 40, y: 70, width: 10, height: 15, color: "#06B6D4" });
    }
    if (floorsCount >= 3) {
      rooms.push({ id: "s50_roof", name: "Roof deck, open air BBQ lounge", type: "lawn", floor: 2, x: 0, y: 0, width: 50, height: 60, color: "#10B981" });
      rooms.push({ id: "s50_servant1", name: "Servant Quarter A", type: "bedroom", floor: 2, x: 0, y: 70, width: 14, height: 14, color: "#3B82F6" });
      rooms.push({ id: "s50_servant2", name: "Servant Quarter B", type: "bedroom", floor: 2, x: 14, y: 70, width: 14, height: 14, color: "#3B82F6" });
      rooms.push({ id: "s50_bath", name: "Shared Servant Bathroom", type: "bathroom", floor: 2, x: 28, y: 70, width: 10, height: 10, color: "#06B6D4" });
    }
  }
  return rooms;
};
app.post("/api/generate-design", async (req, res) => {
  try {
    const { plotSize, floorsCount, budgetPKR, style, customNotes } = req.body;
    if (!plotSize || !floorsCount || !budgetPKR || !style) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }
    const marlaValue = Number(plotSize.value);
    let widthFt = 25;
    let lengthFt = 45;
    if (marlaValue > 7 && marlaValue < 12) {
      widthFt = 35;
      lengthFt = 65;
    } else if (marlaValue >= 12) {
      widthFt = 50;
      lengthFt = 90;
    }
    const plotObj = {
      value: marlaValue,
      unit: "marla",
      widthFt,
      lengthFt
    };
    const rooms = getLayoutForPlot(plotObj, floorsCount);
    const estimation = calculateMaterialsAndCosts(marlaValue, floorsCount, style, budgetPKR);
    let aiFeedback = {
      description: `Premium ${style}-style floor plan optimized for a ${marlaValue} marla plot with ${floorsCount} floors. Layout maximizes light entry and accommodates luxury finish.`,
      merits: [
        "Strategic central TV lounge optimizing ground floor navigation",
        "Front lawn setback serves as an exquisite curb-view and sound boundary",
        "Excellent placement of wet area (bathroom/kitchen) stacks for cost-effective plumbing",
        "Lobby structure preserves privacy and controls indoor heat mapping"
      ],
      recommendations: [
        "Ensure solid damp-proof course (DPC) installation to prevent rising dampness",
        "Use high-grade dual-glazed UPVC windows on south-facing slots for heat reduction",
        "Plan electrical conduit ducts near corners to keep wiring runs easily maintainable",
        "Increase garage height clearance if planning to accommodate a modern standard SUV"
      ],
      ventilationRating: 8.5,
      spaceEfficiencyRating: 9
    };
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          You are an elite, highly experienced professional architect in Pakistan. A client wants to build their future home and needs architectural feedback.
          
          Project parameters:
          - Plot Size: ${marlaValue} Marla (${widthFt} ft width x ${lengthFt} ft length)
          - Architectural Style: ${style}
          - Floors: ${floorsCount}
          - Target Budget: PKR ${budgetPKR.toLocaleString()}

          User custom suggestions: "${customNotes || "None"}"

          Analyze this layout structure and generate:
          1. A personalized, elegant description of the home, discussing structural flow, sunlight orientation, wind vector ventilation, kitchen-living area cohesion, facade curb appeal, and spatial planning.
          2. A list of 4 key merits (positive aspects of the layout).
          3. A list of 4 premium actionable architectural recommendations specifically tailored for construction in Pakistan (considering summers, monsoon, material sourcing, structural longevity).
          4. A numeric rating (1.0 to 10.0) for both "Ventilation & Cross Breeze" and "Space Efficiency".

          Respond ONLY with a valid JSON block complying exactly with this structure:
          {
            "description": "text paragraph",
            "merits": ["merit 1", "merit 2", "merit 3", "merit 4"],
            "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4"],
            "ventilationRating": 8.8,
            "spaceEfficiencyRating": 9.2
          }
        `;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        });
        const textOutput = response.text;
        if (textOutput) {
          try {
            const parsed = JSON.parse(textOutput.trim());
            if (parsed.description && Array.isArray(parsed.merits) && Array.isArray(parsed.recommendations) && parsed.ventilationRating && parsed.spaceEfficiencyRating) {
              aiFeedback = {
                description: parsed.description,
                merits: parsed.merits.slice(0, 4),
                recommendations: parsed.recommendations.slice(0, 4),
                ventilationRating: Number(parsed.ventilationRating),
                spaceEfficiencyRating: Number(parsed.spaceEfficiencyRating)
              };
            }
          } catch (e) {
            console.warn("Could not parse AI response JSON, falling back to rich defaults.", e);
          }
        }
      } catch (geminiError) {
        console.error("Gemini Generation Error:", geminiError);
      }
    }
    const designId = "design_" + Date.now();
    const finalDesign = {
      id: designId,
      title: `${marlaValue} Marla ${style} House Plan`,
      plotSize: plotObj,
      floorsCount,
      budgetPKR,
      style,
      rooms,
      materials: estimation.materialsList,
      costBreakdown: estimation.costBreakdown,
      aiFeedback,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    res.json(finalDesign);
  } catch (error) {
    console.error("API Error in Generate Design:", error);
    res.status(500).json({ error: "Failed to generate design layout: " + error.message });
  }
});
var serveApp = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI 3D House Design Server listening at http://localhost:${PORT}`);
  });
};
serveApp();
//# sourceMappingURL=server.cjs.map
