import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../templates/store';
import { AdminGuard } from '../templates/AdminGuard';
import { Button } from '@/components/ui/button';
import { Layout, MessageSquare, History, Settings, LogOut, Bot, Zap } from 'lucide-react';
import { MaintenanceForm } from '../templates/components/MaintenanceForm';

export function ClientDashboardApp() {
  const { tenantId } = useParams();
  const { signOut } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'ticket' | 'history' | 'settings'>('overview');

  return (
    <AdminGuard roles={['tenant_admin', 'admin']} tenantId={tenantId} fallback={
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white p-8 text-center flex-col gap-4">
        <Bot size={64} className="text-red-500 animate-pulse" />
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Acceso No Autorizado</h2>
        <p className="text-slate-400 max-w-md">No tienes permisos para gestionar la terminal de este negocio.</p>
        <Button variant="outline" onClick={() => window.location.href = '/'}>Página Principal</Button>
      </div>
    }>
      <div className="flex min-h-screen bg-slate-950">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-900 flex flex-col fixed h-screen bg-slate-950/50 backdrop-blur-xl">
          <div className="p-8">
            <div className="flex items-center gap-3 text-white">
              <Zap size={24} className="text-blue-500" />
              <h1 className="text-lg font-bold tracking-tight uppercase italic">Client Hub</h1>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'overview' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <Layout size={18} /> Resumen
            </button>
            <button onClick={() => setActiveTab('ticket')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'ticket' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <MessageSquare size={18} /> Abrir Ticket
            </button>
            <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'history' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <History size={18} /> Historial
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <Settings size={18} /> Ajustes
            </button>
          </nav>

          <div className="p-6 mt-auto border-t border-slate-900">
             <Button variant="ghost" className="w-full text-slate-500 hover:text-red-400" onClick={signOut}>
                <LogOut size={16} className="mr-2" /> Salir
             </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-64 flex-1 p-12">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black text-white">Estado del Sitio</h2>
                        <p className="text-slate-400 mt-2">Monitorizando {tenantId}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> PROD — ONLINE
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
                        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-4">Mantenimiento IA</h3>
                        <p className="text-white font-medium mb-6">Tu sitio está siendo optimizado por nuestra red neuronal permanentemente.</p>
                        <Button className="bg-blue-600 hover:bg-blue-500 w-full rounded-2xl h-12" onClick={() => setActiveTab('ticket')}>Solicitar Cambio</Button>
                    </div>
                    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
                        <h3 className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-4">Tickets Activos</h3>
                        <div className="text-4xl font-black text-white">0</div>
                        <p className="text-slate-600 mt-2 text-sm">No hay intervenciones pendientes.</p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'ticket' && (
              <div className="animate-in fade-in zoom-in duration-500">
                 <MaintenanceForm tenantId={tenantId!} />
              </div>
            )}

            {(activeTab === 'history' || activeTab === 'settings') && (
              <div className="text-center py-32 border-2 border-dashed border-slate-900 rounded-3xl text-slate-600 italic">
                Sincronizando con el servidor central... Función en desarrollo.
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
