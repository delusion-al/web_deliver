import { crawlLocalBusinesses, Lead } from './crawler.ts';
import { generateArchitecture } from './generator.ts';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  console.log('==============================================');
  console.log('🚀 INITIALIZING AUTONOMOUS LEAD-GEN PIPELINE ');
  console.log('==============================================\n');

  try {
    // Stage 1: Mine organic leads from OpenStreetMap completely for free without API keys.
    const leads: Lead[] = await crawlLocalBusinesses('Madrid', 'cafe');

    if (leads.length === 0) {
      console.log('No leads found. Terminating pipeline.');
      return;
    }

    // We take the top lead as a robust demonstration!
    const targetLead = leads[0];
    console.log(`\n📌 Selected Lead: ${targetLead.name}`);
    console.log(`📍 Location: ${targetLead.address || 'Unknown'} (Lat: ${targetLead.lat}, Lon: ${targetLead.lon})`);

    // Stage 2: Hand off the lead info to our Agent network to build a tailored web architecture.
    // This physically saves the configuration into the Supabase 'tenant_configs' table.
    const tenantId = await generateArchitecture(targetLead);

    // Stage 3: Package Outreach Material
    console.log('\n📬 Constructing Outreach Package...');
    const previewUrl = `https://delusion-al.github.io/web_deliver/preview/${tenantId}`;
    console.log(`\nThe fully configured website has been compiled and is ready for client review:`);
    console.log(`🔗 LIVE PREVIEW LINK: ${previewUrl}`);

    const emailTemplate = `
Subject: A Free Modern Website Draft For ${targetLead.name}

Hi there,

I noticed that ${targetLead.name} could significantly benefit from a highly optimized digital storefront. My AI Web Generator has already constructed a fully mobile-ready mockup based directly on your brand.

You can preview the live deployment of your site absolutely for free right here:
${previewUrl}

If you like what you see, feel free to submit a ticket right through the dashboard!
    `.trim();

    // Export a CSV of all processed leads if we want manual bulk marketing
    const csvContent = "Business,Type,Lat,Lon,Website,PreviewLink\n" + leads.map(l => 
      `"${l.name}","${l.type}","${l.lat}","${l.lon}","${l.website || ''}","https://delusion-al.github.io/web_deliver/preview/PENDING"`
    ).join("\n");
    
    fs.writeFileSync(path.resolve(__dirname, '../../outreach-leads.csv'), csvContent);
    console.log('\n✅ Pipeline Complete. Generated [outreach-leads.csv] in project root.');
    
    console.log('\n==============================================');
    console.log(`EXAMPLE EMAIL DRAFT READY: \n\n${emailTemplate}`);
    console.log('==============================================\n');

  } catch (error) {
    console.error('Pipeline crashed:', error);
  }
}

bootstrap();
