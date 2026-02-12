'use client';

export interface WatchlistItem {
    symbol: string;
    name: string;
    price?: number;
    change?: number;
    changePercent?: number;
}

const STORAGE_KEY = 'shareai_watchlist';

export const getWatchlist = (): WatchlistItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const addToWatchlist = (item: WatchlistItem) => {
    if (typeof window === 'undefined') return;
    const current = getWatchlist();
    if (!current.find(i => i.symbol === item.symbol)) {
        const updated = [...current, item];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
    }
};

export const removeFromWatchlist = (symbol: string) => {
    if (typeof window === 'undefined') return;
    const current = getWatchlist();
    const updated = current.filter(i => i.symbol !== symbol);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
};

export const isInWatchlist = (symbol: string): boolean => {
    if (typeof window === 'undefined') return false;
    const current = getWatchlist();
    return !!current.find(i => i.symbol === symbol);
};
