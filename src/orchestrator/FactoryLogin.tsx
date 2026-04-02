import { useState } from 'react';
import { useStore } from '../templates/store';
import { useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FactoryLogin() {
  const { signIn, signInWithGoogle } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      // initAuth might need to be called if signIn doesn't trigger a store refresh
      // but usually the store update is enough.
      window.location.href = import.meta.env.BASE_URL + 'admin';
    } catch (err: any) {
      setError('Credenciales incorrectas. Verifica tus datos de acceso.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      
      {/* Decorative center light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 mb-6">
              <Bot size={32} className="text-blue-500" />
              <span className="text-2xl font-black tracking-tight text-white italic uppercase">Neural Forge</span>
           </div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Acceso Administrador</h2>
           <p className="text-slate-500 mt-2">Gestiona tu red de sitios de la AI Factory</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input 
                  type="email" 
                  placeholder="tu-email@ejemplo.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-14 bg-slate-950/50 border-slate-800 focus:ring-blue-500/20 focus:border-blue-500/50 pl-12 rounded-2xl transition-all text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <Input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-14 bg-slate-950/50 border-slate-800 focus:ring-blue-500/20 focus:border-blue-500/50 pl-12 rounded-2xl transition-all text-slate-200"
                  required
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center">{error}</div>}

            <Button disabled={loading} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] mt-2">
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <span className="flex items-center justify-center gap-2">
                  Entrar al Panel <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-600 px-2 bg-transparent overflow-hidden">
               <span>O continúa con</span>
            </div>
          </div>

          <Button variant="outline" onClick={handleGoogle} disabled={loading} className="w-full h-14 border-slate-800 hover:bg-slate-800 bg-transparent text-slate-300 rounded-2xl font-bold">
            <Sparkles size={18} className="mr-2 text-blue-500" /> Iniciar con Google
          </Button>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          AI Factory Orchestrator &copy; 2026 
        </p>
      </div>
    </div>
  );
}
