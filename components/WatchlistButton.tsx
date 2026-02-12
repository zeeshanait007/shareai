'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/watchlist';

interface WatchlistButtonProps {
    symbol: string;
    name: string;
}

export default function WatchlistButton({ symbol, name }: WatchlistButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsSaved(isInWatchlist(symbol));
        setIsLoading(false);
    }, [symbol]);

    const handleToggle = () => {
        if (isSaved) {
            removeFromWatchlist(symbol);
            setIsSaved(false);
        } else {
            addToWatchlist({ symbol, name });
            setIsSaved(true);
        }
    };

    if (isLoading) {
        return (
            <button disabled className="btn btn-secondary" style={{ opacity: 0.5, gap: '0.5rem' }}>
                <Loader2 size={16} className="animate-spin" />
                Loading
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
            style={{ gap: '0.5rem', transition: 'all 0.2s ease' }}
        >
            {isSaved ? (
                <>
                    <Check size={16} />
                    Following
                </>
            ) : (
                <>
                    <Plus size={16} />
                    Add to Watchlist
                </>
            )}
        </button>
    );
}
