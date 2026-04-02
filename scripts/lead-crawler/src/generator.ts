import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Construct path to root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!; // Using public for test, use SERVICE_ROLE for strictly protected backend insertion.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function generateArchitecture(business: any) {
  console.log(`🤖 Generator Agent engaged for: [${business.name}]`);

  // To save you OpenAI/Anthropic API costs during testing, we will MOCK the LLM logic here.
  // In a robust implementation, you pass this prompt securely via Open-Multi-Agent or @ai-sdk.
  const prompt = `
    You are an autonomous web-developer agent.
    Given business [${business.name}] (type: ${business.type}) located at [${business.address}],
    Generate a JSON strictly matching the Uros TenantSchema.
  `;
  
  console.log('🤖 Simulating LLM processing for brand colors and modern UI construction...');

  // Mocking the LLM raw JSON output response
  const llmGeneratedConfig = {
    brand: {
      name: business.name,
      logo: 'https://cdn.iconscout.com/icon/free/png-256/shop-1768051-1502220.png',
      primaryColor: '#e11d48', // Generates dynamic Rose color for resturants, blue for tech, etc.
      secondaryColor: '#f3f4f6'
    },
    seo: {
      title: `${business.name} | Modern ${business.type} in Madrid`,
      description: `Welcome to the official online portal for ${business.name}.`
    },
    navbar: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Contact', url: '#contact' }
    ],
    pages: [
      {
        slug: null, // represents index route
        components: [
          {
            type: 'Hero', // Must match our IslandResolver block!
            props: {
              title: `Welcome to ${business.name}`,
              subtitle: `The absolute best ${business.type} experience near ${business.address}.`,
              buttonPrimary: { text: 'Book Now', url: '#' }
            }
          },
          {
            type: 'ContactForm',
            props: {
              title: 'Get in Touch'
            }
          }
        ]
      }
    ]
  };

  console.log('💾 LLM compiled website correctly. Pushing directly to Supabase Cloud...');

  // Inject into base tenants table first
  const { data: baseTenant, error: baseError } = await supabase
    .from('tenants')
    .insert([{
      domain_name: business.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      owner_email: 'pending_outreach@' + business.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      github_repo: 'pending_ai_generation',
    }])
    .select('id')
    .single();

  if (baseError) {
    console.error('❌ Failed to push base tenant to Supabase:', baseError.message);
    throw baseError;
  }

  // Inject straight into the Cloud Database Oracle
  const { data, error } = await supabase
    .from('tenant_configs')
    .insert([{
      tenant_id: baseTenant.id,
      brand: llmGeneratedConfig.brand,
      seo: llmGeneratedConfig.seo,
      navbar: llmGeneratedConfig.navbar,
      pages: llmGeneratedConfig.pages,
    }])
    .select('tenant_id')
    .single();

  if (error) {
    console.error('❌ Failed to push schema to Supabase:', error.message);
    throw error;
  }

  console.log(`✅ Success! Database recorded the web structure under TENANT_ID: [${data.tenant_id}]`);
  return data.tenant_id;
}
