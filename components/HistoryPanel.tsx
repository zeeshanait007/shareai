import React, { useEffect, useState } from 'react';
import { getPortfolioHistory } from '@/lib/portfolio-service';
import { PortfolioSnapshot } from '@/lib/types';
import { Asset } from '@/lib/assets';
import { Clock, Download, ArrowRight, Loader2 } from 'lucide-react';

interface HistoryPanelProps {
    userId: string;
    onRestore: (assets: Asset[]) => void;
    onClose: () => void;
}

export default function HistoryPanel({ userId, onRestore, onClose }: HistoryPanelProps) {
    const [history, setHistory] = useState<PortfolioSnapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [userId]);

    const loadHistory = async () => {
        setLoading(true);
        const data = await getPortfolioHistory(userId);
        setHistory(data);
        setLoading(false);
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatCurrency = (value?: number) => {
        if (value === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end transition-opacity">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Data History
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <p>No history found.</p>
                            <p className="text-sm mt-2">Upload a CSV file to create a snapshot.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((snapshot) => (
                                <div
                                    key={snapshot.id}
                                    className="bg-white border rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                {snapshot.metadata.source === 'csv_upload' ? 'Upload' : 'Edit'}
                                            </span>
                                            <span>{formatDate(snapshot.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {snapshot.metadata.item_count} Assets
                                        </div>
                                        {snapshot.metadata.total_value && (
                                            <div className="text-sm text-gray-600">
                                                Total Value: {formatCurrency(snapshot.metadata.total_value)}
                                            </div>
                                        )}
                                        {snapshot.metadata.filename && (
                                            <div className="text-xs text-gray-400 mt-1 truncate">
                                                File: {snapshot.metadata.filename}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            onRestore(snapshot.assets);
                                            onClose();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors text-sm font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Restore this Version
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
