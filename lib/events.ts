type PortfolioEventType = 'SNAPSHOT_SAVED' | 'LOAD_SNAPSHOT';

interface LoadSnapshotDetail {
    assets: any[];
    filename: string;
}

export const PortfolioEvents = {
    // Notify that a new snapshot was saved (Sidebar should refresh)
    emitSnapshotSaved: () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('SNAPSHOT_SAVED'));
        }
    },

    // Notify that a snapshot was selected (Dashboard should load these assets)
    emitLoadSnapshot: (assets: any[], filename: string) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('LOAD_SNAPSHOT', {
                detail: { assets, filename }
            }));
        }
    },

    // Listeners
    onSnapshotSaved: (callback: () => void) => {
        if (typeof window === 'undefined') return () => { };
        const handler = () => callback();
        window.addEventListener('SNAPSHOT_SAVED', handler);
        return () => window.removeEventListener('SNAPSHOT_SAVED', handler);
    },

    onLoadSnapshot: (callback: (detail: LoadSnapshotDetail) => void) => {
        if (typeof window === 'undefined') return () => { };
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as LoadSnapshotDetail;
            callback(detail);
        };
        window.addEventListener('LOAD_SNAPSHOT', handler);
        return () => window.removeEventListener('LOAD_SNAPSHOT', handler);
    }
};
