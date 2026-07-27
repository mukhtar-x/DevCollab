import { useMemo } from 'react';

export const usePermissions = (userPermissions: string[] = []) => {
  // Use Set for instantaneous lookups
  const permSet = useMemo(() => new Set(userPermissions), [userPermissions]);

  const hasPermit = (permission: string): boolean => {
    return permSet.has(permission);
  };

  return { hasPermit };
};