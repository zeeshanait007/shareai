'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSessionTimeRemaining, logout } from '@/lib/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        setIsChecking(false);
        setTimeRemaining(getSessionTimeRemaining());

        // Check session every second
        const interval = setInterval(() => {
            if (!isAuthenticated()) {
                clearInterval(interval);
                router.push('/login');
                return;
            }

            setTimeRemaining(getSessionTimeRemaining());
        }, 1000);

        return () => clearInterval(interval);
    }, [router]);

    // Show loading while checking auth
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // Show session warning when less than 2 minutes remaining
    const showWarning = timeRemaining > 0 && timeRemaining <= 120;

    return (
        <>
            {showWarning && (
                <div className="fixed top-4 right-4 z-50 bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 shadow-lg backdrop-blur-sm">
                    <p className="text-amber-400 text-sm font-medium">
                        ⚠️ Session expires in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </p>
                </div>
            )}
            {children}
        </>
    );
}
