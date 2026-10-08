import { supabase } from '@/lib/supabase';
import type { Vendor, Order, QualityRecord, Complaint, Performance } from '@/types';
import type { RiskResult } from '@/types';
import { calculateRisk } from '@/lib/riskEngine';

export async function fetchVendorFullData(vendorId: string) {
  const [ordersRes, qualityRes, complaintsRes, perfRes] = await Promise.all([
    supabase.from('orders').select('*').eq('vendor_id', vendorId),
    supabase.from('quality_records').select('*').eq('vendor_id', vendorId),
    supabase.from('complaints').select('*').eq('vendor_id', vendorId),
    supabase.from('performance').select('*').eq('vendor_id', vendorId).order('evaluation_date'),
  ]);

  return {
    orders: (ordersRes.data || []) as Order[],
    qualityRecords: (qualityRes.data || []) as QualityRecord[],
    complaints: (complaintsRes.data || []) as Complaint[],
    performanceRecords: (perfRes.data || []) as Performance[],
  };
}

export async function runRiskPrediction(vendorId: string): Promise<RiskResult> {
  const data = await fetchVendorFullData(vendorId);
  return calculateRisk(data.orders, data.qualityRecords, data.complaints, data.performanceRecords);
}

export async function saveRiskPrediction(vendorId: string, result: RiskResult) {
  const predictionId = `RP-${vendorId}-${Date.now()}`;
  await supabase.from('risk_predictions').insert({
    prediction_id: predictionId,
    vendor_id: vendorId,
    risk_score: result.riskScore,
    risk_level: result.riskLevel,
    prediction_date: new Date().toISOString(),
    major_risk_factors: result.riskFactors.join('; '),
    positive_factors: result.positiveFactors.join('; '),
    recommendation: result.recommendation,
  });
}

export async function addVendor(vendor: Partial<Vendor>) {
  const vendorId = vendor.vendor_id || `V${String(Date.now()).slice(-6)}`;
  const { data, error } = await supabase.from('vendors').insert({
    vendor_id: vendorId,
    vendor_name: vendor.vendor_name,
    company_name: vendor.company_name || vendor.vendor_name,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    category: vendor.category,
    status: 'active',
    registration_date: vendor.registration_date || new Date().toISOString().split('T')[0],
    products_services: vendor.products_services,
    contract_value: vendor.contract_value || 0,
    payment_terms: vendor.payment_terms,
    contract_start_date: vendor.contract_start_date,
    contract_end_date: vendor.contract_end_date,
  }).select().maybeSingle();
  return { data, error };
}

export async function updateVendor(vendorId: string, updates: Partial<Vendor>) {
  const { data, error } = await supabase.from('vendors').update(updates).eq('vendor_id', vendorId).select().maybeSingle();
  return { data, error };
}

export async function deleteVendor(vendorId: string) {
  const { error } = await supabase.from('vendors').delete().eq('vendor_id', vendorId);
  return { error };
}
