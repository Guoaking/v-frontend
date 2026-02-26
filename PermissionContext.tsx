
import React, { createContext, useContext, useCallback } from 'react';
import { User } from './types';

interface PermissionContextType {
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
  // Expose raw permissions for debugging or complex logic
  permissions: string[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  user: User | null;
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ user, children }) => {
  // Extract permissions from the user object.
  // In a real scenario, this comes from the backend's resolved permissions for the current org context.
  const permissions = user?.permissions || [];

  const can = useCallback((permission: string): boolean => {
    if (!user) return false;
    
    // Platform Admin Override (God Mode for internal tools)
    if (user.isPlatformAdmin) return true;

    // Direct match
    if (permissions.includes(permission)) return true;

    // Wildcard match (e.g., "billing.*" allows "billing.read")
    // This supports hierarchical permissions like AWS IAM
    return permissions.some(p => {
      if (p.endsWith('*')) {
        const prefix = p.slice(0, -1); // remove *
        return permission.startsWith(prefix);
      }
      return false;
    });
  }, [permissions, user]);

  const canAny = useCallback((perms: string[]): boolean => {
    return perms.some(p => can(p));
  }, [can]);

  const canAll = useCallback((perms: string[]): boolean => {
    return perms.every(p => can(p));
  }, [can]);

  return (
    <PermissionContext.Provider value={{ can, canAny, canAll, permissions }}>
      {children}
    </PermissionContext.Provider>
  );
};
