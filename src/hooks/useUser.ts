'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export function useUser() {
    const { user, isLoading } = useAuth();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading) return;

        if (user) {
            setUserId(user.id);
        } else {
            // Fallback for guest users
            let id = localStorage.getItem('booking_user_id');
            if (!id) {
                id = 'user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('booking_user_id', id);
            }
            setUserId(id);
        }
    }, [user, isLoading]);

    return userId;
}
