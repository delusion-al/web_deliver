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
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  
  // If not logged in, show the Factory Portal
  return <FactoryPortal />;
}

function App() {
  const { initAuth, user } = useStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Routes>
        {/* Core AI Factory Gates */}
        <Route path="/" element={<Gateway />} />
        
        {/* Premium Admin Routing */}
        <Route path="/admin/*" element={
          user?.role === 'admin' ? <DashboardApp /> : <Navigate to="/login" />
        } />

        {/* Global Factory Login */}
        <Route path="/login" element={<FactoryLogin />} />

        {/* Client-Specific Hubs (Tenant Management) */}
        <Route path="/client/:tenantId/*" element={
          user ? <ClientDashboardApp /> : <Navigate to="/login" />
        } />

        {/* Dynamic Previews (The "Forged" Site Engine) */}
        <Route path="/preview/:tenantId" element={<Preview />} />

        {/* Catch-all to Gateway */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
