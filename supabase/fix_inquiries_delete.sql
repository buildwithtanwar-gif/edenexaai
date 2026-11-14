-- Fix: "permission denied for table inquiries" when an admin deletes an inquiry
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run

-- 1. Grant table-level privileges needed by authenticated admins (RLS still enforces admin-only access)
GRANT SELECT, UPDATE, DELETE ON TABLE public.inquiries TO authenticated;

-- Keep anonymous visitors restricted to submitting new inquiries only
GRANT INSERT ON TABLE public.inquiries TO anon;

-- 2. Ensure Row Level Security is enabled
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Ensure authenticated admins (user_roles.role = 'admin') have a DELETE policy
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Admins can delete inquiries"
  ON public.inquiries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
