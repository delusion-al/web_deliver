import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, UserPlus, Trash2, RefreshCcw, Mail, Building2 } from 'lucide-react';

export function TeamManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for new user form
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'tenant_admin'>('tenant_admin');
  const [selectedTenant, setSelectedTenant] = useState<string>('none');

  const fetchData = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from('user_roles').select('*, tenants(domain_name)');
    const { data: ten } = await supabase.from('tenants').select('id, domain_name');
    
    if (roles) setUsers(roles);
    if (ten) setTenants(ten);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async () => {
    if (!email) return alert('Email requerido');
    
    // In a real app, you'd use supabase.auth.admin.createUser via an edge function
    // For this demo/Factory v1, we assume the user already exists or we're just assigning the role
    // For the prompt's context, I'll record the role assignment
    
    try {
      // Step 1: In a real flow, you invite the user. 
      // Here, we just insert into user_roles (Supabase Auth usually handles the UID creation)
      // Since this is the AI Factory managing access:
      
      alert('En un entorno de producción, esto dispararía una invitación vía Supabase Auth Admin API. \n\nAsignando permisos en la base de datos...');
      
      const { error } = await supabase.from('user_roles').insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Reference UID if exists
        role,
        tenant_id: selectedTenant === 'none' ? null : selectedTenant
      });

      if (error) throw error;
      fetchData();
      setEmail('');
    } catch(e: any) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Acceso & Roles</h2>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCcw size={14} /> Sincronizar Permisos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <Card className="glass-card h-fit border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-600/10 to-transparent p-8">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="text-blue-500" /> Nuevo Acceso
            </CardTitle>
            <CardDescription className="text-slate-400">Invita a un administrador de negocio o colega de la factoría.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500">Email del Usuario</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <Input 
                   placeholder="ejemplo@negocio.com"
                   className="pl-10 bg-slate-950/50 border-slate-800"
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-slate-500">Rol Global</label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger className="bg-slate-950/50 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_admin">Delegado (Tenant Admin)</SelectItem>
                  <SelectItem value="admin">Supervisor (Global Admin)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'tenant_admin' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs uppercase tracking-widest font-bold text-slate-500">Asociar a Negocio</label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger className="bg-slate-950/50 border-slate-800">
                    <SelectValue placeholder="Seleccionar Negocio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asocición (Freelance)</SelectItem>
                    {tenants.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.domain_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleCreateUser} className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 h-12">
               Generar Credenciales & Acceso
            </Button>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card className="lg:col-span-2 glass-card border-0 shadow-xl overflow-hidden">
           <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/30">
                  <TableRow className="border-slate-800/50">
                    <TableHead className="p-6">Identidad</TableHead>
                    <TableHead>Nivel de Acceso</TableHead>
                    <TableHead>Dominio Asignado</TableHead>
                    <TableHead className="text-right p-6">Gestión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 animate-pulse">Consultando el registro de la factoría...</TableCell></TableRow>
                  ) : users.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-500 italic">No hay usuarios asignados. Eres el único operario activo.</TableCell></TableRow>
                  ) : (
                    users.map((row) => (
                      <TableRow key={row.id} className="border-slate-800/30 hover:bg-slate-800/10">
                        <TableCell className="p-6">
                           <div className="font-semibold text-slate-200">UID: {row.user_id.slice(0,8)}...</div>
                           <div className="text-[10px] text-slate-500 font-mono italic">Created at: {new Date(row.created_at).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                           {row.role === 'admin' ? (
                             <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1 uppercase text-[10px]">
                               <Shield size={10} /> Global Admin
                             </Badge>
                           ) : (
                             <Badge variant="outline" className="text-blue-400 gap-1 uppercase text-[10px]">
                               Delegado
                             </Badge>
                           )}
                        </TableCell>
                        <TableCell>
                           {row.tenant_id ? (
                             <div className="flex items-center gap-2 text-xs text-slate-400">
                               <Building2 size={12} className="text-blue-500" />
                               {row.tenants?.domain_name}
                             </div>
                           ) : (
                             <span className="text-[10px] text-slate-600 font-bold uppercase italic">Acceso Global</span>
                           )}
                        </TableCell>
                        <TableCell className="text-right p-6">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10">
                             <Trash2 size={14} />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
