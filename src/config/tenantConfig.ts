import { createClient } from '@supabase/supabase-js';
import type { TenantSchema } from '../skeleton/schema/tenantSchema';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// We identify the tenant via a specific repository VITE_TENANT_ID as requested via best practice.
// If the variable isn't injected during build time, we fallback to the mock row we inserted earlier.
const TENANT_ID = import.meta.env.VITE_TENANT_ID || process.env.VITE_TENANT_ID || '00000000-0000-0000-0000-000000000001';

export async function getTenantConfig(): Promise<TenantSchema> {
  const { data, error } = await supabase
    .from('tenant_configs')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .single();

  if (error || !data) {
    console.error("Failed to fetch tenant configuration from Supabase oracle. Falling back to default error page schema.");
    return {
      brand: { name: 'Error', logo: '', primaryColor: '#000', secondaryColor: '#fff' },
      seo: { title: 'Configuration Error', description: 'Could not load site configuration.' },
      navbar: [],
      pages: [
        {
          slug: undefined,
          components: [{ type: 'Hero', props: { title: 'Configuration Error', subtitle: 'Please check Supabase connection.' } }]
        }
      ]
    };
  }

  return {
    brand: data.brand,
    seo: data.seo,
    navbar: data.navbar,
    pages: data.pages,
  };
}
