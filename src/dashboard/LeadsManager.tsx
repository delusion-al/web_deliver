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
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) {
      setLeads(data);
      setFilteredLeads(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const filtered = leads.filter(l => 
      l.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.business_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeads(filtered);
  }, [searchTerm, leads]);

  const handleCrawl = async () => {
    if (!city || !type) return alert('Por favor introduce ciudad y tipo');
    setIsCrawling(true);
    try {
      const { data, error } = await supabase.functions.invoke('lead-crawler', {
        body: { location: city, type }
      });
      if (error) throw error;
      alert(`Crawler finalizado. Nuevos Prospectos: ${data.new_inserted}. Sin web: ${data.without_website}`);
      fetchLeads();
    } catch(e: any) {
      alert('Error en oracle: ' + e.message);
    }
    setIsCrawling(false);
  };

  const handleGenerateWeb = async (leadId: string) => {
    setIsCrawling(true);
    try {
      const { SupabaseAdapter } = await import('../infrastructure/SupabaseAdapter');
      const adapter = new SupabaseAdapter();
      const result = await adapter.createTenantFromLead(leadId);
      alert(`Sitio forjado con éxito: ${result.domain}`);
      fetchLeads();
    } catch (e: any) {
      alert('Error en la Forja: ' + e.message);
    }
    setIsCrawling(false);
  };

  const getStatusBadge = (hasWebsite: boolean) => {
    if (!hasWebsite) return <Badge variant="destructive" className="bg-orange-500/20 text-orange-400 border-orange-500/30">Sin Presencia (Prioridad)</Badge>;
    return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Presencia Detectada</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
           ORACLE: LEAD COMMAND
        </h2>
        <div className="relative w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
           <Input 
             placeholder="Buscar en base de datos..." 
             className="pl-10 bg-slate-900/50 border-slate-800 text-xs"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 glass-card border-slate-800/50 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400">Scanner Engine</CardTitle>
            <CardDescription className="text-xs">Ejecuta el Oráculo para detectar nuevos nichos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 ml-1">CIUDAD O PAÍS</label>
                <Input 
                  placeholder="Ej: Madrid, ES" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  className="bg-slate-950 border-slate-800 text-xs focus:ring-blue-500/50"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 ml-1">NICHO / CATEGORÍA</label>
                <Input 
                  placeholder="Ej: dentist, gym..." 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="bg-slate-950 border-slate-800 text-xs"
                />
             </div>
             <Button 
               onClick={handleCrawl} 
               disabled={isCrawling || !city || !type} 
               className="w-full bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
             >
               {isCrawling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
               {isCrawling ? 'Analizando...' : 'Iniciar Oracle'}
             </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 glass-card border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400 text-[10px] p-6">ENTIDAD</TableHead>
                    <TableHead className="text-slate-400 text-[10px]">UBICACIÓN</TableHead>
                    <TableHead className="text-slate-400 text-[10px]">ESTADO DIGITAL</TableHead>
                    <TableHead className="text-right text-slate-400 text-[10px] p-6">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500 animate-pulse">Sincronizando con el Oráculo...</TableCell></TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500">Sin señales detectadas en este parámetro.</TableCell></TableRow>
                  ) : (
                    filteredLeads.map((lead, idx) => (
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
    </div>
  );
}
