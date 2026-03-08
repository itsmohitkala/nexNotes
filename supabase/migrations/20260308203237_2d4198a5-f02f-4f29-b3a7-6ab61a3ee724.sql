CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'notes_count', (SELECT count(*) FROM public.notes),
    'users_count', (SELECT count(*) FROM public.profiles),
    'ai_queries_count', (SELECT count(*) FROM public.note_chats)
  );
$$;