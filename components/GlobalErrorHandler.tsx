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
            const message = 'message' in event ? (event as any).message : (event as any).reason?.message;
            const target = (event as any).target;

            // Check if it's a script/link load failure
            const isResourceError = target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK');

            // Check for various ChunkLoadError patterns across browsers
            const isChunkError =
                message &&
                !message.includes('generativelanguage') && // Don't reload for Gemini API errors
                !message.includes('/api/') && // Don't reload for our API errors
                (
                    message.includes('Loading chunk') ||
                    message.includes('ChunkLoadError') ||
                    message.includes('Loading CSS chunk') ||
                    message.includes('Failed to fetch dynamically imported module') ||
                    message.includes('Unexpected token') // Often happens when a 404 HTML page is served as JS
                );

            if (isChunkError || isResourceError) {
                console.warn('Deployment mismatch or Server Error detected. Reloading page...', message || 'Resource load failure');

                // Avoid infinite reload loops
                const lastReload = sessionStorage.getItem('last_chunk_reload');
                const now = Date.now();
                if (!lastReload || now - parseInt(lastReload) > 5000) {
                    sessionStorage.setItem('last_chunk_reload', now.toString());
                    window.location.reload();
                }
            }
        };

        window.addEventListener('error', handleError, true);
        window.addEventListener('unhandledrejection', handleError);

        return () => {
            window.removeEventListener('error', handleError, true);
            window.removeEventListener('unhandledrejection', handleError);
        };
    }, []);

    return null;
}
