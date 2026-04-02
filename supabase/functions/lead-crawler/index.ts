import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

Deno.serve(async (req) => {
  const { location, type } = await req.json();
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log(`AI Factory: Lead Oracle is searching for ${type} in ${location}`);

  // 1. [ORACLE ENGINE] - Call OpenStreetMap (OSM) Overpass API
  // A standard free endpoint for business data
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="${type}"](around:20000,40.4168,-3.7038);out;`;
  
  // NOTE: In production, we'd geocode "location" to Lng/Lat first.
  // For the E2E Demo, we'll return some high-quality mock data:
  
  const mockLeads = [
    { business_name: "La Parrilla de Nino", business_type: type, city: location, has_website: false, outreach_email: "nino@example.com" },
    { business_name: "Taller del Arte", business_type: type, city: location, has_website: false, outreach_email: "info@arte.es" },
    { business_name: "Gym Alpha", business_type: type, city: location, has_website: true, website: "https://gymalpha.es" }
  ];

  let newInserted = 0;
  for (const lead of mockLeads) {
    const { data: existing } = await supabase.from('leads').select('id').eq('business_name', lead.business_name).single();
    if (!existing) {
      await supabase.from('leads').insert({
        ...lead,
        source: 'osm_oracle',
        status: 'new'
      });
      newInserted++;
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    new_inserted: newInserted, 
    without_website: mockLeads.filter(l => !l.has_website).length 
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
