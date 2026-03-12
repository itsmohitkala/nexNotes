
CREATE POLICY "note_chats_select_own" ON public.note_chats FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "note_chats_insert_own" ON public.note_chats FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "note_chats_update_own" ON public.note_chats FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "note_chats_delete_own" ON public.note_chats FOR DELETE TO authenticated USING (user_id = auth.uid());
ALTER TABLE public.note_chats ENABLE ROW LEVEL SECURITY;
