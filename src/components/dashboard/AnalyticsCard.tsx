import React from 'react';
import { Card } from '@/components/ui/Card';

interface AnalyticsCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function AnalyticsCard({ 
  title, 
  icon, 
  children, 
  loading,
  className,
  onClick 
}: AnalyticsCardProps) {
  return (
    <Card 
      className={className}
      onClick={onClick}
    >
      <Card.Header className="!p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            {loading ? (
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="break-words">
                {children}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
        </div>
      </Card.Header>
    </Card>
  );
}