import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge(
                "bg-white/60 dark:bg-[#1a1a1a]/80 backdrop-blur-lg border border-white/40 dark:border-[#2a2a2a] shadow-xl rounded-2xl p-6 transition-colors duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
