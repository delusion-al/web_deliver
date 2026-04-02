import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, XCircle, CheckCircle } from 'lucide-react';

export function PipelineMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ success: 0, total: 0 });

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('pipeline_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      setLogs(data);
      const success = data.filter(l => l.action === 'crawl_completed' || l.action === 'site_generated').length;
      setMetrics({ success, total: data.length });
    }
  };

  const fetchApprovals = async () => {
    const { data } = await supabase
      .from('swarm_approvals')
      .select('*, tenants(name)')
      .eq('status', 'pending');
    if (data) setApprovals(data);
  };

  const handleApproval = async (id: string, approve: boolean) => {
    const status = approve ? 'approved' : 'rejected';
    await supabase.from('swarm_approvals').update({ status }).eq('id', id);
    fetchApprovals();
  };

  useEffect(() => {
    fetchLogs();
    fetchApprovals();
    
    const logsSub = supabase
      .channel('pipeline_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pipeline_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 30));
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
      case 'swarm_task_started': return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
      default: return 'text-slate-400 border-slate-700 bg-slate-900/50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Neural Pipeline
          </h2>
          <p className="text-slate-500 text-sm mt-1">Monitoreo en tiempo real de las operaciones autónomas</p>
        </div>
        <div className="group flex items-center gap-3 text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-400/5 px-4 py-2 rounded-lg border border-emerald-400/20">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
           SISTEMA OPERATIVO : ACTIVO
        </div>
      </div>

      {approvals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map(approval => (
            <Card key={approval.id} className="bg-orange-500/5 border-orange-500/20 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Aprobación Swarm Pendiente</span>
                </div>
                <div className="text-[9px] text-slate-500">{new Date(approval.created_at).toLocaleTimeString()}</div>
              </div>
              <p className="text-xs text-slate-300 font-mono bg-black/40 p-3 rounded border border-orange-500/10 mb-4">
                Petición: {approval.proposed_changes.task || 'Mantenimiento General'}
                <br/> Site: <span className="text-blue-400">{approval.tenants?.name || 'Sistema'}</span>
              </p>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-700 hover:bg-red-500/10 text-red-400" onClick={() => handleApproval(approval.id, false)}>
                  <XCircle className="h-3 w-3 mr-1" /> RECHAZAR
                </Button>
                <Button size="sm" className="h-7 text-[10px] bg-orange-500 hover:bg-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.2)]" onClick={() => handleApproval(approval.id, true)}>
                  <CheckCircle className="h-3 w-3 mr-1" /> APROBAR CAMBIOS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-950/40 border-slate-800 p-4">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Tasa de Éxito AI</div>
             <div className="text-3xl font-bold text-white leading-none">
                {metrics.total > 0 ? Math.round((metrics.success / metrics.total) * 100) : 100}%
             </div>
          </Card>
          <Card className="bg-slate-950/40 border-slate-800 p-4">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Latencia Local NIM</div>
             <div className="text-3xl font-bold text-blue-400 leading-none">0.8s</div>
          </Card>
          <Card className="bg-slate-950/40 border-slate-800 p-4">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Sincronizaciones hoy</div>
             <div className="text-3xl font-bold text-purple-400 leading-none">{logs.filter(l => l.action.startsWith('swarm')).length}</div>
          </Card>
          <Card className="bg-slate-950/40 border-slate-800 p-4 border-l-orange-500/50">
             <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Alertas Criticas</div>
             <div className="text-3xl font-bold text-orange-400 leading-none">0</div>
          </Card>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <Card className="relative glass-card border-slate-800/50 bg-black/60 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/20">
             <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <span className="ml-4 text-xs font-mono text-slate-500 uppercase tracking-tighter">neural_forge_kernel_logs.sh</span>
             </div>
             <Button variant="ghost" size="sm" className="h-8 text-[10px] text-slate-500 hover:text-white" onClick={fetchLogs}>
                <Clock size={12} className="mr-2" /> RECARGAR NÚCLEO
             </Button>
          </div>
          <div className="p-0 max-h-[500px] overflow-y-auto scrollbar-hide">
            <div className="font-mono text-xs p-6 space-y-4">
              {logs.length === 0 ? (
                <div className="text-slate-700 py-10 text-center uppercase tracking-widest text-[10px]">Escuchando el flujo de datos de la IA...</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-4 group/line animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="text-slate-600 shrink-0 select-none">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                    <div className="flex flex-col gap-1 w-full">
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getActionStyle(log.action)}`}>
                             {log.action}
                          </span>
                          <span className="text-slate-400 font-bold">»</span>
                          <span className="text-slate-300">Procesando evento {log.id.substring(0,6)}...</span>
                       </div>
                       <div className="bg-slate-900/50 p-2 rounded-md border border-slate-800/50 text-[10px] text-blue-300/80 break-all hidden group-hover/line:block transition-all">
                          {JSON.stringify(log.metadata, null, 2)}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

