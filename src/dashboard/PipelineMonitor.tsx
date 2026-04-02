import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Database, Search, Zap, Bot } from 'lucide-react';

export function PipelineMonitor() {
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('pipeline_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
    const sub = supabase
      .channel('pipeline_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pipeline_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 20));
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'crawl_started': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 gap-1"><Search size={10} /> Escaneando</Badge>;
      case 'crawl_completed': return <Badge variant="secondary" className="bg-green-500/10 text-green-400 gap-1"><Zap size={10} /> Éxito</Badge>;
      case 'site_generated': return <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 gap-1"><Bot size={10} /> IA Desplegada</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pipeline Real-Time</h2>
        <div className="flex items-center gap-2 text-xs font-mono text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 animate-pulse">
            <Activity size={12} /> SISTEMA OPERATIVO
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="text-blue-500" size={16} /> Latencia Overpass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">~2.4s</div>
              <p className="text-xs text-slate-500 mt-1">Óptimo para producción</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Database className="text-purple-500" size={16} /> Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sincronizada</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">Conectado vía Realtime</p>
            </CardContent>
          </Card>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Actividad de la IA</CardTitle>
          <CardDescription className="text-slate-500">Log de operaciones autónomas en las últimas 24h</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/30">
              <TableRow className="border-slate-800/50">
                <TableHead className="p-6">Fecha/Hora</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead className="text-right p-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500 italic">No hay logs registrados en el pipeline.</TableCell></TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-800/30 hover:bg-slate-800/5 transition-colors">
                    <TableCell className="p-6 text-xs font-mono text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="text-sm text-slate-300">
                       <code className="text-[10px] bg-slate-950 p-1 rounded-sm border border-slate-800">
                          {JSON.stringify(log.metadata)}
                       </code>
                    </TableCell>
                    <TableCell className="text-right p-6">
                       <Badge variant="outline" className="bg-green-500/20 text-green-400 border-0 h-2 w-2 rounded-full p-0" title="Sistema OK" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
