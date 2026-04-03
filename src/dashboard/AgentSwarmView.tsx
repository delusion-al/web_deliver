import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  Terminal, 
  Zap, 
  RefreshCcw, 
  Cpu, 
  Server,
  Network,
  ChevronRight,
  ShieldCheck,
  Code,
  Loader2,
  X,
  ExternalLink
} from 'lucide-react';
// import { SwarmOrchestrator } from '../agents/SwarmOrchestrator';

export function AgentSwarmView() {
  const [activeSwarms, setActiveSwarms] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeLogs, setNodeLogs] = useState<any[]>([]);
  const [isRunningOnNode, setIsRunningOnNode] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');

  const fetchSwarmStats = async () => {
    setIsSyncing(true);
    // Fetch summarized activity from our new view
    const { data } = await supabase.from('swarm_activity_summary').select('*');
    if (data) setActiveSwarms(data);
    setIsSyncing(false);
  };

  const fetchNodeLogs = async (tenantId: string) => {
    if (!tenantId) return;
    const { data } = await supabase
      .from('pipeline_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNodeLogs(data);
  };

  useEffect(() => {
    fetchSwarmStats();
    const sub = supabase.channel('swarm_view').on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline_logs' }, fetchSwarmStats).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleInteract = async (node: any) => {
    if (!node.tenant_id) return;
    setSelectedNode(node);
    fetchNodeLogs(node.tenant_id);
    
    // Subscribe to real-time logs for this specific node
    const channel = supabase.channel(`node_${node.tenant_id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'pipeline_logs',
        filter: `tenant_id=eq.${node.tenant_id}`
      }, (payload) => {
        setNodeLogs(prev => [payload.new, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const runManualOptimize = async (special_task?: string) => {
    if (!selectedNode || isRunningOnNode) return;
    setIsRunningOnNode(true);
    
    try {
      // THE NEW SECURE WAY: Instead of running directly, we queue a task for the Worker
      // This allows the Worker (which has the NVIDIA keys and local Gemma access) to handle it.
      await supabase.from('swarm_approvals').insert({
        tenant_id: selectedNode.tenant_id,
        proposed_changes: { 
          task: special_task || "Auto-optimization and quality audit (High Contrast & SEO)",
          source: 'dashboard_manual_trigger'
        },
        status: 'pending',
        agent_id: 'Manager'
      });
      
      // Local feedback
      setNodeLogs(prev => [{
        created_at: new Date().toISOString(),
        agent_id: 'System',
        action: 'swarm_task_queued',
        metadata: { task: special_task || "Neural request sent to background worker..." }
      }, ...prev]);

      fetchSwarmStats();
    } catch (e) {
      console.error(e);
    }
    // We keep it "running" briefly for UI feedback
    setTimeout(() => setIsRunningOnNode(false), 2000);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-1000 p-4">
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
                <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">ORQUESTACIÓN NEURAL</h2>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] mt-1">
                  Sincronización Multimodal • Gemma 4 Local • NVIDIA NIM v3
                </p>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">NEURAL CORE:</span>
                <span className="text-[10px] text-emerald-400 font-mono">ACTIVE (STABLE)</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/5">
                <Server size={14} className="text-blue-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">COGNITIVE SOURCE:</span>
                <span className="text-[10px] text-emerald-400 font-mono">NVIDIA NIM + LOCAL HYBRID</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-lg border border-white/5">
                <Activity size={14} className="text-purple-400" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OPS PULSE:</span>
                <span className="text-[10px] text-purple-400 font-mono">ENHANCED FEED</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Parallel Grid - Main 3 Columns */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> MONITOR DE ENJAMBRES PARALELOS
             </h3>
             <Button variant="ghost" size="sm" className="h-8 text-[10px] text-slate-500" onClick={fetchSwarmStats}>
                <RefreshCcw size={12} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> SINCRONIZAR ESTADOS
             </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {activeSwarms.length === 0 ? (
                <div className="col-span-2 text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 italic">
                   No hay actividades de enjambre detectadas.
                </div>
             ) : (
                activeSwarms.map((swarm, i) => (
                  <Card key={i} className={`glass-card border-white/5 bg-slate-900/40 p-6 hover:border-blue-500/30 transition-all group/swarm ${selectedNode?.tenant_id === swarm.tenant_id ? 'ring-2 ring-blue-500/50 scale-[1.02]' : ''}`}>
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center border border-white/5 group-hover/swarm:border-blue-500/30 transition-all">
                              <Bot size={20} className="text-blue-500" />
                           </div>
                           <div>
                              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">NODO ACTIVO</div>
                              <div className="text-sm font-bold text-white tracking-tight truncate max-w-[150px]">{swarm.domain_name}</div>
                           </div>
                        </div>
                        <Badge variant="outline" className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${swarm.tenant_status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                           {swarm.tenant_status}
                        </Badge>
                     </div>

                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                              <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">AGENTES</div>
                              <div className="text-lg font-black text-white flex items-center gap-2">
                                 {Math.floor(Math.random() * 3) + 2} <span className="text-[10px] text-slate-600">ACTIVE</span>
                              </div>
                           </div>
                           <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                               <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">MÉTRICA</div>
                               <div className="text-lg font-black text-blue-400">
                                  {swarm.log_count || 0} <span className="text-[10px] text-slate-600">EVTS</span>
                               </div>
                           </div>
                        </div>

                         <div className="space-y-1.5 pt-2 border-t border-white/5 mt-4">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                               <span>Estado del Proceso</span>
                               <span className="text-blue-400">{swarm.active_progress || (swarm.log_count > 0 ? 10 : 0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 mb-3">
                               <div 
                                 className={`h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ${swarm.active_task_status === 'processing' ? 'animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]' : ''}`} 
                                 style={{ width: `${swarm.active_progress || (swarm.log_count > 0 ? 10 : 0)}%` }} 
                               />
                            </div>
                            
                            {/* Mini Step History */}
                            <div className="space-y-2">
                               {(swarm.task_history as any[])?.slice(-3).map((hist: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-[9px] font-mono text-slate-400 opacity-60">
                                     <div className="w-1 h-1 rounded-full bg-blue-500" />
                                     <span className="uppercase font-black text-blue-500/50">{hist.role}:</span>
                                     <span className="truncate">{hist.summary || hist.content?.substring(0, 30)}</span>
                                  </div>
                               ))}
                               {!swarm.task_history && (
                                  <div className="text-[9px] font-mono text-slate-600 italic">Esperando secuencia neural...</div>
                               )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                               <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase">
                                  <Cpu size={10} className="text-blue-400" />
                                  <span className="text-slate-500">Engine:</span>
                                  <span className="text-blue-400/70">NVIDIA + GEMMA</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase">
                                  <ShieldCheck size={10} className={swarm.github_repo ? "text-emerald-400" : "text-slate-600"} />
                                  <span className="text-slate-500">Sync:</span>
                                  <span className={swarm.github_repo ? "text-emerald-400/70" : "text-slate-600"}>
                                    {swarm.github_repo ? "READY" : "OFFLINE"}
                                  </span>
                                </div>
                            </div>
                         </div>

                         <div className="flex gap-2 mt-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="flex-1 h-10 text-[10px] text-blue-400 hover:text-blue-300 group/btn bg-blue-500/5 border border-blue-500/10"
                             onClick={() => handleInteract(swarm)}
                           >
                              TERMINAL <ChevronRight size={10} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-10 px-3 text-slate-400 hover:text-white bg-white/5 border border-white/10"
                             onClick={() => window.open(`${import.meta.env.BASE_URL}#/preview/${swarm.tenant_id}`, '_blank')}
                           >
                              <ExternalLink size={14} />
                           </Button>
                         </div>
                     </div>
                  </Card>
                ))
             )}
          </div>
        </div>

        {/* Console / Open Box Section - Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 px-2">
             <Terminal size={14} className="text-blue-500" />
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">OPEN BOX CONSOLE</h3>
          </div>

          <Card className="glass-card border-slate-800 bg-black/80 h-[600px] flex flex-col overflow-hidden relative shadow-2xl">
             <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                   {selectedNode ? selectedNode.domain_name : 'No node selected'}
                </span>
                {selectedNode && (
                  <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
             </div>

             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-3">
                {!selectedNode ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600 gap-4">
                     <Terminal size={32} strokeWidth={1} className="animate-pulse" />
                     <p className="uppercase tracking-[0.2em] leading-relaxed">Selecciona un nodo para abrir la terminal neuronal del enjambre.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-blue-500/50 mb-2 font-black border-b border-blue-500/10 pb-1">
                      CONNECTION: PARALLEL_SWARM_{selectedNode.tenant_id ? selectedNode.tenant_id.substring(0,8) : 'UNK'}
                    </div>
                    <div className="text-emerald-500/50 mb-4 animate-pulse flex items-center gap-1">
                      <Zap size={10} /> AUTH: SECURE_WORKER_FEED_ESTABLISHED
                    </div>
                    
                    {nodeLogs.length === 0 ? (
                      <div className="text-slate-800 italic uppercase tracking-widest text-[8px]">Escuchando pulso de agentes...</div>
                    ) : (
                      nodeLogs.map((log, i) => {
                        const content = (log.metadata as any)?.content || log.action || '';
                        const thoughtMatch = typeof content === 'string' ? content.match(/<thought>([\s\S]*?)<\/thought>/) : null;
                        const thought = thoughtMatch ? thoughtMatch[1] : null;
                        const rest = thoughtMatch ? content.replace(/<thought>[\s\S]*?<\/thought>/, '') : content;

                        return (
                          <div key={i} className="animate-in slide-in-from-bottom-1 duration-300 border-l border-white/5 pl-2 ml-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-slate-600">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                               <span className={`${log.agent_id === 'Manager' ? 'text-blue-400' : 'text-purple-400'} font-bold`}>{log.agent_id || 'System'}:</span>
                            </div>
                            
                            {thought && (
                               <div className="bg-blue-500/5 text-blue-300/40 italic p-2 rounded-lg border border-blue-500/10 mb-2 leading-relaxed text-[9px]">
                                  <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 block mb-1">INTERNAL REASONING // PROCESO COGNITIVO</span>
                                  {thought.trim()}
                               </div>
                            )}

                            <div className="text-slate-300 pl-1">
                               {log.action === 'swarm_task_started' ? `> Init task: ${(log.metadata as any)?.task}` : rest}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {isRunningOnNode && (
                       <div className="flex items-center gap-2 text-blue-400 animate-pulse pt-2 border-t border-white/5 mt-4">
                          <Loader2 size={12} className="animate-spin" />
                          <span className="uppercase font-black text-[9px]">SIGNAL SENT TO NEURAL CORE...</span>
                       </div>
                    )}
                  </>
                )}
             </div>

             {selectedNode && (
                <div className="p-4 border-t border-white/5 bg-slate-900/50 mt-auto space-y-4">
                    <div className="relative group">
                       <input 
                         type="text"
                         value={terminalInput}
                         onChange={(e) => setTerminalInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && runManualOptimize(terminalInput)}
                         placeholder="Escribe comando neural... (ej: 'Cambiar a modo oscuro')"
                         className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono italic"
                       />
                       <button 
                         onClick={() => { runManualOptimize(terminalInput); setTerminalInput(''); }}
                         disabled={!terminalInput || isRunningOnNode}
                         className="absolute right-2 top-1.5 p-1.5 bg-blue-500 rounded-lg text-white opacity-0 group-focus-within:opacity-100 transition-opacity disabled:opacity-50"
                       >
                         <ChevronRight size={14} />
                       </button>
                    </div>

                    <div className="flex gap-2">
                       <Button 
                         size="sm" 
                         variant="secondary"
                         className="flex-1 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold h-8 uppercase"
                         onClick={() => runManualOptimize("Redirigir agentes: Enfocarse en Conversión y UX Móvil")}
                         disabled={isRunningOnNode}
                       >
                          <Bot size={12} className="mr-2" /> Redirigir Agents
                       </Button>
                       <Button 
                         size="sm" 
                         variant="secondary"
                         className="flex-1 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold h-8 uppercase"
                         onClick={() => runManualOptimize("Audit SEO e Indexación")}
                         disabled={isRunningOnNode}
                       >
                          <Code size={12} className="mr-2" /> Audit SEO
                       </Button>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-[10px] font-black h-10 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                      onClick={() => runManualOptimize()}
                      disabled={isRunningOnNode}
                    >
                       {isRunningOnNode ? <Loader2 size={14} className="animate-spin mr-2" /> : <Zap size={14} className="mr-2" />}
                       FORZAR OPTIMIZACIÓN NEURAL
                    </Button>
                 </div>
             )}
          </Card>

          {/* Quick Metrics */}
          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">SALUD DE FLOTA</div>
                <div className="flex items-center justify-between">
                   <div className="text-xl font-black text-white">99.8%</div>
                   <div className="h-8 w-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <ShieldCheck size={16} className="text-emerald-400" />
                   </div>
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">BITS PROCESADOS</div>
                <div className="flex items-center justify-between">
                   <div className="text-xl font-black text-white">2.4 TB</div>
                   <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Code size={16} className="text-blue-400" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

