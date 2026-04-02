import React, { useState } from 'react';

export const AdminTicketSystem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Proxy to the Supabase Edge Function to securely create a GitHub Issue
      const response = await fetch('https://[YOUR_SUPABASE_PROJECT].supabase.co/functions/v1/create-github-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Wait to inject user token or anonymous token based on Supabase config
        },
        body: JSON.stringify({
          title: `[Client Request] ${title}`,
          description: description,
        })
      });

      if (!response.ok) throw new Error('Failed to create ticket');
      
      setStatus('success');
      setTitle('');
      setDescription('');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '500px', margin: '2rem auto' }}>
      <h3>Solicitar Cambios en la Web (Ticket)</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '1.5rem' }}>
        ¿Necesitas añadir un servicio, cambiar un color o arreglar un problema? Describe lo que necesitas y nuestro agente IA te preparará una solución.
      </p>

      {status === 'success' && (
        <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', marginBottom: '1rem' }}>
          ✅ ¡Ticket creado con éxito! Nuestro agente ya está revisándolo y pronto verá una actualización propuesta.
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem' }}>
          ❌ Error al enviar el ticket. Por favor, inténtelo de nuevo.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Ej: Añadir sección de ofertas" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <textarea 
          placeholder="Describe el módulo que quieres o los colores que te gustaría cambiar..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          rows={5} 
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <button 
          type="submit" 
          disabled={status === 'loading'} 
          style={{ 
            padding: '1rem', 
            background: 'var(--primary-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: status === 'loading' ? 'not-allowed' : 'pointer' 
          }}
        >
          {status === 'loading' ? 'Enviando...' : 'Crear Ticket'}
        </button>
      </form>
    </div>
  );
};
