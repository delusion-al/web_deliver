import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

async function testCrawler() {
  console.log('🔄 Triggering AI Generator...');
  const { data, error } = await supabase.functions.invoke('lead-crawler', {
    body: { location: 'Madrid', type: 'gym' }
  });

  if (error) {
    let payload = "Unknown";
    try {
        payload = await error.context.text();
    } catch(e) {}
    console.error('❌ Generator Failed Text Payload:', payload);
    return;
  }
  
  console.log('✅ Generator Succeeded. Result Payload:', JSON.stringify(data, null, 2));
  
  console.log('\n🔄 Fetching inserted tenants...');
  const { data: dbData, error: dbError } = await supabase.from('tenants').select('*, tenant_configs(*)');
  if (dbError) {
    console.error('❌ DB Fetch Failed:', dbError);
    return;
  }
  
  console.log('✅ DB Fetch Succeeded. Tenants in DB:', dbData.length);
  
  for (const tenant of dbData) {
     console.log(`- Domain: ${tenant.domain_name} | Owner: ${tenant.owner_email}`);
     console.log(`  Config ID: ${tenant.tenant_configs?.id}`);
     console.log(`  Preview URL: http://localhost:4321/web_deliver/preview/${tenant.id}`);
  }
  
  console.log('\n✅ E2E Sequence Verified.');
}

testCrawler();
