import React from 'react';
import { mergeClasses } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'teal' | 'indigo';
}

const variantStyles = {
  default: 'border-gray-200 hover:border-gray-300',
  blue: 'border-blue-200 hover:border-blue-300',
  green: 'border-emerald-200 hover:border-emerald-300',
  amber: 'border-amber-200 hover:border-amber-300',
  purple: 'border-purple-200 hover:border-purple-300',
  rose: 'border-rose-200 hover:border-rose-300',
  teal: 'border-teal-200 hover:border-teal-300',
  indigo: 'border-indigo-200 hover:border-indigo-300'
};

export function Card({ children, className, isSelected, onClick, variant = 'default' }: CardProps) {
  return (
    <div
      className={mergeClasses(
        'rounded-lg transition-all duration-200 h-full',
        isSelected 
          ? 'border-2 border-blue-500 shadow-sm ring-2 ring-blue-100 bg-blue-50'
          : `border ${variantStyles[variant]} shadow-sm hover:shadow bg-white`,
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
    <div className={mergeClasses('p-4 border-b border-gray-100', className)}>
      {children}
    </div>
  );
};

Card.Content = function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={mergeClasses('p-4', className)}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={mergeClasses('px-4 py-3 border-t bg-gray-50 rounded-b-lg', className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={mergeClasses('text-base font-semibold text-gray-900 line-clamp-2', className)}>
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