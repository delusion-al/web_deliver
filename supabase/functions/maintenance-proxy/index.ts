import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

Deno.serve(async (req) => {
  const { tenantId, subject, description, contactEmail } = await req.json();
  const request_text = `${subject}: ${description}`;
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log(`AI Factory: Maintenance Request for ${tenantId}: ${request_text}`);

  // 1. Log the ticket
  const { data: ticket } = await supabase.from('maintenance_tickets').insert({
    tenant_id: tenantId,
    subject,
    description,
    contact_email: contactEmail,
    status: 'processing'
  }).select().single();

  // 2. Fetch current config
  const { data: config } = await supabase
    .from('tenant_configs')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (!config) return new Response("Tenant not found", { status: 404 });

  // 3. [AGENTIC REFINEMENT]
  let newConfigArr = { ...config };
  let changesMade = [];
  
  const lowerText = request_text.toLowerCase();

  // Basic layout/style transformations
  if (lowerText.includes("azul") || lowerText.includes("blue")) {
    newConfigArr.brand.colors.primary = "#3b82f6";
    changesMade.push("Primario: Azul (Tailwind Blue-600)");
  } else if (lowerText.includes("rojo") || lowerText.includes("red")) {
    newConfigArr.brand.colors.primary = "#ef4444";
    changesMade.push("Primario: Rojo (Tailwind Red-500)");
  } else if (lowerText.includes("oscuro") || lowerText.includes("dark")) {
    newConfigArr.brand.colors.secondary = "#020617";
    changesMade.push("Fondo: Slate-950");
  }

  if (lowerText.includes("moderno") || lowerText.includes("modern")) {
    newConfigArr.pages[0].layout = "modern";
    changesMade.push("Layout: Modern Glassmorphism");
  }

  // 4. Update DB
  const { error } = await supabase
    .from('tenant_configs')
    .update({ 
      brand: newConfigArr.brand, 
      pages: newConfigArr.pages,
      updated_at: new Date().toISOString() 
    })
    .eq('tenant_id', tenantId);

  // 5. Finalize ticket
  await supabase.from('maintenance_tickets').update({
    status: error ? 'failed' : 'completed',
    ai_response: error ? `Error: ${error.message}` : `Cambios realizados: ${changesMade.join(', ')}`
  }).eq('id', ticket.id);

  if (error) return new Response(error.message, { status: 500 });

  return new Response(JSON.stringify({ 
    success: true, 
    message: "AI Agent has refined your site configuration.",
    changes: changesMade
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
