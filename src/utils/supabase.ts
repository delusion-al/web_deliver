import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) return (import.meta as any).env[key];
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://bdvndbbmwdmjkadmnmyy.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || 'sb_publishable_tfvPLZ6Z5wmzh8M3xglLVw_tiKUMZId';

export const supabase = createClient(supabaseUrl, supabaseKey);
