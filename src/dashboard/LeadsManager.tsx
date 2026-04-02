import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Globe, Search, Loader2 } from 'lucide-react';

export function LeadsManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCrawl = async () => {
    if (!city || !type) return alert('Por favor introduce ciudad y tipo');
    setIsCrawling(true);
    try {
      const res = await supabase.functions.invoke('lead-crawler', {
        body: { location: city, type }
      });
      if (res.error) throw res.error;
      alert(`Crawler finalizado. Nuevos inserts: ${res.data.new_inserted}. Sin web: ${res.data.without_website}`);
      fetchLeads();
    } catch(e: any) {
      alert('Error en crawler: ' + e.message);
    }
    setIsCrawling(false);
  };

  const handleGenerateWeb = async (leadId: string) => {
    setIsCrawling(true);
    try {
      // Use the logic from our Adapter (already updated with Premium Forge v2.0)
      const { SupabaseAdapter } = await import('../infrastructure/SupabaseAdapter');
      const adapter = new SupabaseAdapter();
      const result = await adapter.createTenantFromLead(leadId);
      
      alert(`¡Nueva Red Neural Forjada! Dominio propuesto: ${result.domain}`);
      fetchLeads();
    } catch (e: any) {
      alert('Error en la Forja: ' + e.message);
    }
    setIsCrawling(false);
  };

  const getStatusBadge = (hasWebsite: boolean) => {
    if (!hasWebsite) return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">No Web (Hot Prospect)</Badge>;
    return <Badge variant="secondary">Tiene Web</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads & Prospects</h2>
      </div>

      <Card className="glass-card overflow-hidden border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-transparent">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Search className="text-blue-500" />
            Lead Oracle
          </CardTitle>
          <CardDescription className="text-slate-400">Escanea ciudades en busca de negocios sin presencia digital</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex gap-6 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Ubicación</label>
              <Input 
                placeholder="Ej: Madrid, ES" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                className="bg-slate-950/50 border-slate-800 focus:ring-blue-500/50 h-12"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Nicho</label>
              <Input 
                placeholder="Ej: restaurante, gym, dental..." 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="bg-slate-950/50 border-slate-800 focus:ring-blue-500/50 h-12"
              />
            </div>
            <Button 
              onClick={handleCrawl} 
              disabled={isCrawling || !city || !type} 
              className="w-48 h-12 bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)] font-bold transition-all"
            >
              {isCrawling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isCrawling ? 'Analizando...' : 'Iniciar Escaneo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/30">
                <TableRow className="border-slate-800/50">
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-widest font-bold h-12 p-6">Entidad</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-widest font-bold h-12">Geolocalización</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-widest font-bold h-12">Estado Digital</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-widest font-bold h-12">Contacto</TableHead>
                  <TableHead className="text-right text-slate-400 text-[10px] uppercase tracking-widest font-bold h-12 p-6">Protocolo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-500 animate-pulse">Sincronizando con el Oráculo...</TableCell></TableRow>
                ) : leads.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-500">Sin señales detectadas. Inicie el escaneo de red.</TableCell></TableRow>
                ) : (
                  leads.map((lead, idx) => (
                    <TableRow key={lead.id} className="border-slate-800/30 hover:bg-slate-800/10 transition-colors animate-in fade-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                      <TableCell className="p-6">
                        <div className="font-bold text-slate-200">{lead.business_name}</div>
                        <div className="text-[10px] text-blue-400/70 uppercase tracking-tighter">{lead.business_type}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{lead.city}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{lead.address}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.has_website)}</TableCell>
                      <TableCell>
                        <div className="text-xs font-mono text-slate-400">{lead.phone || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="text-right p-6">
                        {!lead.tenant_id ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-slate-950 border-slate-700 hover:border-blue-500 hover:text-blue-400 transition-all text-xs"
                            onClick={() => handleGenerateWeb(lead.id)}
                          >
                            <Play className="h-3 w-3 mr-2" /> Forjar Sitio
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-xs"
                            onClick={() => window.open(`${import.meta.env.BASE_URL}preview/${lead.tenant_id}`, '_blank')}
                          >
                            <Globe className="h-3 w-3 mr-2" /> Desplegado
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
