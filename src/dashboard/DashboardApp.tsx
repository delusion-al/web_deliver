import { useState } from 'react';
import { useStore } from '../templates/store';
import { AdminGuard } from '../templates/AdminGuard';
import { LeadsManager } from './LeadsManager';
import { SitesManager } from './SitesManager';
import { PipelineMonitor } from './PipelineMonitor';
import { TeamManager } from './TeamManager';
import { Button } from '@/components/ui/button';
import { Globe, Activity, Settings, LogOut, Bot, Search, ShieldCheck } from 'lucide-react';

export function DashboardApp() {
  const { user, signOut } = useStore();
  const [activeTab, setActiveTab] = useState<'leads' | 'sites' | 'pipeline' | 'team' | 'settings'>('leads');

  const navItems = [
    { id: 'leads', label: 'Prospects & Leads', icon: Search },
    { id: 'sites', label: 'Generated Sites', icon: Globe },
    { id: 'pipeline', label: 'AI Pipeline', icon: Activity },
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
        {/* Sidebar - Premium Glassmorphism */}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 group ${
                  activeTab === item.id 
                  ? 'nav-item-active shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:translate-x-1'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800/50 m-4 rounded-xl bg-slate-900/40">
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

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 pl-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            {activeTab === 'leads' && <LeadsManager />}
            {activeTab === 'sites' && <SitesManager />}
            {activeTab === 'pipeline' && <PipelineMonitor />}
            {activeTab === 'team' && <TeamManager />}
            {activeTab === 'settings' && <div className="text-slate-500 italic p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">Ajustes de la factoría en desarrollo...</div>}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
