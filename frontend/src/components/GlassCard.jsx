import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className, premium = false, hover = true, ...props }) => {
    const baseClasses = premium ? 'glass-premium' : 'glass-card';
    const hoverClasses = hover ? 'hover-lift' : '';

    return (
        <div
            className={twMerge(
                baseClasses,
                hoverClasses,
                'p-6 animate-scale-in',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
