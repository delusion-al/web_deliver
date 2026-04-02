import { ReactNode } from 'react';
import { useStore } from './store';

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  roles?: ('admin' | 'tenant_admin' | 'coach' | 'user')[];
  tenantId?: string;
}

export function AdminGuard({ children, fallback = null, roles = ['admin'], tenantId }: AdminGuardProps) {
  const { user } = useStore();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // If role is tenant_admin, we must ALSO check the tenantId match
  if (user.role === 'tenant_admin' && tenantId && user.tenantId !== tenantId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
