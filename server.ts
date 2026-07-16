import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini client if API key is present
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Seed data storage (in-memory + JSON persistence)
  const DATA_FILE = path.join(process.cwd(), "data_store.json");

  const defaultTemplates = [
    {
      id: "tpl-sedan",
      name: "Standard Sedan Inspection",
      vehicleType: "Sedan",
      active: true,
      version: "1.2",
      categories: [
        {
          name: "Engine & Mechanical",
          items: [
            { name: "Engine Oil Level & Quality", description: "Check dipstick level and color" },
            { name: "Coolant & Hoses", description: "Check for leaks, level, and condition" },
            { name: "Drive Belts & Pulleys", description: "Inspect for wear, cracks, and tension" },
            { name: "Engine Mounts & Vibration", description: "Check excessive engine movement" },
          ],
        },
        {
          name: "Brakes & Suspension",
          items: [
            { name: "Brake Pads & Rotors", description: "Measure thickness and check scoring" },
            { name: "Brake Fluid Level & Moisture", description: "Test boiling point and reservoir" },
            { name: "Shock Absorbers & Struts", description: "Check for oil leaks and bounce" },
            { name: "Control Arms & Bushings", description: "Inspect for play and rubber tear" },
          ],
        },
        {
          name: "Electrical & Lighting",
          items: [
            { name: "Battery Health & CCA", description: "Load test battery voltage and health" },
            { name: "Alternator Charging Output", description: "Test voltage under load (13.8V-14.4V)" },
            { name: "Headlights & High Beams", description: "Verify alignment and bulbs" },
            { name: "Wipers & Washer Jets", description: "Inspect rubber blades and fluid" },
          ],
        },
        {
          name: "Tyres & Wheels",
          items: [
            { name: "Front Tyres Tread Depth", description: "Measure tread depth in mm (min 1.6mm)" },
            { name: "Rear Tyres Tread Depth", description: "Measure tread depth in mm" },
            { name: "Wheel Alignment & Balance", description: "Check for uneven wear" },
            { name: "Spare Tyre & Jack Kit", description: "Verify presence and condition" },
          ],
        },
        {
          name: "Interior & Safety",
          items: [
            { name: "Seatbelts & Airbag Indicators", description: "Test retraction and dash warnings" },
            { name: "Air Conditioning & Heater", description: "Check cooling temperature and airflow" },
            { name: "Dashboard Warning Lights", description: "Scan OBD-II for active DTC fault codes" },
          ],
        },
      ],
    },
    {
      id: "tpl-ev",
      name: "Electric Vehicle (EV) Multipoint Inspection",
      vehicleType: "Electric Vehicle",
      active: true,
      version: "2.0",
      categories: [
        {
          name: "High Voltage (HV) System",
          items: [
            { name: "HV Battery State of Health (SoH)", description: "Diagnostic scan of battery degradation %" },
            { name: "Thermal Management & Coolant", description: "Check coolant loop for battery and inverter" },
            { name: "Charging Port & Pins", description: "Inspect Type 2 / CCS pins for arc damage" },
            { name: "On-Board Charger (OBC)", description: "Test AC/DC charging performance" },
          ],
        },
        {
          name: "Powertrain & Drivetrain",
          items: [
            { name: "Electric Motor & Inverter", description: "Check for abnormal acoustic whine or heat" },
            { name: "Regenerative Braking Efficiency", description: "Test deceleration regen response" },
            { name: "Reduction Gearbox Oil", description: "Check fluid clarity and level" },
          ],
        },
        {
          name: "Brakes & Suspension",
          items: [
            { name: "Brake Rotor Corrosion Check", description: "EV brakes experience less wear; check rust" },
            { name: "Suspension Load Handling", description: "Check heavy battery weight dampening" },
          ],
        },
        {
          name: "Electrical & ADAS",
          items: [
            { name: "12V Auxiliary Battery", description: "Check 12V system health powering computers" },
            { name: "ADAS Sensors & Cameras", description: "Verify calibration of radar and cameras" },
          ],
        },
      ],
    },
    {
      id: "tpl-truck",
      name: "Heavy Commercial Truck Inspection",
      vehicleType: "Truck",
      active: true,
      version: "1.1",
      categories: [
        {
          name: "Heavy Diesel Engine",
          items: [
            { name: "Turbocharger & Intercooler", description: "Check boost pressure and oil blow-by" },
            { name: "Exhaust Emission & DPF", description: "Check Diesel Particulate Filter soot level" },
            { name: "Fuel Injection & Fuel Lines", description: "Inspect high pressure common rail lines" },
          ],
        },
        {
          name: "Air Brakes & Pneumatics",
          items: [
            { name: "Air Compressor & Governor", description: "Test air pressure build-up time (85-120 psi)" },
            { name: "Brake Chambers & Slack Adjusters", description: "Check pushrod stroke and leaks" },
            { name: "Air Tanks & Moisture Drains", description: "Check for oil/water condensation" },
          ],
        },
        {
          name: "Chassis & Drivetrain",
          items: [
            { name: "Frame Rails & Crossmembers", description: "Inspect for cracks, rust, or loose rivets" },
            { name: "Differential & Axles", description: "Check hub oil seals and pinion play" },
            { name: "Fifth Wheel Coupling", description: "Check locking jaws and greasing" },
          ],
        },
      ],
    },
  ];

  const defaultInspections = [
    {
      id: "INS-2026-0891",
      plateNumber: "ABC-7892",
      vin: "1HGCR2F83HA091823",
      make: "Toyota",
      model: "Camry SE",
      year: 2024,
      vehicleType: "Sedan",
      mileage: 34200,
      engineNumber: "2AR-FE-892341",
      customerName: "David Sterling",
      phone: "+1 (555) 382-9102",
      inspectionDate: "2026-07-12",
      inspectorName: "Marcus Vance",
      branch: "Downtown Central Workshop",
      status: "Completed",
      overallScore: 88,
      healthPercentage: 88,
      categoryScores: { "Engine & Mechanical": 90, "Brakes & Suspension": 85, "Electrical & Lighting": 95, "Tyres & Wheels": 80 },
      recommendations: "Replace front brake pads within 30 days. Tyres have moderate wear.",
      aiSummary: "The vehicle is in Good condition overall (88%). The engine and electrical systems show excellent health. Front brake pads are reaching the end of their operational lifecycle and should be replaced soon.",
      parts: [
        { partName: "Front Brake Pad Set", partNumber: "BP-TOY-221", quantity: 1, unit: "Set", estimatedCost: 120, priority: "Within 30 days", remarks: "Thickness at 3mm" },
        { partName: "Cabin Air Filter", partNumber: "AF-992-X", quantity: 1, unit: "Pcs", estimatedCost: 35, priority: "Monitor", remarks: "Slight dust accumulation" }
      ],
      labour: [
        { repairDescription: "Front Brake Pads Replacement & Rotor Inspection", estimatedHours: 1.5, estimatedCost: 110, priority: "Within 30 days", remarks: "Includes caliper slide lubrication" }
      ],
      photos: {
        front: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=600",
        rear: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
        dashboard: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600"
      },
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=INS-2026-0891",
      createdAt: "2026-07-12T09:30:00Z"
    },
    {
      id: "INS-2026-0892",
      plateNumber: "EV-9920-X",
      vin: "5YJ3E1EB8NF192834",
      make: "Tesla",
      model: "Model Y Long Range",
      year: 2025,
      vehicleType: "Electric Vehicle",
      mileage: 18500,
      engineNumber: "EV-DUAL-M3-91",
      customerName: "Sarah Jenkins",
      phone: "+1 (555) 902-1184",
      inspectionDate: "2026-07-13",
      inspectorName: "Elena Rostova",
      branch: "Northside EV Hub",
      status: "Completed",
      overallScore: 96,
      healthPercentage: 96,
      categoryScores: { "High Voltage (HV) System": 98, "Powertrain & Drivetrain": 95, "Brakes & Suspension": 95, "Electrical & ADAS": 96 },
      recommendations: "Battery health is exceptional at 98% SoH. No immediate service required.",
      aiSummary: "Pristine condition. High voltage battery degradation is negligible. All ADAS sensors calibrated and fully functional.",
      parts: [],
      labour: [],
      photos: {
        front: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600"
      },
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=INS-2026-0892",
      createdAt: "2026-07-13T08:15:00Z"
    }
  ];

  const defaultUsers = [
    { id: "usr-1", name: "Administrator", email: "admin@autoinspect.pro", role: "Admin", branch: "All Branches" },
    { id: "usr-2", name: "Marcus Vance", email: "marcus@autoinspect.pro", role: "Inspector", branch: "Downtown Central Workshop" },
    { id: "usr-3", name: "Elena Rostova", email: "elena@autoinspect.pro", role: "Supervisor", branch: "Northside EV Hub" },
    { id: "usr-4", name: "Audit Viewer", email: "viewer@autoinspect.pro", role: "Viewer", branch: "All Branches" }
  ];

  const defaultBranches = [
    { id: "br-1", name: "Downtown Central Workshop", city: "Metropolis" },
    { id: "br-2", name: "Northside EV Hub", city: "Metropolis" },
    { id: "br-3", name: "Westport Service Center", city: "Port City" }
  ];

  const defaultVehicleTypes = ["Sedan", "SUV", "Pickup", "Truck", "Bus", "Motorcycle", "Electric Vehicle"];
  const defaultModels = ["Camry SE", "Model Y Long Range", "F-150 Lightning", "Civic Type R", "RAV4 Hybrid", "Actros 2645"];

  const defaultSpareParts = [
    { id: "sp-1", partName: "Cabin Air Filter", partNumber: "AF-8812", unit: "Pcs", estimatedCost: 45 },
    { id: "sp-2", partName: "Engine Oil Filter", partNumber: "OF-4021", unit: "Pcs", estimatedCost: 25 },
    { id: "sp-3", partName: "Brake Pads (Front)", partNumber: "BP-509", unit: "Set", estimatedCost: 120 },
    { id: "sp-4", partName: "Brake Rotor", partNumber: "BR-901", unit: "Pcs", estimatedCost: 150 },
    { id: "sp-5", partName: "Spark Plugs (Set of 4)", partNumber: "SP-771", unit: "Set", estimatedCost: 60 },
    { id: "sp-6", partName: "Wiper Blades", partNumber: "WB-22", unit: "Pair", estimatedCost: 35 },
    { id: "sp-7", partName: "Car Battery 12V", partNumber: "BAT-48", unit: "Pcs", estimatedCost: 180 },
    { id: "sp-8", partName: "Engine Coolant 1L", partNumber: "CL-10", unit: "Litre", estimatedCost: 20 },
    { id: "sp-9", partName: "Serpentine Belt", partNumber: "SB-304", unit: "Pcs", estimatedCost: 55 },
    { id: "sp-10", partName: "Headlight Bulb", partNumber: "HL-H7", unit: "Pcs", estimatedCost: 25 }
  ];

  let db: any = {
    templates: defaultTemplates,
    inspections: defaultInspections,
    users: defaultUsers,
    branches: defaultBranches,
    vehicleTypes: defaultVehicleTypes,
    models: defaultModels,
    spareParts: defaultSpareParts,
    scoringRules: {
      pass: 5,
      fair: 3,
      needsAttention: 2,
      critical: 0,
      naExcluded: true
    }
  };

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const loaded = JSON.parse(raw);
      if (loaded && loaded.inspections) {
        db = loaded;
        if (!db.spareParts) {
          db.spareParts = defaultSpareParts;
        }
      }
    } catch (e) {
      console.error("Failed to load persistence:", e);
    }
  }

  function saveDb() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save db:", e);
    }
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/templates", (req, res) => {
    res.json(db.templates);
  });

  app.post("/api/templates", (req, res) => {
    const newTpl = { id: `tpl-${Date.now()}`, ...req.body };
    db.templates.push(newTpl);
    saveDb();
    res.json(newTpl);
  });

  app.put("/api/templates/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.templates.findIndex((t: any) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "Template not found" });
    db.templates[idx] = { ...db.templates[idx], ...req.body };
    saveDb();
    res.json(db.templates[idx]);
  });

  app.delete("/api/templates/:id", (req, res) => {
    const { id } = req.params;
    db.templates = db.templates.filter((t: any) => t.id !== id);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/inspections", (req, res) => {
    res.json(db.inspections);
  });

  app.post("/api/inspections", (req, res) => {
    const newIns = {
      id: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      qrCodeUrl: "",
      ...req.body
    };
    newIns.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${newIns.id}`;
    db.inspections.unshift(newIns);
    saveDb();
    res.json(newIns);
  });

  app.get("/api/inspections/:id", (req, res) => {
    const ins = db.inspections.find((i: any) => i.id === req.params.id);
    if (!ins) return res.status(404).json({ error: "Inspection not found" });
    res.json(ins);
  });

  app.put("/api/inspections/:id", (req, res) => {
    const idx = db.inspections.findIndex((i: any) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Inspection not found" });
    db.inspections[idx] = { ...db.inspections[idx], ...req.body };
    saveDb();
    res.json(db.inspections[idx]);
  });

  app.delete("/api/inspections/:id", (req, res) => {
    db.inspections = db.inspections.filter((i: any) => i.id !== req.params.id);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/users", (req, res) => {
    res.json(db.users);
  });

  app.post("/api/users", (req, res) => {
    const usr = { id: `usr-${Date.now()}`, status: "Active", ...req.body };
    db.users.push(usr);
    saveDb();
    res.json(usr);
  });

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.users.findIndex((u: any) => u.id === id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    db.users[idx] = { ...db.users[idx], ...req.body };
    saveDb();
    res.json(db.users[idx]);
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    db.users = db.users.filter((u: any) => u.id !== id);
    saveDb();
    res.json({ success: true });
  });

  app.get("/api/branches", (req, res) => {
    res.json(db.branches);
  });

  app.post("/api/branches", (req, res) => {
    const br = { id: `br-${Date.now()}`, ...req.body };
    db.branches.push(br);
    saveDb();
    res.json(br);
  });

  app.put("/api/branches/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.branches.findIndex((b: any) => b.id === id);
    if (idx === -1) return res.status(404).json({ error: "Branch not found" });
    db.branches[idx] = { ...db.branches[idx], ...req.body };
    saveDb();
    res.json(db.branches[idx]);
  });

  app.delete("/api/branches/:id", (req, res) => {
    const { id } = req.params;
    db.branches = db.branches.filter((b: any) => b.id !== id);
    saveDb();
    res.json({ success: true });
  });

  // Vehicle Types management endpoints
  app.get("/api/vehicle-types", (req, res) => {
    res.json(db.vehicleTypes || ["Sedan", "SUV", "Pickup", "Truck", "Bus", "Motorcycle", "Electric Vehicle"]);
  });

  app.post("/api/vehicle-types", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    if (!db.vehicleTypes) db.vehicleTypes = ["Sedan", "SUV", "Pickup", "Truck", "Bus", "Motorcycle", "Electric Vehicle"];
    if (!db.vehicleTypes.includes(name)) {
      db.vehicleTypes.push(name);
      saveDb();
    }
    res.json(db.vehicleTypes);
  });

  app.delete("/api/vehicle-types/:index", (req, res) => {
    const idx = parseInt(req.params.index);
    if (!db.vehicleTypes) db.vehicleTypes = ["Sedan", "SUV", "Pickup", "Truck", "Bus", "Motorcycle", "Electric Vehicle"];
    if (idx >= 0 && idx < db.vehicleTypes.length) {
      db.vehicleTypes.splice(idx, 1);
      saveDb();
    }
    res.json(db.vehicleTypes);
  });

  // Models / Variants management endpoints
  app.get("/api/models", (req, res) => {
    res.json(db.models || ["Camry SE", "Model Y Long Range", "F-150 Lightning", "Civic Type R", "RAV4 Hybrid", "Actros 2645"]);
  });

  app.post("/api/models", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    if (!db.models) db.models = ["Camry SE", "Model Y Long Range", "F-150 Lightning", "Civic Type R", "RAV4 Hybrid", "Actros 2645"];
    if (!db.models.includes(name)) {
      db.models.push(name);
      saveDb();
    }
    res.json(db.models);
  });

  app.delete("/api/models/:index", (req, res) => {
    const idx = parseInt(req.params.index);
    if (!db.models) db.models = ["Camry SE", "Model Y Long Range", "F-150 Lightning", "Civic Type R", "RAV4 Hybrid", "Actros 2645"];
    if (idx >= 0 && idx < db.models.length) {
      db.models.splice(idx, 1);
      saveDb();
    }
    res.json(db.models);
  });

  // Spare Parts management endpoints
  app.get("/api/spare-parts", (req, res) => {
    res.json(db.spareParts || []);
  });

  app.post("/api/spare-parts", (req, res) => {
    const { partName, partNumber, unit, estimatedCost } = req.body;
    if (!partName || !partNumber) {
      return res.status(400).json({ error: "Part Name and Part Number are required" });
    }
    const newPart = {
      id: `sp-${Date.now()}`,
      partName: String(partName).trim(),
      partNumber: String(partNumber).trim(),
      unit: String(unit || "Pcs").trim(),
      estimatedCost: Number(estimatedCost) || 0
    };
    if (!db.spareParts) db.spareParts = [];
    db.spareParts.push(newPart);
    saveDb();
    res.json(newPart);
  });

  app.put("/api/spare-parts/:id", (req, res) => {
    const { id } = req.params;
    const { partName, partNumber, unit, estimatedCost } = req.body;
    if (!db.spareParts) db.spareParts = [];
    const idx = db.spareParts.findIndex((p: any) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Spare part not found" });
    db.spareParts[idx] = {
      ...db.spareParts[idx],
      partName: partName !== undefined ? String(partName).trim() : db.spareParts[idx].partName,
      partNumber: partNumber !== undefined ? String(partNumber).trim() : db.spareParts[idx].partNumber,
      unit: unit !== undefined ? String(unit).trim() : db.spareParts[idx].unit,
      estimatedCost: estimatedCost !== undefined ? Number(estimatedCost) : db.spareParts[idx].estimatedCost,
    };
    saveDb();
    res.json(db.spareParts[idx]);
  });

  app.delete("/api/spare-parts/:id", (req, res) => {
    const { id } = req.params;
    if (!db.spareParts) db.spareParts = [];
    db.spareParts = db.spareParts.filter((p: any) => p.id !== id);
    saveDb();
    res.json({ success: true });
  });

  app.post("/api/spare-parts/bulk", (req, res) => {
    const { parts } = req.body;
    if (!Array.isArray(parts)) {
      return res.status(400).json({ error: "Parts list must be an array" });
    }
    
    const importedParts = parts.map((p: any, idx: number) => {
      return {
        id: `sp-bulk-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        partName: String(p.partName || "").trim() || "Unnamed Part",
        partNumber: String(p.partNumber || "").trim() || `PN-${Math.floor(100000 + Math.random() * 900000)}`,
        unit: String(p.unit || "Pcs").trim(),
        estimatedCost: Number(p.estimatedCost) || 0
      };
    });

    if (!db.spareParts) db.spareParts = [];
    db.spareParts.push(...importedParts);
    saveDb();
    res.json({ success: true, count: importedParts.length, parts: db.spareParts });
  });

  app.get("/api/scoring", (req, res) => {
    res.json(db.scoringRules);
  });

  app.put("/api/scoring", (req, res) => {
    db.scoringRules = { ...db.scoringRules, ...req.body };
    saveDb();
    res.json(db.scoringRules);
  });

  app.get("/api/reports/analytics", (req, res) => {
    const total = db.inspections.length;
    const completed = db.inspections.filter((i: any) => i.status === "Completed").length;
    const pending = total - completed;
    const avgScore = total > 0 ? Math.round(db.inspections.reduce((acc: number, i: any) => acc + (i.overallScore || 0), 0) / total) : 0;
    
    const byType: Record<string, number> = {};
    const byMake: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    db.inspections.forEach((i: any) => {
      byType[i.vehicleType] = (byType[i.vehicleType] || 0) + 1;
      byMake[i.make] = (byMake[i.make] || 0) + 1;
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    });

    res.json({
      totalInspections: total,
      completedReports: completed,
      pendingReports: pending,
      averageScore: avgScore,
      vehiclesByType: byType,
      vehiclesByMake: byMake,
      vehiclesByStatus: byStatus,
    });
  });

  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { vehicleType, make, model, year, mileage, inspectionResults, notes } = req.body;

      const prompt = `You are a master automotive technician and expert vehicle inspector. 
Analyze the following inspection data for a ${year} ${make} ${model} (${vehicleType}) with ${mileage} miles:
Inspection Results/Checklist: ${JSON.stringify(inspectionResults)}
Technician Notes: ${notes || "None"}

Provide a professional, detailed evaluation in JSON format containing:
1. "overallHealthScore": number (0-100)
2. "healthCategory": string ("Excellent", "Good", "Fair", "Poor", "Critical")
3. "summary": string (Professional 3-sentence summary of vehicle condition)
4. "recommendedParts": array of objects { partName, partNumber, quantity, unit, estimatedCost, priority ("Immediate", "Within 30 days", "Monitor"), remarks }
5. "labourRecommendations": array of objects { repairDescription, estimatedHours, estimatedCost, priority, remarks }
6. "safetyWarnings": array of strings (Any urgent safety hazards)
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const resultJson = JSON.parse(text);
      res.json(resultJson);
    } catch (err: any) {
      console.error("AI Recommendation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI recommendations" });
    }
  });

  app.get("/api/backup", (req, res) => {
    res.setHeader("Content-Disposition", "attachment; filename=autoinspect_backup.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(db, null, 2));
  });

  app.post("/api/restore", (req, res) => {
    try {
      if (req.body && req.body.inspections && req.body.templates) {
        db = req.body;
        saveDb();
        res.json({ success: true, message: "Database restored successfully" });
      } else {
        res.status(400).json({ error: "Invalid backup file structure" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoInspect Pro server running on http://localhost:${PORT}`);
  });
}

startServer();
