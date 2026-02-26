
import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
    className = '', 
    variant = 'text', 
    width, 
    height 
}) => {
    const baseStyles = "bg-slate-200 dark:bg-slate-700 animate-pulse";
    
    const variants = {
        text: "rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-lg"
    };

    const style = {
        width: width,
        height: height || (variant === 'text' ? '1rem' : undefined)
    };

    return (
        <div 
            className={`${baseStyles} ${variants[variant]} ${className}`} 
            style={style}
        />
    );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="w-full" height="1.25rem" />
            </td>
        ))}
    </tr>
);