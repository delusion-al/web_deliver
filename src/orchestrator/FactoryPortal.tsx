import { useNavigate } from 'react-router-dom';
import { Bot, Search, Globe, Activity, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Premium Portal Landing for AI Factory Orchstrator
 */
export function FactoryPortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 overflow-hidden relative">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[50vh] h-[50vh] bg-blue-600/5 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-10 left-10 w-[40vh] h-[40vh] bg-blue-500/5 blur-[120px] -z-10 rounded-full" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                <Bot size={24} className="text-blue-500" />
             </div>
             <h1 className="text-xl font-bold tracking-tight uppercase italic text-white">Neural Forge</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-400 hover:text-white uppercase tracking-widest text-[10px] font-bold h-10 px-6 border-white/5 border">
            Login Admin
          </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <header className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase mb-4 animate-pulse">
                <Zap size={10} /> Sistema Operativo Activo
              </div>
              <h2 className="text-7xl font-black tracking-tighter leading-none text-white italic">
                FORJA TU IMPERIO <br/> <span className="bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">DIGITAL</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Descubre oportunidades de negocio, genera sitios web de alta conversión y gestiónalos autónomamente con nuestra red neural de orquestación.
              </p>
          </header>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button onClick={() => navigate('/login')} size="lg" className="h-16 px-10 bg-white text-slate-950 hover:bg-slate-200 text-sm font-black rounded-3xl group shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all">
                CENTRO DE MANDO <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => window.open('https://github.com/delusion-al/web_deliver', '_blank')} size="lg" variant="outline" className="h-16 px-10 border-slate-800 hover:bg-slate-900 bg-transparent text-slate-300 text-sm font-black rounded-3xl shadow-xl transition-all">
                VER PROTOCOLO GIT
              </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
              <FeatureCard 
                icon={Search} 
                title="Lead Oracle" 
                desc="Escaneo masivo de negocios sin presencia web listo para la conversión." 
              />
              <FeatureCard 
                icon={Globe} 
                title="Web Forge" 
                desc="Generación instantánea de micro-sitios premium basados en datos de mercado." 
              />
              <FeatureCard 
                icon={ShieldCheck} 
                title="Admin Control" 
                desc="Panel centralizado de gestión multi-tenant y monitorización en tiempo real." 
              />
          </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">
         AI Web Factory Orchestrator &copy; 2026 
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-sm text-left group hover:bg-slate-900/60 hover:border-blue-500/20 transition-all duration-500">
        <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
          <Icon size={20} className="text-blue-500" />
        </div>
        <h3 className="text-white font-black uppercase text-xs tracking-widest mb-3 italic group-hover:text-blue-400 transition-colors uppercase">{title}</h3>
        <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
    </div>
  );
}
