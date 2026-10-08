/*
# Vendor Performance and Risk Prediction System - Database Schema

## Overview
Creates the complete database schema for the Vendor Performance and Risk Prediction System.
This includes user profiles, vendors, orders, quality records, complaints, performance scores,
and risk predictions.

## New Tables

1. **profiles** - Extends Supabase auth.users with role information (admin, manager, vendor)
   - id (uuid, PK, references auth.users)
   - name, email, role, vendor_id (optional link to vendors), status

2. **vendors** - Vendor company information
   - vendor_id (text, PK), vendor_name, company_name, email, phone, address, category, status
   - Business info: products_services, contract_value, payment_terms, contract dates
   - user_id (optional link to auth user for vendor login)

3. **orders** - Purchase orders placed with vendors
   - order_id (text, PK), vendor_id (FK), product, quantity, dates, amount, status

4. **quality_records** - Quality assessments per order
   - quality_id (text, PK), vendor_id (FK), order_id (FK), defective_quantity, quality_rating, return_quantity

5. **complaints** - Complaints logged against vendors
   - complaint_id (text, PK), vendor_id (FK), order_id (FK), type, dates, status

6. **performance** - Monthly performance scores per vendor
   - performance_id (text, PK), vendor_id (FK), delivery/quality/cost/reliability/overall scores, month, evaluation_date

7. **risk_predictions** - AI risk prediction results
   - prediction_id (text, PK), vendor_id (FK), risk_score, risk_level, factors, recommendation

## Security
- RLS enabled on all tables
- All authenticated users can read all data (role-based access enforced in frontend)
- All authenticated users can insert/update/delete (simplified for academic project)
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'vendor')),
  vendor_id text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id text PRIMARY KEY,
  vendor_name text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  category text,
  status text NOT NULL DEFAULT 'active',
  registration_date date DEFAULT CURRENT_DATE,
  products_services text,
  contract_value numeric DEFAULT 0,
  payment_terms text,
  contract_start_date date,
  contract_end_date date,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id text PRIMARY KEY,
  vendor_id text REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  product text,
  quantity integer DEFAULT 1,
  order_date date NOT NULL,
  expected_delivery date,
  actual_delivery date,
  order_amount numeric DEFAULT 0,
  order_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Quality records table
CREATE TABLE IF NOT EXISTS quality_records (
  quality_id text PRIMARY KEY,
  vendor_id text REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  order_id text REFERENCES orders(order_id) ON DELETE CASCADE,
  defective_quantity integer DEFAULT 0,
  quality_rating numeric DEFAULT 0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
  return_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id text PRIMARY KEY,
  vendor_id text REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  order_id text REFERENCES orders(order_id) ON DELETE CASCADE,
  complaint_type text,
  complaint_date date NOT NULL,
  resolution_date date,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Performance table (monthly scores)
CREATE TABLE IF NOT EXISTS performance (
  performance_id text PRIMARY KEY,
  vendor_id text REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  delivery_score numeric DEFAULT 0,
  quality_score numeric DEFAULT 0,
  cost_score numeric DEFAULT 0,
  reliability_score numeric DEFAULT 0,
  overall_score numeric DEFAULT 0,
  evaluation_date date DEFAULT CURRENT_DATE,
  month text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Risk predictions table
CREATE TABLE IF NOT EXISTS risk_predictions (
  prediction_id text PRIMARY KEY,
  vendor_id text REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  risk_score numeric DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low',
  prediction_date timestamptz DEFAULT now(),
  major_risk_factors text,
  positive_factors text,
  recommendation text
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

-- Profiles policies (owner-scoped)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE TO authenticated USING (true);

-- Vendors policies
DROP POLICY IF EXISTS "vendors_select" ON vendors;
CREATE POLICY "vendors_select" ON vendors FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vendors_insert" ON vendors;
CREATE POLICY "vendors_insert" ON vendors FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vendors_update" ON vendors;
CREATE POLICY "vendors_update" ON vendors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vendors_delete" ON vendors;
CREATE POLICY "vendors_delete" ON vendors FOR DELETE TO authenticated USING (true);

-- Orders policies
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_update" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_delete" ON orders;
CREATE POLICY "orders_delete" ON orders FOR DELETE TO authenticated USING (true);

-- Quality records policies
DROP POLICY IF EXISTS "quality_select" ON quality_records;
CREATE POLICY "quality_select" ON quality_records FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "quality_insert" ON quality_records;
CREATE POLICY "quality_insert" ON quality_records FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "quality_update" ON quality_records;
CREATE POLICY "quality_update" ON quality_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "quality_delete" ON quality_records;
CREATE POLICY "quality_delete" ON quality_records FOR DELETE TO authenticated USING (true);

-- Complaints policies
DROP POLICY IF EXISTS "complaints_select" ON complaints;
CREATE POLICY "complaints_select" ON complaints FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "complaints_insert" ON complaints;
CREATE POLICY "complaints_insert" ON complaints FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "complaints_update" ON complaints;
CREATE POLICY "complaints_update" ON complaints FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "complaints_delete" ON complaints;
CREATE POLICY "complaints_delete" ON complaints FOR DELETE TO authenticated USING (true);

-- Performance policies
DROP POLICY IF EXISTS "performance_select" ON performance;
CREATE POLICY "performance_select" ON performance FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "performance_insert" ON performance;
CREATE POLICY "performance_insert" ON performance FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "performance_update" ON performance;
CREATE POLICY "performance_update" ON performance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "performance_delete" ON performance;
CREATE POLICY "performance_delete" ON performance FOR DELETE TO authenticated USING (true);

-- Risk predictions policies
DROP POLICY IF EXISTS "risk_select" ON risk_predictions;
CREATE POLICY "risk_select" ON risk_predictions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "risk_insert" ON risk_predictions;
CREATE POLICY "risk_insert" ON risk_predictions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "risk_update" ON risk_predictions;
CREATE POLICY "risk_update" ON risk_predictions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "risk_delete" ON risk_predictions;
CREATE POLICY "risk_delete" ON risk_predictions FOR DELETE TO authenticated USING (true);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quality_vendor_id ON quality_records(vendor_id);
CREATE INDEX IF NOT EXISTS idx_complaints_vendor_id ON complaints(vendor_id);
CREATE INDEX IF NOT EXISTS idx_performance_vendor_id ON performance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_risk_vendor_id ON risk_predictions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager'),
    'active'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();