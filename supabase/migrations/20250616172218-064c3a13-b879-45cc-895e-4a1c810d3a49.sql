
-- Create apps table
CREATE TABLE public.apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'building', 'deployed', 'live', 'retired')),
  tech_stack TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  repo_url TEXT,
  frontend_url TEXT,
  backend_url TEXT,
  deployment_url TEXT,
  logo_url TEXT,
  monthly_revenue DECIMAL(10,2) DEFAULT 0
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE
);

-- Create launches table
CREATE TABLE public.launches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  launch_date DATE,
  channels TEXT[],
  completed BOOLEAN DEFAULT false,
  assets JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenues table
CREATE TABLE public.revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  refunds DECIMAL(10,2) DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'log' CHECK (type IN ('log', 'insight', 'bug', 'idea')),
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for apps
CREATE POLICY "Users can view their own apps" ON public.apps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own apps" ON public.apps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own apps" ON public.apps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own apps" ON public.apps FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks for their apps" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = tasks.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can create tasks for their apps" ON public.tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = tasks.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can update tasks for their apps" ON public.tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = tasks.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can delete tasks for their apps" ON public.tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = tasks.app_id AND apps.user_id = auth.uid())
);

-- RLS Policies for launches
CREATE POLICY "Users can view launches for their apps" ON public.launches FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = launches.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can create launches for their apps" ON public.launches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = launches.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can update launches for their apps" ON public.launches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = launches.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can delete launches for their apps" ON public.launches FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = launches.app_id AND apps.user_id = auth.uid())
);

-- RLS Policies for revenues
CREATE POLICY "Users can view revenues for their apps" ON public.revenues FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = revenues.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can create revenues for their apps" ON public.revenues FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = revenues.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can update revenues for their apps" ON public.revenues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = revenues.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can delete revenues for their apps" ON public.revenues FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = revenues.app_id AND apps.user_id = auth.uid())
);

-- RLS Policies for notes
CREATE POLICY "Users can view notes for their apps" ON public.notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = notes.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can create notes for their apps" ON public.notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = notes.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can update notes for their apps" ON public.notes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = notes.app_id AND apps.user_id = auth.uid())
);
CREATE POLICY "Users can delete notes for their apps" ON public.notes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.apps WHERE apps.id = notes.app_id AND apps.user_id = auth.uid())
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function for apps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON public.apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
