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

  useEffect(() => {
    async function loadTenant() {
      if (!tenantId) return;
      const { data: tenantData } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
      const { data: configData } = await supabase.from('tenant_configs').select('*').eq('tenant_id', tenantId).single();
      if (tenantData) setTenant(tenantData);
      if (configData) setConfig(configData);
      setLoading(false);
    }
    loadTenant();
  }, [tenantId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-blue-500 animate-pulse font-mono uppercase tracking-widest">Sincronizando con AI Factory...</div>;
  if (!tenant || !config) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-500 font-bold uppercase tracking-widest px-8 text-center">404 // Protocolo de sitio no encontrado</div>;

  const { brand = {}, seo = {}, pages = [], navbar = [] } = config;
  const homePage = pages.find((p: any) => p.id === 'home') || pages[0] || {};
  const features = homePage.features || [];
  const colors = brand.colors || { primary: '#3b82f6', secondary: '#0f172a', accent: '#8b5cf6' };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.substring(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500" style={{ '--primary': colors.primary } as any}>
      {/* Premium Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
              <Globe className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase italic">
              {brand.logo_text || tenant.domain_name.split('.')[0]}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {navbar.map((item: any) => (
              <a 
                key={item.label} 
                href={item.href} 
                onClick={(e) => handleNavClick(e, item.href)}
                className="hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]"
              >
                {item.label}
              </a>
            ))}
            <button 
              onClick={(e) => handleNavClick(e, '#contacto')}
              className="px-6 py-2 rounded-full border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all uppercase tracking-widest text-[10px] font-bold text-slate-200"
            >
              Contacto
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-48 overflow-hidden" id="inicio">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${colors.primary}, transparent)` }} />
        <div className="absolute -top-48 -left-48 w-96 h-96 opacity-10 rounded-full blur-3xl animate-pulse" style={{ background: colors.accent }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-10 animate-in slide-in-from-top duration-700">
            <Zap size={14} /> Nueva experiencia digital actived
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-10 leading-[1.1] animate-in fade-in slide-in-from-bottom duration-1000">
            {seo.title || `Official Website of ${tenant.domain_name}`}
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom delay-200 duration-1000">
            {seo.description || "Unlocking new digital horizons through advanced AI integration and premium web experiences."}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom delay-500 duration-1000">
            <button 
              onClick={(e) => handleNavClick(e, '#servicios')}
              className="px-10 py-5 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-2 flex items-center gap-3"
              style={{ background: colors.primary }}
            >
              Explorar Servicios <ArrowRight size={20} />
            </button>
            <button 
              onClick={(e) => handleNavClick(e, '#maintenance')}
              className="px-10 py-5 rounded-2xl border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold text-lg transition-all"
            >
              Saber Más
            </button>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <section className="py-32 bg-slate-950 relative" id="servicios">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:border-blue-500/50 transition-all group h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center mb-8 border border-slate-800 group-hover:bg-blue-600 transition-colors" style={{ '--hover-color': colors.primary } as any}>
                  <Star className="text-blue-500 group-hover:text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed flex-1">{feature.desc}</p>
                <div className="mt-8 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]" style={{ color: colors.primary }}>
                  Ver Detalles <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance Loop Section - THE AUTOMATION BRIDGE */}
      <section className="py-32 border-t border-slate-900 bg-slate-950 relative overflow-hidden" id="maintenance">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <Bot className="text-blue-400" size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase italic">AI Maintenance Terminal</h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              Este sitio está monitorizado por AI Web Factory. Solicita cualquier cambio o corrección técnica mediante este terminal seguro.
            </p>
          </div>
          <MaintenanceForm tenantId={tenantId!} />
        </div>
      </section>

      {/* Contact Placeholder / Footer Target */}
      <div id="contacto" className="h-1" />

      {/* Global Footer */}
      <footer className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-500" size={20} />
            <span className="text-sm font-bold tracking-widest uppercase text-slate-500">Secured by AI Factory</span>
          </div>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Legal</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">
            © {new Date().getFullYear()} {brand.logo_text}
          </p>
        </div>
      </footer>
    </div>
  );
}
