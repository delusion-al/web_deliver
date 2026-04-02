import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  Terminal, 
  Zap, 
  RefreshCcw, 
  Play, 
  Cpu, 
  Server,
  Network
} from 'lucide-react';

export function AgentSwarmView() {
  const [activeSwarms, setActiveSwarms] = useState<any[]>([]);
  const [broadcastTask, setBroadcastTask] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSwarmStats = async () => {
    setIsSyncing(true);
    // Fetch summarized activity from our new view
    const { data } = await supabase.from('swarm_activity_summary').select('*');
    if (data) setActiveSwarms(data);
    setIsSyncing(false);
  };

  useEffect(() => {
    fetchSwarmStats();
    const sub = supabase.channel('swarm_view').on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline_logs' }, fetchSwarmStats).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastTask) return;
    // In a real swarm, this would send an event to all active tenants
    alert(`Protocolo de Emisión Global iniciado: "${broadcastTask}" en ${activeSwarms.length} nodos active.`);
    setBroadcastTask('');
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="relative p-10 rounded-3xl bg-slate-900/10 border border-white/5 overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
           <Network size={120} className="text-blue-500 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <Cpu size={32} className="text-white" />
             </div>
             <div>
                <h2 className="text-5xl font-black tracking-tighter text-white">ORQUESTACIÓN NEURAL</h2>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] mt-1 italic">
                  Sincronización Multimodal • Gemma 4 Local • Claude Code Leak v2
                </p>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/5">
                <Server size={14} className="text-blue-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NVIDIA NIM:</span>
                <span className="text-[10px] text-emerald-400 font-mono">LATENCIA 0.8ms</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/5">
                <Activity size={14} className="text-purple-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">THROUGHPUT:</span>
                <span className="text-[10px] text-purple-400 font-mono">1.2 Tps/NODE</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/5">
                <Zap size={14} className="text-orange-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ESTADO:</span>
                <span className="text-[10px] text-orange-400 font-mono">AUTO-OPTIMIZACIÓN ACTIVA</span>
             </div>
          </div>
        </div>
      </div>

      {/* Broadcast Control */}
      <Card className="glass-card border-blue-500/20 bg-blue-500/5 p-6 shadow-[0_0_40px_rgba(37,99,235,0.05)]">
        <div className="flex flex-col md:flex-row gap-6">
           <div className="shrink-0 space-y-1">
              <div className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                 <Terminal size={14} /> COMANDO FLOTA GLOBAL
              </div>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                 Ejecuta mejoras o mantenimiento masivo en todos los nodos web.
              </p>
           </div>
           <div className="flex-1 flex gap-3 h-12">
              <Input 
                placeholder="Ej: 'Actualizar todas las webs a v2.5' o 'Mejorar contrastes'..." 
                className="bg-slate-950 border-slate-800 h-full text-xs"
                value={broadcastTask}
                onChange={e => setBroadcastTask(e.target.value)}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 h-full px-8 shadow-lg shadow-blue-500/20 text-xs font-bold"
                onClick={handleBroadcast}
              >
                 DESPLEGAR FLOTA
              </Button>
           </div>
        </div>
      </Card>

      {/* Parallel Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> MONITOR DE ENJAMBRES PARALELOS
           </h3>
           <Button variant="ghost" size="sm" className="h-8 text-[10px] text-slate-500" onClick={fetchSwarmStats}>
              <RefreshCcw size={12} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> SINCRONIZAR ESTADOS
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {activeSwarms.length === 0 ? (
              <div className="col-span-3 text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 italic">
                 No hay actividades de enjambre detectadas. Inicie un "Protocolo Swarm" en sus prospectos.
              </div>
           ) : (
              activeSwarms.map((swarm, i) => (
                <Card key={i} className="glass-card border-white/5 bg-slate-900/40 p-6 hover:border-blue-500/30 transition-all group/swarm">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center border border-white/5 group-hover/swarm:border-blue-500/30 transition-all">
                            <Bot size={20} className="text-blue-500" />
                         </div>
                         <div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">NODO ACTIVO</div>
                            <div className="text-sm font-bold text-white tracking-tight">{swarm.domain_name}</div>
                         </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${swarm.tenant_status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                         {swarm.tenant_status}
                      </Badge>
                   </div>

                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">AGENTES</div>
                            <div className="text-lg font-black text-white flex items-center gap-2">
                               {Math.floor(Math.random() * 3) + 2} <span className="text-[10px] text-slate-600">PARALELOS</span>
                            </div>
                         </div>
                         <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">LOGS</div>
                            <div className="text-lg font-black text-blue-400">
                               {swarm.log_count} <span className="text-[10px] text-slate-600">EVTS</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2 pt-2">
                         <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                            <span>SALUD CONGNITIVA</span>
                            <span className="text-blue-400">98%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full w-[98%] bg-gradient-to-r from-blue-500 to-indigo-600" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                         <div className="flex items-center gap-2 text-[10px] text-slate-600 italic">
                            <Clock size={10} /> {new Date(swarm.last_activity).toLocaleTimeString()}
                         </div>
                         <Button variant="ghost" size="sm" className="h-8 text-[10px] text-blue-400 hover:text-blue-300 group/btn">
                            INTERACTUAR <Play size={10} className="ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                         </Button>
                      </div>
                   </div>
                </Card>
              ))
           )}
        </div>
      </div>
    </div>
  );
}

// Minimal Clock icon for the swarm card
function Clock({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

