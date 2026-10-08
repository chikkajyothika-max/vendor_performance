export type UserRole = 'admin' | 'manager' | 'vendor';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  vendor_id: string | null;
  status: string;
  created_at: string;
}

export interface Vendor {
  vendor_id: string;
  vendor_name: string;
  company_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  status: string;
  registration_date: string | null;
  products_services: string | null;
  contract_value: number | null;
  payment_terms: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  user_id: string | null;
  created_at: string;
}

export interface Order {
  order_id: string;
  vendor_id: string;
  product: string | null;
  quantity: number;
  order_date: string;
  expected_delivery: string | null;
  actual_delivery: string | null;
  order_amount: number;
  order_status: string;
  created_at: string;
}

export interface QualityRecord {
  quality_id: string;
  vendor_id: string;
  order_id: string;
  defective_quantity: number;
  quality_rating: number;
  return_quantity: number;
  created_at: string;
}

export interface Complaint {
  complaint_id: string;
  vendor_id: string;
  order_id: string;
  complaint_type: string | null;
  complaint_date: string;
  resolution_date: string | null;
  status: string;
  created_at: string;
}

export interface Performance {
  performance_id: string;
  vendor_id: string;
  delivery_score: number;
  quality_score: number;
  cost_score: number;
  reliability_score: number;
  overall_score: number;
  evaluation_date: string;
  month: string;
  created_at: string;
}

export interface RiskPrediction {
  prediction_id: string;
  vendor_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  prediction_date: string;
  major_risk_factors: string | null;
  positive_factors: string | null;
  recommendation: string | null;
}

export interface RiskResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  performanceScore: number;
  positiveFactors: string[];
  riskFactors: string[];
  recommendation: string;
  factorBreakdown: {
    deliveryDelays: number;
    qualityIssues: number;
    complaints: number;
    cancellations: number;
  };
  stats: {
    totalOrders: number;
    delayedOrders: number;
    onTimeOrders: number;
    defectiveProducts: number;
    returns: number;
    complaints: number;
    cancelledOrders: number;
    avgDeliveryTime: number;
    avgQualityRating: number;
  };
}

export interface VendorWithDetails extends Vendor {
  latest_performance: Performance | null;
  latest_risk: RiskPrediction | null;
  order_count: number;
}
