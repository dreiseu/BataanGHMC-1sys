import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Sends a beacon to the server to end the session when the tab/browser is closed.
 * Inertia's SPA navigations don't trigger pagehide, so we only fire this on actual
 * tab/browser close or hard refresh.
 */
export function useTabSessionEnd() {
    const isSpaNavigating = useRef(false);

    useEffect(() => {
        // Track Inertia SPA navigations so we don't log out on those
        const removeStart = router.on('start', () => {
            isSpaNavigating.current = true;
        });
        const removeFinish = router.on('finish', () => {
            // Add a small delay to prevent race conditions with page redirects/reloads
            // which might trigger pagehide after finish
            setTimeout(() => {
                isSpaNavigating.current = false;
            }, 100);
        });

        const handlePageHide = () => {
            if (isSpaNavigating.current) return;

            // sendBeacon works reliably even during page unload
            // DISABLED: This triggers on page refresh (F5), causing users to be logged out unintentionally.
            // navigator.sendBeacon('/session-end');
        };

        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
            removeStart();
            removeFinish();
        };
    }, []);
}
