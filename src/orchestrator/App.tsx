import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../templates/store';

// New Dashboard & Portal
import { DashboardApp } from '../dashboard/DashboardApp';
import { ClientDashboardApp } from '../dashboard/ClientDashboardApp';
import { Preview } from '../dashboard/Preview';
import { FactoryPortal } from './FactoryPortal';
import { FactoryLogin } from './FactoryLogin';

/**
 * Gateway logic: Decides where to land based on role
 */
function Gateway() {
  const { user, loading } = useStore();

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-blue-500 animate-pulse font-mono tracking-widest text-sm uppercase">Cargando Factoría...</div>
    </div>
  );

  // If God Admin, go to Factory Controller
  const isAdmin = user?.role === 'admin' || (user?.email && user.email.toLowerCase() === 'migueldev97@gmail.com');
  if (isAdmin) return <Navigate to="/admin" replace />;

  // If not logged in, show the Factory Portal
  return <FactoryPortal />;
}

import { Toaster } from 'sonner';

function App() {
  const { initAuth, user, loading } = useStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors expand={false} />
      <Router>
        <Routes>
          {/* Core AI Factory Gates */}
          <Route path="/" element={<Gateway />} />

          {/* Premium Admin Routing */}
          <Route path="/admin/*" element={
            loading ? (
              <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-blue-500 animate-pulse font-mono tracking-widest text-sm uppercase">Verificando Credenciales...</div>
              </div>
            ) : (() => {
              // FORCED FAILSAFE: Verify by email if role check fails
              const isAdmin = user?.role === 'admin' || (user?.email && user.email.toLowerCase() === 'migueldev97@gmail.com');
              return isAdmin ? <DashboardApp /> : <Navigate to="/login" replace />;
            })()
          } />

          {/* Global Factory Login */}
          <Route path="/login" element={<FactoryLogin />} />

          {/* Client-Specific Hubs (Tenant Management) */}
          <Route path="/client/:tenantId/*" element={
            loading ? (
              <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-blue-500 animate-pulse font-mono tracking-widest text-sm uppercase">Sincronizando Acceso...</div>
              </div>
            ) : user ? <ClientDashboardApp /> : <Navigate to="/login" replace />
          } />

          {/* Dynamic Previews (The "Forged" Site Engine) */}
          <Route path="/preview/:tenantId" element={<Preview />} />

          {/* Catch-all to Gateway */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}


export default App;
