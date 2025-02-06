import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MonthlyFixedCosts } from '@/types/recipe';
import { calculateFixedCostPercentage } from '@/lib/recipes/calculations';
import { formatPrice } from '@/lib/utils';
import { Loader2, History, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FixedCostsFormProps {
  initialData?: MonthlyFixedCosts;
  onSubmit: (data: Omit<MonthlyFixedCosts, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  history?: MonthlyFixedCosts[];
}

export function FixedCostsForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  history = []
}: FixedCostsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<MonthlyFixedCosts, 'id'>>({
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
    totalMaterialsCost: initialData?.totalMaterialsCost || 0,
    totalFixedCosts: initialData?.totalFixedCosts || 0,
    totalSales: initialData?.totalSales || 0,
    productionSales: initialData?.productionSales || 0,
    fixedCostPercentage: initialData?.fixedCostPercentage || 0,
    lastUpdated: Date.now()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate data
    if (formData.totalSales < formData.productionSales) {
      alert('Las ventas de producción no pueden ser mayores que las ventas totales');
      return;
    }

    // Calculate production sales percentage
    const productionSalesPercentage = formData.totalSales > 0 
      ? (formData.productionSales / formData.totalSales) * 100 
      : 0;

    // Calculate fixed costs for production
    const productionFixedCosts = formData.totalFixedCosts * (productionSalesPercentage / 100);

    // Calculate fixed cost percentage based on production values
    const fixedCostPercentage = calculateFixedCostPercentage(
      formData.totalMaterialsCost,
      productionFixedCosts
    );

    try {
      setIsSaving(true);
      await onSubmit({
        ...formData,
        fixedCostPercentage,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error saving fixed costs:', error);
      // Error will be handled by the parent component
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate derived values
  const productionSalesPercentage = formData.totalSales > 0 
    ? (formData.productionSales / formData.totalSales) * 100 
    : 0;

  const productionFixedCosts = formData.totalFixedCosts * (productionSalesPercentage / 100);
  const currentFixedCostPercentage = calculateFixedCostPercentage(
    formData.totalMaterialsCost,
    productionFixedCosts
  );

  // Group history by year and month
  const groupedHistory = history.reduce((acc, entry) => {
    const year = entry.year;
    const month = entry.month;
    
    if (!acc[year]) {
      acc[year] = {};
    }
    
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    
    acc[year][month].push(entry);
    return acc;
  }, {} as Record<number, Record<number, MonthlyFixedCosts[]>>);

  // Sort years and months in descending order
  const sortedYears = Object.keys(groupedHistory)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Ventas</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Input
            label="Ventas Totales"
            type="number"
            min="0"
            step="any"
            value={formData.totalSales}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              totalSales: parseFloat(e.target.value) || 0
            }))}
            required
            isCurrency
            disabled={isSaving}
          />

          <Input
            label="Ventas de Producción Propia"
            type="number"
            min="0"
            step="any"
            value={formData.productionSales}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              productionSales: parseFloat(e.target.value) || 0
            }))}
            required
            isCurrency
            disabled={isSaving}
          />

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-2">
              Porcentaje de Ventas de Producción:
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {productionSalesPercentage.toFixed(2)}%
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Costos</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Input
            label="Costo Total de Materiales"
            type="number"
            min="0"
            step="any"
            value={formData.totalMaterialsCost}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              totalMaterialsCost: parseFloat(e.target.value) || 0
            }))}
            required
            isCurrency
            disabled={isSaving}
          />

          <Input
            label="Gastos Fijos Totales"
            type="number"
            min="0"
            step="any"
            value={formData.totalFixedCosts}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              totalFixedCosts: parseFloat(e.target.value) || 0
            }))}
            required
            isCurrency
            disabled={isSaving}
          />

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                Gastos Fijos de Producción:
              </div>
              <div className="text-xl font-bold text-blue-600">
                {formatPrice(productionFixedCosts)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {productionSalesPercentage.toFixed(2)}% de {formatPrice(formData.totalFixedCosts)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">
                Porcentaje sobre Materiales:
              </div>
              <div className="text-xl font-bold text-blue-600">
                {currentFixedCostPercentage.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {formatPrice(productionFixedCosts)} / {formatPrice(formData.totalMaterialsCost)}
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Historical Changes */}
      {sortedYears.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <Card.Title>Historial por Año y Mes</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              {sortedYears.map(year => (
                <div key={year} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {year}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(groupedHistory[year])
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([month, entries]) => {
                        const monthName = format(new Date(year, Number(month) - 1), 'MMMM', { locale: es });
                        const latestEntry = entries[entries.length - 1];
                        const previousEntry = history.find(h => 
                          h.year === year && 
                          h.month === Number(month) - 1
                        );

                        const percentageChange = previousEntry
                          ? ((latestEntry.fixedCostPercentage - previousEntry.fixedCostPercentage) / previousEntry.fixedCostPercentage) * 100
                          : 0;

                        return (
                          <div key={month} className="space-y-2">
                            <h4 className="font-medium text-gray-700 capitalize">
                              {monthName}
                            </h4>
                            <div 
                              className={`p-4 rounded-lg ${
                                Math.abs(percentageChange) > 10
                                  ? percentageChange > 0
                                    ? 'bg-red-50'
                                    : 'bg-green-50'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600">
                                  Última actualización:
                                </div>
                                {previousEntry && (
                                  <div className={`text-sm font-medium ${
                                    percentageChange > 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {percentageChange > 0 ? '+' : ''}
                                    {percentageChange.toFixed(2)}%
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Materiales:</span>
                                  <div className="font-medium">
                                    {formatPrice(latestEntry.totalMaterialsCost)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Gastos Fijos:</span>
                                  <div className="font-medium">
                                    {formatPrice(latestEntry.totalFixedCosts)}
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600">Porcentaje:</span>
                                  <div className="font-medium">
                                    {latestEntry.fixedCostPercentage.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                              {Math.abs(percentageChange) > 10 && (
                                <div className={`mt-2 flex items-center gap-1.5 text-sm ${
                                  percentageChange > 0 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                }`}>
                                  {percentageChange > 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4" />
                                  )}
                                  <span>
                                    {percentageChange > 0 
                                      ? 'Aumento significativo' 
                                      : 'Reducción significativa'
                                    } respecto al mes anterior
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving || isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSaving || isLoading}
          className="min-w-[100px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </div>
    </form>
  );
}