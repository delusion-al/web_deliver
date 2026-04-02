import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, RefreshCcw, Trash2, Layout } from 'lucide-react';

export function SitesManager() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tenants')
      .select('*, tenant_configs(brand, seo)')
      .order('created_at', { ascending: false });
    if (data) setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Activo</Badge>;
      case 'maintenance': return <Badge variant="outline">Mantenimiento</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Factoría de Sitios</h2>
        <Button size="sm" variant="outline" className="gap-2" onClick={fetchTenants}>
          <RefreshCcw className="h-4 w-4" /> Refrescar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Total Desplegados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenants.length}</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              +100% <span className="text-slate-500">desde la última sesión</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900/30">
              <TableRow className="border-slate-800/50">
                <TableHead className="p-6">Sitio / Dominio</TableHead>
                <TableHead>Industria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Config</TableHead>
                <TableHead className="text-right p-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-500 animate-pulse">Sincronizando registros...</TableCell></TableRow>
              ) : tenants.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-500 italic">No hay sitios generados aún. ¡Convierte un lead!</TableCell></TableRow>
              ) : (
                tenants.map((t) => (
                  <TableRow key={t.id} className="border-slate-800/30 hover:bg-slate-800/10 transition-colors">
                    <TableCell className="p-6">
                      <div className="font-bold text-slate-200">{t.tenant_configs?.[0]?.brand?.logo_text || 'Sin nombre'}</div>
                      <div className="text-xs text-blue-400 flex items-center gap-1">
                        <Globe size={12} /> {t.domain_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px]">{t.industry || 'General'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-right p-6">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 border-slate-700 hover:text-blue-400"
                          title="Previsualizar"
                          onClick={() => window.open(`${import.meta.env.BASE_URL}#/preview/${t.id}`, '_blank')}
                        >
                          <ExternalLink size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 border-slate-700 hover:text-orange-400"
                          title="Refinar con AI"
                        >
                          <Layout size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 border-slate-700 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
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
