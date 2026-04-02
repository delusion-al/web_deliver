import { Link } from 'react-router-dom';
import { useStore } from './store';
import { Menu, X, User, ShoppingBag, Bot } from 'lucide-react';
import { useState } from 'react';
import { MyOrdersModal } from './MyOrdersModal';
import './Navbar.css';

export function Navbar() {
  const { user, signOut } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  return (
    <>
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Bot size={24} className="text-blue-500 mr-2" />
          <span className="font-bold tracking-tight italic">NEURAL FORGE</span>
        </Link>
        
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsOpen(false)}>INICIO</Link>
          <Link to="/events" onClick={() => setIsOpen(false)}>CAMPUS</Link>
          <Link to="/market" onClick={() => setIsOpen(false)}>TIENDA</Link>
          <Link to="/clasificaciones" onClick={() => setIsOpen(false)}>CLASIFICACIONES</Link>
          {user && (user.role === 'admin' || user.role === 'tenant_admin') && (
            <Link to="/admin" onClick={() => setIsOpen(false)}>ESTADÍSTICAS</Link>
          )}
          
          {user ? (
            <div className="auth-box">
              {user.role !== 'user' && (
                <span className={`user-badge role-${user.role}`}>
                  {user.role === 'admin' ? 'Admin' : 'Entrenador'}
                </span>
              )}
              <button onClick={() => setOrdersOpen(true)} className="btn-cart" title="Mis Pedidos">
                <ShoppingBag size={18} />
              </button>
              <button onClick={() => { signOut(); setIsOpen(false); }} className="btn-logout">Salir</button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="btn-login">
              <User size={18} /> Entrar
            </Link>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
    {ordersOpen && <MyOrdersModal onClose={() => setOrdersOpen(false)} />}
    </>
  );
}
