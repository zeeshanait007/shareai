'use client';

import React from 'react';
import { Download } from 'lucide-react';

export default function CSVFormatGuide() {
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
        <button
            onClick={downloadSample}
            className="button-secondary flex items-center gap-2"
            title="Download CSV sample"
        >
            <Download size={16} />
            <span className="hidden sm:inline">Download CSV</span>
        </button>
    );
}
