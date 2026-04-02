import { createClient } from '@supabase/supabase-js';

// These are publishable keys, safe to expose in client-side code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bdvndbbmwdmjkadmnmyy.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_tfvPLZ6Z5wmzh8M3xglLVw_tiKUMZId';

export const supabase = createClient(supabaseUrl, supabaseKey);
