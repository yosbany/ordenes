import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, AlertTriangle, TrendingDown } from 'lucide-react';
import { CostHistoryEntry } from '@/types/recipe';
import { formatPrice } from '@/lib/utils';

interface RecipeCostHistoryProps {
  history?: CostHistoryEntry[];
  costThreshold?: number;
}

export function RecipeCostHistory({ history = [], costThreshold = 20 }: RecipeCostHistoryProps) {
  // Sort history and separate significant changes
  const sortedHistory = [...history].sort((a, b) => b.date - a.date);
  
  // Separate entries into significant and normal changes
  const { significantChanges, normalChanges } = sortedHistory.reduce((acc, entry, index) => {
    const nextEntry = sortedHistory[index + 1];
    const changePercentage = entry.changePercentage;
    const isSignificantChange = Math.abs(changePercentage) > costThreshold;

    if (isSignificantChange) {
      acc.significantChanges.push({ entry, nextEntry });
    } else {
      acc.normalChanges.push({ entry, nextEntry });
    }

    return acc;
  }, {
    significantChanges: [] as { entry: CostHistoryEntry; nextEntry?: CostHistoryEntry }[],
    normalChanges: [] as { entry: CostHistoryEntry; nextEntry?: CostHistoryEntry }[]
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600">
        <History className="w-5 h-5" />
        <h3 className="font-medium">Historial de Cambios</h3>
      </div>

      {/* Alert for Significant Changes */}
      {significantChanges.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="font-medium text-amber-900">
              Cambios Significativos ({significantChanges.length})
            </h4>
          </div>
          <div className="space-y-3">
            {significantChanges.map(({ entry, nextEntry }) => {
              const changePercentage = entry.changePercentage;
              const isIncrease = changePercentage > 0;

              return (
                <div
                  key={entry.date}
                  className={`p-3 rounded-lg ${
                    isIncrease
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  {/* Date and Change Percentage */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {format(entry.date, "MMMM yyyy", { locale: es })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(entry.date, "d 'de' MMMM, HH:mm", { locale: es })}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      isIncrease ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isIncrease ? '+' : ''}
                      {changePercentage.toFixed(2)}%
                    </span>
                  </div>

                  {/* Cost Change Details */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">Costo Actual:</div>
                      <div className={`text-lg font-medium ${
                        isIncrease ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {formatPrice(entry.unitCost)}
                      </div>
                    </div>

                    {nextEntry && (
                      <>
                        <div className="text-gray-400">→</div>
                        <div className="flex-1 text-right">
                          <div className="text-sm text-gray-500">Costo Anterior:</div>
                          <div className="text-lg font-medium text-gray-900">
                            {formatPrice(nextEntry.unitCost)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Alert Badge */}
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isIncrease 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {isIncrease ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {isIncrease 
                      ? 'Aumento significativo'
                      : 'Reducción significativa'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal Changes */}
      <div className="space-y-3">
        {normalChanges.map(({ entry, nextEntry }) => (
          <div
            key={entry.date}
            className="p-3 rounded-lg bg-gray-50 border border-gray-200"
          >
            {/* Date and Change Percentage */}
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">
                  {format(entry.date, "MMMM yyyy", { locale: es })}
                </div>
                <div className="text-xs text-gray-500">
                  {format(entry.date, "d 'de' MMMM, HH:mm", { locale: es })}
                </div>
              </div>
              {nextEntry && (
                <span className={`text-sm font-medium ${
                  entry.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {entry.changePercentage > 0 ? '+' : ''}
                  {entry.changePercentage.toFixed(2)}%
                </span>
              )}
            </div>

            {/* Cost Change Details */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm text-gray-500">Costo Actual:</div>
                <div className="text-lg font-medium text-gray-900">
                  {formatPrice(entry.unitCost)}
                </div>
              </div>

              {nextEntry && (
                <>
                  <div className="text-gray-400">→</div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-500">Costo Anterior:</div>
                    <div className="text-lg font-medium text-gray-900">
                      {formatPrice(nextEntry.unitCost)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              Primer mes de registro
            </div>
          </div>
        )}
      </div>
    </div>
  );
}