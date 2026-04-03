import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

interface MaintenanceFormProps {
  tenantId: string;
}

export function MaintenanceForm({ tenantId }: MaintenanceFormProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('maintenance_tickets').insert({
        tenant_id: tenantId,
        subject: subject,
        description: description,
        contact_email: email,
        status: 'pending'
      });
      
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      alert('Error enviando solicitud: ' + (err.message || 'Error desconocido'));
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm p-8 text-center animate-in zoom-in duration-300">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <CardTitle className="text-xl font-bold mb-2">Solicitud Enviada</CardTitle>
        <CardDescription>
          Hemos abierto un ticket de mantenimiento en nuestro sistema. Nuestra AI lo procesará en breve. 
          Recibirás un correo electrónico una vez se resuelva.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="glass-card shadow-xl overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-br from-blue-600/10 to-transparent p-8">
        <CardTitle className="text-2xl font-bold">Solicitud de Mantenimiento AI</CardTitle>
        <CardDescription className="text-slate-400">
          ¿Necesitas un cambio en el diseño, textos o añadir una nueva sección? 
          Nuestra AI procesará tu solicitud automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tu Email</label>
            <Input 
              type="email" 
              required 
              placeholder="email@negocio.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="bg-slate-950/50 border-slate-800"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Asunto</label>
            <Input 
              required 
              placeholder="Ej: Cambiar color primario, Añadir mapa..." 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="bg-slate-950/50 border-slate-800"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Descripción del Cambio</label>
            <Textarea 
              required 
              placeholder="Describe detalladamente qué te gustaría modificar..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={4}
              className="bg-slate-950/50 border-slate-800 resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {loading ? 'Sincronizando con AI...' : 'Solicitar Cambio'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
