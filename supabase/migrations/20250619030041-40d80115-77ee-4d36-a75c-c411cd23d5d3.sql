
-- Create a table for ideas
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'brainstorm' CHECK (status IN ('brainstorm', 'research', 'validation', 'development', 'launched', 'archived')),
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  market_size TEXT,
  target_audience TEXT,
  viability_score INTEGER CHECK (viability_score >= 0 AND viability_score <= 100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own ideas
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own ideas
CREATE POLICY "Users can view their own ideas" 
  ON public.ideas 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own ideas
CREATE POLICY "Users can create their own ideas" 
  ON public.ideas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own ideas
CREATE POLICY "Users can update their own ideas" 
  ON public.ideas 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own ideas
CREATE POLICY "Users can delete their own ideas" 
  ON public.ideas 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER ideas_updated_at_trigger
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
