'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    content: React.ReactNode;
    children?: React.ReactNode;
    width?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

import { createPortal } from 'react-dom';

export default function InfoTooltip({ content, children, width, position = 'top' }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // We use fixed positioning based on the viewport.
            // The top coordinate is the anchor point.
            setCoords({
                top: rect.top + (position === 'bottom' ? rect.height : 0),
                left: rect.left
            });
        }
    };

    useEffect(() => {
        if (isVisible) {
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            updatePosition();
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible]);

    const tooltipContent = isVisible && (
        <div
            ref={tooltipRef}
            className={`info-tooltip-popup position-${position}`}
            style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: width || '180px',
                zIndex: 20000,
                pointerEvents: 'none',
                // We use the position classes in CSS for the specific translate
                // but ensure initial opacity and simple transition
                opacity: coords.top === 0 ? 0 : 1,
                transition: 'opacity 0.2s ease-out'
            }}
        >
            <div className="info-tooltip-content">
                {content}
            </div>
            <div className="info-tooltip-arrow" />
        </div>
    );

    return (
        <span
            ref={triggerRef}
            className="info-tooltip-trigger"
            onMouseEnter={() => {
                updatePosition();
                setIsVisible(true);
            }}
            onMouseLeave={() => setIsVisible(false)}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                verticalAlign: 'middle',
                cursor: 'pointer'
            }}
        >
            {children || <Info size={14} style={{ opacity: 0.7 }} />}

            {isVisible && typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
        </span>
    );
}
