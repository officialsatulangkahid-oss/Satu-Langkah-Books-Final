CREATE TABLE public.content_files (
  path text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_files TO anon;
GRANT SELECT ON public.content_files TO authenticated;
GRANT ALL ON public.content_files TO service_role;

ALTER TABLE public.content_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content files are public" ON public.content_files FOR SELECT USING (true);