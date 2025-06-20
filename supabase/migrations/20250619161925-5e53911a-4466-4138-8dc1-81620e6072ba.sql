
-- Create archive_items table for Launch Archive feature
CREATE TABLE public.archive_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('journal', 'marketing', 'asset', 'changelog', 'learning', 'retro')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create secrets table for Project Secrets feature
CREATE TABLE public.secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  environment TEXT NOT NULL CHECK (environment IN ('local', 'staging', 'production')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'rotated')),
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to archive_items
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;

-- Create policies for archive_items
CREATE POLICY "Users can view archive items for their apps" 
  ON public.archive_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = archive_items.app_id 
      AND apps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create archive items for their apps" 
  ON public.archive_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = archive_items.app_id 
      AND apps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update archive items for their apps" 
  ON public.archive_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = archive_items.app_id 
      AND apps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete archive items for their apps" 
  ON public.archive_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = archive_items.app_id 
      AND apps.user_id = auth.uid()
    )
  );

-- Add Row Level Security (RLS) to secrets
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Create policies for secrets
CREATE POLICY "Users can view secrets for their apps" 
  ON public.secrets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = secrets.app_id 
      AND apps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create secrets for their apps" 
  ON public.secrets 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = secrets.app_id 
      AND apps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update secrets for their apps" 
  ON public.secrets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = secrets.app_id 
      AND apps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete secrets for their apps" 
  ON public.secrets 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.apps 
      WHERE apps.id = secrets.app_id 
      AND apps.user_id = auth.uid()
    )
  );

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER archive_items_updated_at_trigger
  BEFORE UPDATE ON public.archive_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER secrets_updated_at_trigger
  BEFORE UPDATE ON public.secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
