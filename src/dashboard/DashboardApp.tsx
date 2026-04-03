import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useStore } from '../templates/store';
import { AdminGuard } from '../templates/AdminGuard';
import { LeadsManager } from './LeadsManager';
import { SitesManager } from './SitesManager';
import { PipelineMonitor } from './PipelineMonitor';
import { TeamManager } from './TeamManager';
import { Button } from '@/components/ui/button';
import { Globe, Activity, Settings, LogOut, Bot, Search, ShieldCheck } from 'lucide-react';

import { AgentSwarmView } from './AgentSwarmView';

export function DashboardApp() {
  const { user, signOut } = useStore();
  const [activeTab, setActiveTab] = useState<'leads' | 'sites' | 'pipeline' | 'swarm' | 'team' | 'settings'>('leads');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      const { count } = await supabase.from('swarm_approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      setPendingCount(count || 0);
    };
    fetchPending();
    const sub = supabase.channel('nav_badge').on('postgres_changes', { event: '*', schema: 'public', table: 'swarm_approvals' }, fetchPending).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const navItems = [
    { id: 'leads', label: 'Prospects & Leads', icon: Search },
    { id: 'sites', label: 'Generated Sites', icon: Globe },
    { id: 'pipeline', label: 'AI Pipeline', icon: Activity, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'swarm', label: 'Neural Swarm', icon: Bot },
    { id: 'team', label: 'Access & Roles', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AdminGuard roles={['admin']} fallback={
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white p-8 text-center flex-col gap-4">
        <Bot size={64} className="text-blue-500 animate-pulse" />
        <h2 className="text-3xl font-bold tracking-tight">Acceso Denegado</h2>
        <p className="text-slate-400 max-w-md">Esta zona está reservada para el protocolo de administración de la AI Factory.</p>
        <Button variant="outline" onClick={() => window.location.href = '/'}>Volver al Inicio</Button>
      </div>
    }>
      <div className="flex min-h-screen bg-slate-950">
        <aside className="w-64 sidebar-bg flex flex-col fixed h-screen z-50">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
              <Bot size={32} className="text-blue-500" />
              <h1 className="text-xl font-bold tracking-tight uppercase">AI Factory</h1>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-semibold ml-10">Admin Control</p>
          </div>
          
          <nav className="flex-1 mt-6 px-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 group ${
                  activeTab === item.id 
                  ? 'nav-item-active shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800/50 m-4 rounded-xl bg-slate-900/40 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-lg text-white">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-500">Connected</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-8 text-[10px] uppercase tracking-widest" onClick={signOut}>
              <LogOut size={12} className="mr-2" /> Cerrar Sesión
            </Button>
          </div>
        </aside>

        <main className="flex-1 ml-64 p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">FLEET COMMAND</h1>
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Neural Factory Dashboard // v2.8</p>
              </div>
              <div className="flex gap-4">
                <div className="px-5 py-3 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-blue-500/30 transition-all">
                  <Activity size={24} className="text-blue-500 group-hover:animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">ENJAMBRES</span>
                    <span className="text-xl font-black text-white leading-none">12 <span className="text-[10px] text-emerald-500">ACTIVOS</span></span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-purple-500/30 transition-all">
                  <ShieldCheck size={24} className="text-purple-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">TICKETS</span>
                    <span className="text-xl font-black text-white leading-none">5 <span className="text-[10px] text-purple-400">EN COLA</span></span>
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'leads' && <LeadsManager />}
            {activeTab === 'sites' && <SitesManager />}
            {activeTab === 'pipeline' && <PipelineMonitor />}
            {activeTab === 'swarm' && <AgentSwarmView />}
            {activeTab === 'team' && <TeamManager />}
            {activeTab === 'settings' && <div className="text-slate-500 italic p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">Ajustes de la factoría en desarrollo...</div>}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
