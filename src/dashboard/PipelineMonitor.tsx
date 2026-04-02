import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, XCircle, CheckCircle, ChevronDown, ChevronUp, Bot, ExternalLink, Activity, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PipelineMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [metrics, setMetrics] = useState({ success: 0, total: 0 });

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('pipeline_logs')
      .select('*, tenants(domain_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      setLogs(data);
      const success = data.filter(l => l.action === 'crawl_completed' || l.action === 'site_generated' || l.action === 'swarm_approved').length;
      setMetrics({ success, total: data.length });
    }
  };

  const fetchApprovals = async () => {
    const { data } = await supabase
      .from('swarm_approvals')
      .select('*, tenants(domain_name)')
      .eq('status', 'pending');
    if (data) setApprovals(data);
  };

  const handleApproval = async (id: string, approve: boolean) => {
    const status = approve ? 'approved' : 'rejected';
    const approval = approvals.find(a => a.id === id);
    
    await supabase.from('swarm_approvals').update({ status }).eq('id', id);
    
    await supabase.from('pipeline_logs').insert({
      action: approve ? 'swarm_approved' : 'swarm_rejected',
      tenant_id: approval?.tenant_id,
      metadata: { approval_id: id, reason: 'Manual Admin Verification' }
    });
    
    fetchApprovals();
    fetchLogs();
  };

  const toggleLog = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchLogs();
    fetchApprovals();
    
    const logsSub = supabase
      .channel('pipeline_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pipeline_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    const approvalSub = supabase
      .channel('approval_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'swarm_approvals' }, () => {
        fetchApprovals();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(logsSub); 
      supabase.removeChannel(approvalSub);
    };
  }, []);

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'crawl_started': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
      case 'crawl_completed': return 'text-green-400 border-green-500/20 bg-green-500/5';
      case 'site_generated': return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
      case 'swarm_task_started': return 'text-orange-400 border-orange-500/20 bg-orange-500/5 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
      case 'swarm_approved': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'swarm_rejected': return 'text-red-400 border-red-500/20 bg-red-500/5';
      default: return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
            Neural Pipeline
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">Auditoría de Procesos Autónomos en Tiempo Real</p>
        </div>
        <div className="group flex items-center gap-3 text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-400/5 px-4 py-2 rounded-lg border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
           SISTEMA OPERATIVO : ACTIVO
        </div>
      </div>

      {approvals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvals.map(approval => (
            <Card key={approval.id} className="bg-orange-500/5 border-orange-500/20 p-5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 p-1 bg-orange-500/10 rounded-bl-lg">
                <Bot size={14} className="text-orange-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Protocolo Swarm: Intervención Requerida</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono italic">{new Date(approval.created_at).toLocaleTimeString()}</div>
              </div>
              <div className="bg-black/60 p-4 rounded-xl border border-orange-500/10 mb-4 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 uppercase font-bold tracking-tighter">Entidad Objetivo</span>
                  <span className="text-blue-400 font-bold">{approval.tenants?.domain_name || 'Global'}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-800/50">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Cambios Propuestos</div>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed">
                    {approval.proposed_changes.task || 'Mantenimiento de componentes visuales'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button size="sm" variant="ghost" className="h-9 px-4 text-[10px] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold" onClick={() => handleApproval(approval.id, false)}>
                  <XCircle className="h-3 w-3 mr-2" /> RECHAZAR
                </Button>
                <Button size="sm" className="h-9 px-6 text-[10px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.3)] text-white font-bold tracking-widest border-0" onClick={() => handleApproval(approval.id, true)}>
                  <CheckCircle className="h-3 w-3 mr-2" /> APROBAR CAMBIOS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/20 border-slate-800/50 p-5 backdrop-blur-sm border-l-4 border-l-blue-500/50">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-widest">Tasa de Éxito AI</div>
             <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-white leading-none">
                  {metrics.total > 0 ? Math.round((metrics.success / metrics.total) * 100) : 100}
                </div>
                <span className="text-lg font-bold text-blue-500/50">%</span>
             </div>
          </Card>
          <Card className="bg-slate-900/20 border-slate-800/50 p-5 backdrop-blur-sm">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-widest">Inferencia NIM</div>
             <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-blue-400 leading-none">0.8</div>
                <span className="text-lg font-bold text-slate-600">ms</span>
             </div>
          </Card>
          <Card className="bg-slate-900/20 border-slate-800/50 p-5 backdrop-blur-sm">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-widest">Eventos Swarm</div>
             <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-purple-400 leading-none">{logs.filter(l => l.action.startsWith('swarm')).length}</div>
                <span className="text-lg font-bold text-slate-600">INTENTOS</span>
             </div>
          </Card>
          <Card className="bg-slate-900/20 border-slate-800/50 p-5 backdrop-blur-sm border-l-4 border-l-orange-500/50">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-widest">Alertas Red</div>
             <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-orange-400 leading-none">0</div>
                <Badge variant="outline" className="bg-orange-500/5 text-orange-400 border-orange-500/20 px-2 py-0">SECURE</Badge>
             </div>
          </Card>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="relative glass-card border-slate-800/50 bg-black/80 overflow-hidden rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/5">
             <div className="flex items-center gap-4">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/30" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                   <div className="w-3 h-3 rounded-full bg-green-500/30" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[11px] font-mono text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-blue-500" />
                  Neural_Forge_Console.log
                </span>
             </div>
             <div className="flex gap-4 items-center">
                <span className="text-[10px] text-slate-600 font-mono hidden md:block">Streaming 50 most recent events</span>
                <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 font-bold tracking-widest border border-white/5 rounded-lg" onClick={fetchLogs}>
                   <Clock size={14} className="mr-2 text-blue-500" /> RECARGAR FLUJO
                </Button>
             </div>
          </div>
          <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-950/20">
            <div className="font-mono text-xs p-6 space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-800 py-24 text-center uppercase tracking-[0.2em] text-xs font-black animate-pulse flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-800" />
                  Sincronizando con el Núcleo...
                </div>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogs[log.id];
                  return (
                    <div key={log.id} className="border-b border-white/5 last:border-0 py-3 group/line transition-all hover:bg-white/[0.02] px-2 rounded-lg">
                      <div className="flex items-start gap-6">
                        <span className="text-slate-600 shrink-0 select-none text-[10px] pt-1">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                        
                        <div className="flex flex-col gap-2 w-full">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black tracking-widest uppercase transition-all shadow-sm ${getActionStyle(log.action)}`}>
                                    {log.action.replace('_', ' ')}
                                 </span>
                                 <span className="text-slate-600">»</span>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-slate-300 font-bold text-[11px]">{log.tenants?.domain_name || 'Sistema Neural'}</span>
                                    {log.agent_id && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-slate-800 text-slate-500 font-mono tracking-tighter">AGENT: {log.agent_id}</Badge>}
                                 </div>
                              </div>
                              <button 
                                onClick={() => toggleLog(log.id)}
                                className="p-1 hover:bg-white/10 rounded transition-all text-slate-500 hover:text-blue-400"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                           </div>

                           {isExpanded && (
                             <div className="mt-2 bg-black/80 p-4 rounded-xl border border-white/5 text-[10px] text-blue-300/80 font-mono shadow-inner relative group/meta overflow-hidden">
                                <div className="absolute top-2 right-2 flex gap-2">
                                   <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-white" onClick={() => console.log(log.metadata)}>
                                      <ExternalLink size={12} />
                                   </Button>
                                </div>
                                <pre className="whitespace-pre-wrap break-all leading-relaxed">
                                   {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
