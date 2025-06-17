
-- Add missing columns to the notes table
ALTER TABLE public.notes 
ADD COLUMN tags text[] DEFAULT '{}',
ADD COLUMN priority text DEFAULT 'medium',
ADD COLUMN status text DEFAULT 'active';

-- Add missing column to the apps table
ALTER TABLE public.apps 
ADD COLUMN users_count integer DEFAULT 0;

-- Create deployments table
CREATE TABLE public.deployments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  environment text NOT NULL CHECK (environment IN ('preview', 'staging', 'production')),
  hosting_provider text NOT NULL,
  domain_name text,
  deployment_url text,
  status text NOT NULL DEFAULT 'deployed' CHECK (status IN ('pending', 'deployed', 'failed')),
  ci_cd_setup text,
  dns_setup text,
  ssl_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on deployments table
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deployments table
CREATE POLICY "Users can view deployments for their apps" 
  ON public.deployments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = deployments.app_id 
    AND apps.user_id = auth.uid()
  ));

CREATE POLICY "Users can create deployments for their apps" 
  ON public.deployments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = deployments.app_id 
    AND apps.user_id = auth.uid()
  ));

CREATE POLICY "Users can update deployments for their apps" 
  ON public.deployments 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = deployments.app_id 
    AND apps.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete deployments for their apps" 
  ON public.deployments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.apps 
    WHERE apps.id = deployments.app_id 
    AND apps.user_id = auth.uid()
  ));

-- Add update trigger for deployments
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
