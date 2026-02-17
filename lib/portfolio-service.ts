import { supabase } from '@/lib/supabase';
import { Asset } from '@/lib/assets';
import { PortfolioSnapshot } from '@/lib/types';

export async function savePortfolioSnapshot(
    userId: string,
    assets: Asset[],
    metadata: { source: 'csv_upload' | 'manual_edit', filename?: string } = { source: 'csv_upload' }
): Promise<PortfolioSnapshot | null> {
    if (!userId || assets.length === 0) return null;

    const snapshotMetadata = {
        ...metadata,
        item_count: assets.length,
        total_value: assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0)
    };

    const { data, error } = await supabase
        .from('portfolio_snapshots')
        .insert({
            user_id: userId,
            assets: assets,
            metadata: snapshotMetadata
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving portfolio snapshot:', error);
        return null;
    }

    return data;
}

export async function getPortfolioHistory(userId: string): Promise<PortfolioSnapshot[]> {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching portfolio history:', error);
        return [];
    }

    return data || [];
}
