import React from 'react';
import { usePermissions } from '../PermissionContext';

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate
 * 
 * A component that conditionally renders its children based on the user's permissions.
 * 
 * Usage:
 * <PermissionGate permission="billing.read" fallback={<AccessDenied />}>
 *   <BillingComponent />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  permission, 
  fallback = null 
}) => {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * withPermission
 * 
 * Higher-Order Component to protect components with permissions.
 */
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string,
  FallbackComponent: React.ComponentType = () => null
) => {
  return (props: P) => (
    <PermissionGate permission={permission} fallback={<FallbackComponent />}>
      <WrappedComponent {...props} />
    </PermissionGate>
  );
};
