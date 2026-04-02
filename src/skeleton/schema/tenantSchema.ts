export interface ComponentConfig {
  type: string;
  props?: Record<string, any>;
}

export interface PageConfig {
  slug?: string; // undefined means index '/'
  components: ComponentConfig[];
}

export interface TenantSchema {
  brand: {
    name: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  seo: {
    title: string;
    description: string;
  };
  navbar: Array<{ label: string; url: string }>;
  pages: PageConfig[];
}
