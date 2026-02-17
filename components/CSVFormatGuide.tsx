'use client';

import React, { useState } from 'react';
import { Info, Download, X } from 'lucide-react';

export default function CSVFormatGuide() {
    const [isOpen, setIsOpen] = useState(false);

    const sampleCSV = `type,name,symbol,quantity,purchasePrice,currentPrice,sector
stock,Apple Inc.,AAPL,50,150,185.92,Technology
crypto,Bitcoin,BTC,0.85,30000,64000,Digital Gold
real_estate,Miami Apartment,,1,85000,95000,Residential
private_equity,SpaceX common,,100,50,186,Aerospace
esop,Company Options,TECHX,5000,2.5,18.5,Technology`;

    const downloadSample = () => {
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio_sample.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Info Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                title="View CSV format guide"
            >
                <Info size={16} />
                CSV Format
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a2e] border border-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-[#1a1a2e] border-b border-gray-800 p-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">CSV Import Format</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Required Format */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">Required Columns</h3>
                                <div className="bg-[#0f0f1e] border border-gray-800 rounded-lg p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-400 border-b border-gray-800">
                                                <th className="pb-2 pr-4">Column</th>
                                                <th className="pb-2 pr-4">Description</th>
                                                <th className="pb-2">Example</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-300">
                                            <tr className="border-b border-gray-800/50">
                                                <td className="py-2 pr-4 font-mono text-blue-400">type</td>
                                                <td className="py-2 pr-4">Asset type</td>
                                                <td className="py-2 font-mono text-xs">stock, crypto, esop</td>
                                            </tr>
                                            <tr className="border-b border-gray-800/50">
                                                <td className="py-2 pr-4 font-mono text-blue-400">name</td>
                                                <td className="py-2 pr-4">Asset name</td>
                                                <td className="py-2 font-mono text-xs">Apple Inc.</td>
                                            </tr>
                                            <tr className="border-b border-gray-800/50">
                                                <td className="py-2 pr-4 font-mono text-blue-400">symbol</td>
                                                <td className="py-2 pr-4">Ticker (optional for RE/PE)</td>
                                                <td className="py-2 font-mono text-xs">AAPL</td>
                                            </tr>
                                            <tr className="border-b border-gray-800/50">
                                                <td className="py-2 pr-4 font-mono text-blue-400">quantity</td>
                                                <td className="py-2 pr-4">Number of units</td>
                                                <td className="py-2 font-mono text-xs">50</td>
                                            </tr>
                                            <tr className="border-b border-gray-800/50">
                                                <td className="py-2 pr-4 font-mono text-blue-400">purchasePrice</td>
                                                <td className="py-2 pr-4">Price when bought</td>
                                                <td className="py-2 font-mono text-xs">150.00</td>
                                            </tr>
                                            <tr className="border-b border-gray-800/50">
                                                <td className="py-2 pr-4 font-mono text-blue-400">currentPrice</td>
                                                <td className="py-2 pr-4">Current price</td>
                                                <td className="py-2 font-mono text-xs">185.92</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 pr-4 font-mono text-blue-400">sector</td>
                                                <td className="py-2 pr-4">Industry/category</td>
                                                <td className="py-2 font-mono text-xs">Technology</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Valid Asset Types */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">Valid Asset Types</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['stock', 'crypto', 'private_equity', 'real_estate', 'esop'].map(type => (
                                        <div key={type} className="bg-[#0f0f1e] border border-gray-800 rounded px-3 py-2">
                                            <code className="text-sm text-blue-400">{type}</code>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sample CSV */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">Sample CSV</h3>
                                <div className="bg-[#0f0f1e] border border-gray-800 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-xs text-gray-300 font-mono whitespace-pre">
                                        {sampleCSV}
                                    </pre>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                                    <Info size={16} />
                                    Important Notes
                                </h4>
                                <ul className="text-sm text-amber-200/80 space-y-1 ml-6 list-disc">
                                    <li>First row must be the exact headers shown above</li>
                                    <li>Column names are case-sensitive</li>
                                    <li>No currency symbols ($, €) in price fields</li>
                                    <li>Decimals are allowed (e.g., 0.85, 185.92)</li>
                                    <li>Symbol can be empty for real estate and private equity</li>
                                </ul>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={downloadSample}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download size={18} />
                                Download Sample CSV
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
