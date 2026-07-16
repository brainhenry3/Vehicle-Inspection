export type UserRole = "Admin" | "Supervisor" | "Inspector" | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: string;
  status?: "Active" | "Suspended";
  password?: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface InspectionItem {
  name: string;
  description: string;
  status?: "Pass" | "Fair" | "Needs Attention" | "Critical" | "N/A";
  score?: number;
  notes?: string;
  photoUrl?: string;
}

export interface InspectionCategory {
  name: string;
  items: InspectionItem[];
}

export interface InspectionTemplate {
  id: string;
  name: string;
  vehicleType: string;
  active: boolean;
  version: string;
  categories: InspectionCategory[];
}

export interface RecommendedPart {
  partName: string;
  partNumber?: string;
  quantity: number;
  unit: string;
  estimatedCost?: number;
  priority?: "Immediate" | "Within 30 days" | "Monitor";
  remarks?: string;
}

export interface SparePart {
  id: string;
  partName: string;
  partNumber: string;
  unit: string;
  estimatedCost: number;
}

export interface LabourRecommendation {
  repairDescription: string;
  estimatedHours: number;
  estimatedCost: number;
  priority: "Immediate" | "Within 30 days" | "Monitor";
  remarks: string;
}

export interface InspectionRecord {
  id: string;
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  mileage: number;
  engineNumber: string;
  customerName: string;
  phone: string;
  inspectionDate: string;
  inspectorName: string;
  branch: string;
  status: "Draft" | "Pending Approval" | "Completed" | "Rejected";
  overallScore: number;
  healthPercentage: number;
  categoryScores: Record<string, number>;
  checklist?: Record<string, Record<string, { status: string; notes?: string }>>;
  recommendations: string;
  aiSummary: string;
  parts: RecommendedPart[];
  labour?: LabourRecommendation[];
  photos: {
    front?: string;
    rear?: string;
    left?: string;
    right?: string;
    dashboard?: string;
    engineBay?: string;
    vin?: string;
    [key: string]: string | undefined;
  };
  technicianSignature?: string;
  customerSignature?: string;
  qrCodeUrl: string;
  createdAt: string;
}
