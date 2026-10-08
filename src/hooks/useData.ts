import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Vendor, Order, QualityRecord, Complaint, Performance, RiskPrediction, Profile } from '@/types';

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vendors').select('*').order('vendor_name');
    if (!error && data) setVendors(data as Vendor[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { vendors, loading, refetch: fetch };
}

export function useVendor(vendorId: string | undefined) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('vendors').select('*').eq('vendor_id', vendorId).maybeSingle();
      setVendor(data as Vendor | null);
      setLoading(false);
    })();
  }, [vendorId]);

  return { vendor, loading };
}

export function useVendorOrders(vendorId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('orders').select('*').eq('vendor_id', vendorId).order('order_date', { ascending: false });
      setOrders((data || []) as Order[]);
      setLoading(false);
    })();
  }, [vendorId]);

  return { orders, loading };
}

export function useVendorQuality(vendorId: string | undefined) {
  const [records, setRecords] = useState<QualityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('quality_records').select('*').eq('vendor_id', vendorId);
      setRecords((data || []) as QualityRecord[]);
      setLoading(false);
    })();
  }, [vendorId]);

  return { records, loading };
}

export function useVendorComplaints(vendorId: string | undefined) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('complaints').select('*').eq('vendor_id', vendorId).order('complaint_date', { ascending: false });
      setComplaints((data || []) as Complaint[]);
      setLoading(false);
    })();
  }, [vendorId]);

  return { complaints, loading };
}

export function useVendorPerformance(vendorId: string | undefined) {
  const [records, setRecords] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('performance').select('*').eq('vendor_id', vendorId).order('evaluation_date');
      setRecords((data || []) as Performance[]);
      setLoading(false);
    })();
  }, [vendorId]);

  return { records, loading };
}

export function useVendorRiskPredictions(vendorId: string | undefined) {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('risk_predictions').select('*').eq('vendor_id', vendorId).order('prediction_date', { ascending: false });
      setPredictions((data || []) as RiskPrediction[]);
      setLoading(false);
    })();
  }, [vendorId]);

  return { predictions, loading };
}

export function useAllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('order_date', { ascending: false });
    setOrders((data || []) as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, refetch: fetch };
}

export function useAllPerformance() {
  const [records, setRecords] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('performance').select('*').order('evaluation_date');
      setRecords((data || []) as Performance[]);
      setLoading(false);
    })();
  }, []);

  return { records, loading };
}

export function useAllRiskPredictions() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('risk_predictions').select('*').order('prediction_date', { ascending: false });
    setPredictions((data || []) as RiskPrediction[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { predictions, loading, refetch: fetch };
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles((data || []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { profiles, loading, refetch: fetch };
}
