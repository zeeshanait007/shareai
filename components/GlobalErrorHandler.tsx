'use client';

import { useEffect } from 'react';

/**
 * Global Error Handler Component
 * Catches ChunkLoadErrors (which often happen after new deployments)
 * and reloads the page to fetch the latest assets.
 */
export default function GlobalErrorHandler() {
    useEffect(() => {
        const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
            const message = 'message' in event ? event.message : (event as any).reason?.message;

            // Check for ChunkLoadError patterns
            if (
                message &&
                (message.includes('Loading chunk') ||
                    message.includes('ChunkLoadError') ||
                    message.includes('Loading CSS chunk'))
            ) {
                console.warn('ChunkLoadError detected. Reloading page to fetch latest version...', message);
                window.location.reload();
            }
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleError);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleError);
        };
    }, []);

    return null;
}
