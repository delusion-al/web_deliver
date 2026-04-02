import React from 'react';
import type { ComponentConfig } from '../schema/tenantSchema';

// We import the React components we want the engine to be able to use.
// In a real app, these would be your actual React components.
// For demonstration, we create inline mocks mapped to the old architecture.

const Hero = ({ title, subtitle, buttonPrimary, buttonSecondary }: any) => (
  <section className="hero-section" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--primary-color)', color: 'white' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
    <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{subtitle}</p>
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      {buttonPrimary && <a href={buttonPrimary.url} style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--primary-color)', textDecoration: 'none', borderRadius: '4px' }}>{buttonPrimary.text}</a>}
      {buttonSecondary && <a href={buttonSecondary.url} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid white', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>{buttonSecondary.text}</a>}
    </div>
  </section>
);

const Marketplace = ({ title, categories }: any) => (
  <section style={{ padding: '4rem 2rem' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{title}</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
      {categories?.map((cat: string, idx: number) => (
        <div key={idx} style={{ padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
          <h3>{cat}</h3>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px' }}>Ver opciones</button>
        </div>
      ))}
    </div>
  </section>
);

const ContactForm = ({ title }: any) => (
  <section style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{title}</h2>
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input type="text" placeholder="Nombre" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
      <input type="email" placeholder="Email" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
      <textarea placeholder="Mensaje" rows={4} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
      <button type="button" style={{ padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Enviar Mensaje</button>
    </form>
  </section>
);

// The registry mapping string types to actual React components
const ComponentRegistry: Record<string, React.FC<any>> = {
  Hero,
  Marketplace,
  ContactForm,
};

interface IslandResolverProps {
  components: ComponentConfig[];
}

export const IslandResolver: React.FC<IslandResolverProps> = ({ components }) => {
  return (
    <div className="island-container">
      {components.map((block, index) => {
        const ResolvedComponent = ComponentRegistry[block.type];
        if (!ResolvedComponent) {
          console.warn(`Component [${block.type}] not found in registry.`);
          return null;
        }
        // Render the component dynamically spreading its properties mapping.
        // We use index as a temporary key, though unique IDs are better in production.
        return <ResolvedComponent key={index} {...block.props} />;
      })}
    </div>
  );
};
