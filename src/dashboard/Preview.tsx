import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { MaintenanceForm } from '../templates/components/MaintenanceForm';
import { Bot, Globe, Shield, Zap, ArrowRight, Star } from 'lucide-react';

export function Preview() {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      if (!tenantId) return;
      try {
        const { data: tenantData } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
        const { data: configData } = await supabase.from('tenant_configs').select('*').eq('tenant_id', tenantId).single();
        
        if (tenantData) setTenant(tenantData);
        if (configData) setConfig(configData);
      } catch (err) {
        console.error('Sincronización fallida:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTenant();

    const channel = supabase.channel(`preview_realtime_${tenantId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tenant_configs',
        filter: `tenant_id=eq.${tenantId}`
      }, (payload) => {
        console.log('Neural Update Received:', payload.new);
        setConfig(payload.new);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId]);

  if (loading) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-950 text-blue-500 font-mono uppercase tracking-[0.3em] gap-6">
      <div className="w-24 h-1 bg-blue-500/20 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-[loading_2s_infinite]" />
      </div>
      <span>Neural Sync: Active Node...</span>
      <style>{`@keyframes loading { from { transform: translateX(-100%); } to { transform: translateX(100%); } }`}</style>
    </div>
  );
  
  if (!tenant || !config) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-500 font-bold uppercase tracking-widest px-8 text-center">404 // Protocolo de sitio no encontrado</div>;

  const { brand = {}, seo = {}, pages = [], navbar = [] } = config;
  const homePage = pages.find((p: any) => p.id === 'home') || pages[0] || {};
  const features = homePage.features || [
    { title: "Optimización AI", desc: "Arquitectura neural integrada para maximo rendimiento y conversion." },
    { title: "Diseño Cognitivo", desc: "UX auditada por NVIDIA NIM para accesibilidad universal." },
    { title: "Sincronización Total", desc: "Despliegue autónomo a GitHub con auditoría de seguridad." }
  ];
  
  const colors = brand.colors || { 
    primary: brand.primaryColor || '#3b82f6', 
    secondary: brand.secondaryColor || '#0f172a', 
    accent: brand.accent || '#8b5cf6' 
  };

  const uiLogic = brand.ui_ux_logic || brand.visual_logic || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500" style={{ '--primary': colors.primary } as any}>
      {/* Floating Cognitive Badge */}
      <div 
        className="fixed bottom-6 right-6 z-[100] group cursor-pointer"
        onClick={() => setAuditOpen(!auditOpen)}
      >
        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
        <div className="relative p-4 rounded-2xl bg-black/80 border border-blue-500/30 backdrop-blur-xl flex items-center gap-3 shadow-2xl hover:scale-105 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cognitive State</div>
            <div className="text-xs font-bold text-white uppercase italic">Live Swarm Active</div>
          </div>
        </div>
      </div>

      {/* Audit Drawer (Open Box) */}
      {auditOpen && uiLogic && (
        <div className="fixed inset-y-0 right-0 w-96 z-[101] bg-slate-950 border-l border-white/5 shadow-2xl animate-in slide-in-from-right duration-500">
           <div className="p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black uppercase tracking-tighter italic">Neural Audit Report</h2>
                 <button onClick={() => setAuditOpen(false)} className="text-slate-500 hover:text-white">Esc</button>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                 {Object.entries(uiLogic).map(([key, value]) => (
                    <div key={key} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                       <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{key.replace('_', ' ')}</h4>
                       <p className="text-sm text-slate-400 leading-relaxed italic">"{String(value)}"</p>
                    </div>
                 ))}
                 {!uiLogic && <div className="text-slate-600 italic">Auditando parámetros estructurales...</div>}
              </div>
              <div className="pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                    <span>Engine Reliability</span>
                    <span className="text-emerald-500">99.8%</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Premium Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
              <Globe className="text-white" size={20} />
            </div>
            <div>
               <span className="text-xl font-black tracking-tighter text-white uppercase italic block leading-none">
                 {brand.name || brand.logo_text || tenant.domain_name.split('.')[0]}
               </span>
               {tenant.github_repo && (
                  <a 
                    href={tenant.github_repo.includes('/') 
                      ? `https://delusion-al.github.io/${tenant.github_repo.split('/')[1]}`
                      : `https://delusion-al.github.io/${tenant.github_repo}`
                    }
                    target="_blank"
                    className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 group/link"
                  >
                    <Shield size={10} className="group-hover/link:animate-pulse" /> Production Node Live <ArrowRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                  </a>
               )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {navbar.length > 0 ? navbar.map((item: any) => (
              <a key={item.label} href={item.href} className="hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">{item.label}</a>
            )) : ['Inicio', 'Servicios', 'Tarifas'].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} className="hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">{n}</a>
            ))}
            <button className="px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/20 transition-all uppercase tracking-widest text-[10px] font-black text-blue-400">
              Terminal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-48 overflow-hidden" id="inicio">
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${colors.primary}, transparent)` }} />
        <div className="absolute -top-48 -left-48 w-96 h-96 opacity-10 rounded-full blur-3xl animate-pulse" style={{ background: colors.accent }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-12">
            <Zap size={14} className="animate-bounce" /> {uiLogic.visual_pop_strategy || "Cognitive Design System Active"}
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-10 leading-[0.95] animate-in fade-in slide-in-from-bottom duration-1000">
            {seo.title || `The Future of ${brand.name || 'Your Business'}`}
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed italic">
            "{seo.description || "Unlocking new digital horizons through advanced AI integration and premium web experiences."}"
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <button 
              className="px-12 py-6 rounded-2xl text-white font-black text-xl shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-2 hover:brightness-110 flex items-center gap-3 uppercase italic tracking-tighter"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
            >
              Get Started Now <ArrowRight size={24} />
            </button>
            <button className="px-12 py-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 font-bold text-lg transition-all uppercase tracking-widest text-sm">
              Portfolio
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Content Grid */}
      <section className="py-32 bg-slate-950 relative" id="servicios">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="p-12 rounded-[40px] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all group flex flex-col relative overflow-hidden backdrop-blur-3xl">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl" />
                <div className="w-16 h-16 rounded-3xl bg-slate-950 flex items-center justify-center mb-10 border border-white/5 group-hover:bg-blue-600 transition-colors shadow-xl">
                  <Star className="text-blue-500 group-hover:text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-white uppercase italic tracking-tighter">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-lg flex-1 mb-10">{feature.desc}</p>
                <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] group-hover:text-blue-400 transition-colors" style={{ color: colors.primary }}>
                  Explore Node <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Autonomous Terminal Section */}
      <section className="py-40 border-t border-white/5 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 shadow-2xl">
              <Bot className="text-blue-400" size={40} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter">AI Maintenance Terminal</h2>
            <p className="text-slate-400 text-xl max-w-2xl font-medium leading-relaxed">
              Propulsa este sitio a la siguiente iteración neural. Nuestra enjambre procesará tu solicitud de mantenimiento en tiempo real.
            </p>
          </div>
          <div className="p-8 rounded-[40px] bg-black/60 border border-white/5 shadow-2xl backdrop-blur-2xl">
             <MaintenanceForm tenantId={tenantId!} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="flex items-center gap-4">
            <Shield className="text-blue-500/50" size={24} />
            <div>
               <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 block mb-1">FACTORY PROTOCOL</span>
               <span className="text-xs font-bold text-slate-500">SECURED BY AI SWARM v4.3</span>
            </div>
          </div>
          <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
            {['Legal', 'Cyber', 'Vault'].map(l => (
              <a key={l} href="#" className="hover:text-blue-400 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-700">
            © {new Date().getFullYear()} {brand.name || 'NEURAL NODE'}
          </p>
        </div>
      </footer>
    </div>
  );
}

