-- Leads table: captures marketing leads from the pricing guide and web design quote forms.
-- service_interest values: 'pricing-guide', 'web-design'
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  service_interest TEXT NOT NULL,
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may insert leads (form submissions) but cannot read, update, or delete them.
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);
