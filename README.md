# Neural Forge: The AI Web Factory Orchestrator

**Neural Forge** is a state-of-the-art agentic orchestrator designed for autonomous business prospecting, site generation (forging), and multi-tenant management. Built on **Astro + React + Supabase**, it enables a single engine to serve, deploy, and maintain thousands of unique, AI-generated business websites.

## 🏗️ Architecture: The Three-Phase Pipeline

### Phase A: Lead Oracle (Prospecting)
- **Engine**: Supabase Edge Function `lead-crawler`.
- **Function**: Scrapes business data from OpenStreetMap and social signals to identify "Hot Prospects"—businesses lacking a digital footprint or requiring updates.

### Phase B: Web Forge (Generation)
- **Engine**: `SupabaseAdapter.createTenantFromLead`.
- **Function**: Automatically provisions a new Tenant and generates a unique `tenant_configs` JSON defining branding, SEO, and pages.
- **Previewer**: On-the-fly rendering of customized sites based on the tenant's configuration.

### Phase C: AI Maintenance (Refinement)
- **Engine**: Supabase Edge Function `maintenance-proxy`.
- **Function**: An autonomous agent that takes natural language requests from business owners and applies site-wide changes (style, content, layouts) in real-time.

---

## 🛠️ Components

- **God View (/admin)**: Central command for the Factory Owner to monitor leads, forge sites, and track global activity.
- **Client Hub (/client/:id)**: A dedicated management portal for business owners to talk to the AI Maintenance terminal.
- **Neural Portal (/)**: The premium, high-fidelity entry point for factory operations.

## 🚀 Getting Started

1.  **Clone & Install**: `npm install`
2.  **Environment Setup**:
    - `VITE_SUPABASE_URL`: Your Supabase API endpoint.
    - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Your Supabase anon key.
3.  **Run Dev**: `npm run dev`
4.  **Admin Login**: Access `/login` and use your administrator credentials. The system automatically grants God-Mode roles for verified developer emails.

---

## 💎 Design System
- **Backgrounds**: Slate-950 with deep radial gradients.
- **Accents**: Neon Blue-600, Glassmorphism cards with border glow.
- **Typography**: Inter (Modern sans-serif) and italicized heavy weights for a state-of-the-art digital feel.

&copy; 2026 Neural Forge Orchestrator. Developed autonomously by Antigravity.
