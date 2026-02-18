import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InstitutionalAnalysis, DeepInsight } from './types';

export const generateAuditPDF = (
    symbol: string,
    insight: any // Support both object and string
) => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(`Institutional Audit Report: ${symbol}`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${timestamp}`, 14, 30);
    doc.text(`Source: ARRAlign AI Institutional Engine`, 14, 35);

    // Recommendation Summary
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('📌 Recommendation Summary', 14, 50);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const summaryText = typeof insight === 'object'
        ? (insight.convictionExplanation || 'Strategic rebalancing based on current market volatility and asset concentration.')
        : String(insight);
    const splitExplanation = doc.splitTextToSize(summaryText, 180);
    doc.text(splitExplanation, 14, 60);

    // If it's just a string, we skip the complex tables and just save
    if (typeof insight !== 'object') {
        doc.save(`${symbol}_Basic_Audit_${Date.now()}.pdf`);
        return;
    }

    // Evidence Breakdown
    let currentY = 60 + (splitExplanation.length * 7) + 10;
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('📊 Evidence Breakdown', 14, currentY);

    currentY += 10;
    const quantDrivers = Array.isArray(insight.evidence?.quantitativeDrivers) ? insight.evidence.quantitativeDrivers.join(', ') : 'N/A';

    autoTable(doc, {
        startY: currentY,
        head: [['Factor', 'Analysis']],
        body: [
            ['Quantitative Drivers', quantDrivers],
            ['Historical Probability', insight.evidence?.historicalProbability || 'N/A'],
            ['Correlation Impacts', insight.evidence?.correlationImpacts || 'N/A'],
            ...Object.entries(insight.evidence?.factorExposure || {}).map(([k, v]) => [`Factor: ${k}`, v])
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });

    // Risk Sensitivity
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(239, 68, 68);
    doc.text('⚠ Risk Sensitivity', 14, currentY);

    currentY += 10;
    autoTable(doc, {
        startY: currentY,
        head: [['Scenario', 'Impact / Projection']],
        body: [
            ['Rate Hike Impact', insight.riskSensitivity?.rateHikeImpact || 'N/A'],
            ['Recession Impact', insight.riskSensitivity?.recessionImpact || 'N/A'],
            ['Worst-Case Band', insight.riskSensitivity?.worstCaseBand || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] }
    });

    // Counter-Case
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text('🔁 Counter-Case', 14, currentY);

    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const splitCounter = doc.splitTextToSize(insight.counterCase?.thesisInvalidation || 'Thesis remains valid under current market conditions.', 180);
    doc.text(splitCounter, 14, currentY);

    // Compliance
    currentY += (splitCounter.length * 7) + 15;
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text('🧾 Compliance Snapshot', 14, currentY);

    currentY += 10;

    const regFlags = Array.isArray(insight.compliance?.regulatoryFlags) ? insight.compliance.regulatoryFlags.join(', ') : 'None';

    autoTable(doc, {
        startY: currentY,
        head: [['Parameter', 'Status']],
        body: [
            ['Risk Match', insight.compliance?.riskMatch || 'N/A'],
            ['Suitability', insight.compliance?.suitabilityStatus || 'N/A'],
            ['Regulatory Flags', regFlags]
        ],
        theme: 'plain',
        headStyles: { fillColor: [16, 185, 129] }
    });

    // Save PDF
    doc.save(`${symbol}_Institutional_Audit_${Date.now()}.pdf`);
};
