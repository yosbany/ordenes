import React from 'react';
import { mergeClasses } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, isSelected, onClick }: CardProps) {
  return (
    <div
      className={mergeClasses(
        'rounded-lg transition-all duration-200 h-full',
        isSelected 
          ? 'border-2 border-blue-500 shadow-sm ring-2 ring-blue-100 bg-blue-50'
          : 'border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow bg-gradient-to-br from-slate-50 to-gray-50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={mergeClasses('p-3 sm:p-4 space-y-2', className)}>
      {children}
    </div>
  );
};

Card.Content = function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={mergeClasses('px-3 sm:px-4 pb-3 sm:pb-4', className)}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={mergeClasses('px-3 sm:px-4 py-2 sm:py-3 border-t bg-white/50 rounded-b-lg', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={mergeClasses('text-base sm:text-lg font-semibold text-gray-900 line-clamp-2', className)}>
      {children}
    </h3>
  );
};

Card.Grid = function CardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={mergeClasses('grid grid-cols-2 gap-2 text-sm text-gray-600', className)}>
      {children}
    </div>
  );
};