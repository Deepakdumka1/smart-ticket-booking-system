'use client';

import { useEffect, useState } from 'react';

export function useUser() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        let id = localStorage.getItem('booking_user_id');
        if (!id) {
            id = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('booking_user_id', id);
        }
        setUserId(id);
    }, []);

    return userId;
}
