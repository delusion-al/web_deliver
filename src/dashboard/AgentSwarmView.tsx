import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Bot, Code, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { SwarmOrchestrator, SwarmMessage } from '../agents/SwarmOrchestrator';

export function AgentSwarmView() {
  const [task, setTask] = useState('');
  const [messages, setMessages] = useState<SwarmMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [swarm] = useState(new SwarmOrchestrator());

  const handleStartSwarm = async () => {
    if (!task) return;
    setIsProcessing(true);
    setMessages([]);
    await swarm.processTask(task, (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    setIsProcessing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Manager': return <Bot className="text-blue-500" />;
      case 'Architect': return <Cpu className="text-purple-500" />;
      case 'Coder': return <Code className="text-emerald-500" />;
      case 'Reviewer': return <ShieldCheck className="text-orange-500" />;
       default: return <Activity className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
           NEURAL SWARM COMMAND
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto uppercase tracking-widest font-mono">
           Orquestación Descentralizada • Gemma 4 Config • Protocolo Claude Leak
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 glass-card border-slate-800/50 bg-slate-950/40 p-4">
          <CardHeader className="text-center">
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
               <Bot className="text-blue-400" />
            </div>
            <CardTitle className="text-sm">Manager Node</CardTitle>
            <CardDescription className="text-[10px]">Supervisor de objetivos cognitivos</CardDescription>
          </CardHeader>
          <div className="space-y-4 p-4 border-t border-slate-800/50">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">NVIDIA LOCAL NIM</label>
                <div className="text-[10px] text-emerald-400 bg-emerald-400/5 p-2 rounded border border-emerald-400/20">STATUS: CONECTADO</div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">MÉTRICA DE COHERENCIA</label>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                   <div className="h-full w-4/5 bg-blue-500 animate-pulse" />
                </div>
             </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-4">
           <Card className="glass-card border-slate-800/50 bg-black/60 p-6">
              <div className="flex gap-4">
                 <Input 
                   placeholder="Instrucción de mantenimiento (ej: 'Reimplementar Navbar con Glassmorphism')..." 
                   className="bg-slate-950 border-slate-800 h-12 text-sm focus:ring-blue-500/50"
                   value={task}
                   onChange={e => setTask(e.target.value)}
                 />
                 <Button 
                   onClick={handleStartSwarm} 
                   disabled={isProcessing || !task}
                   className="h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" /> : 'DESPLEGAR ENJAMBRE'}
                 </Button>
              </div>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              {messages.map((msg, i) => (
                <Card key={i} className="glass-card border-slate-800 bg-slate-900/40 p-4 animate-in slide-in-from-bottom duration-500 relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                         {getRoleIcon(msg.role)}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.role} Agent</span>
                         <span className={`text-[9px] font-mono ${msg.status === 'done' ? 'text-emerald-400' : 'text-blue-400 animate-pulse'}`}>
                            [{msg.status.toUpperCase()}]
                         </span>
                      </div>
                   </div>
                   <p className="text-xs text-slate-300 font-mono line-clamp-3 bg-black/30 p-2 rounded">
                      {msg.content}
                   </p>
                </Card>
              ))}
              {isProcessing && messages.length < 4 && (
                 <div className="col-span-2 flex justify-center py-10 opacity-30 italic text-xs animate-pulse">Sincronizando consciencia colectiva...</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
