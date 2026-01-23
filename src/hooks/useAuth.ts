'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuth() {
    const { user, loading } = useContext(AuthContext);

    return {
        user: user ? {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
        } : null,
        isAuthenticated: !!user,
        isLoading: loading
    };
}
