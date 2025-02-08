import React, { useState } from 'react';
import { Scale, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { useUnitMeasures } from '@/hooks/useUnitMeasures';
import { useUnitConversions } from '@/hooks/useUnitConversions';
import { toast } from 'react-hot-toast';

export function UnitConversionsCard() {
  const { unitMeasures, loading: unitsLoading, addUnitMeasure } = useUnitMeasures();
  const { conversions, loading: conversionsLoading, addConversion, updateConversion, deleteConversion } = useUnitConversions();
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [isAddingConversion, setIsAddingConversion] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState<{
    id?: string;
    fromUnit: string;
    toUnit: string;
    factor: number;
  } | null>(null);

  const handleAddUnit = async () => {
    if (!newUnit.trim()) {
      toast.error('Ingrese un nombre para la unidad');
      return;
    }

    try {
      await addUnitMeasure(newUnit.trim().toUpperCase());
      setNewUnit('');
      setIsAddingUnit(false);
      toast.success('Unidad agregada exitosamente');
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Error al agregar la unidad');
    }
  };

  const handleConversionSubmit = async () => {
    if (!selectedConversion) return;
    
    if (!selectedConversion.fromUnit || !selectedConversion.toUnit) {
      toast.error('Seleccione ambas unidades');
      return;
    }

    if (!selectedConversion.factor || selectedConversion.factor <= 0) {
      toast.error('El factor debe ser mayor a 0');
      return;
    }

    try {
      if (selectedConversion.id) {
        await updateConversion(selectedConversion.id, {
          fromUnit: selectedConversion.fromUnit,
          toUnit: selectedConversion.toUnit,
          factor: selectedConversion.factor
        });
        toast.success('Conversión actualizada');
      } else {
        await addConversion({
          fromUnit: selectedConversion.fromUnit,
          toUnit: selectedConversion.toUnit,
          factor: selectedConversion.factor
        });
        toast.success('Conversión agregada');
      }
      setIsAddingConversion(false);
      setSelectedConversion(null);
    } catch (error) {
      console.error('Error saving conversion:', error);
      toast.error('Error al guardar la conversión');
    }
  };

  const handleDeleteConversion = async (id: string) => {
    try {
      await deleteConversion(id);
      toast.success('Conversión eliminada');
    } catch (error) {
      console.error('Error deleting conversion:', error);
      toast.error('Error al eliminar la conversión');
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Scale className="w-5 h-5 text-violet-600" />
            </div>
            <Card.Title>Unidades y Conversiones</Card.Title>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingConversion(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Conversión
          </Button>
        </div>
      </Card.Header>

      <Card.Content>
        <div className="space-y-4">
          {/* Units List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Unidades Disponibles</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingUnit(true)}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Agregar</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {unitsLoading ? (
                <div className="w-full text-center py-4 text-gray-500">
                  Cargando unidades...
                </div>
              ) : unitMeasures.length > 0 ? (
                unitMeasures.map((unit) => (
                  <span
                    key={unit.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800"
                  >
                    {unit.name}
                  </span>
                ))
              ) : (
                <div className="w-full text-center py-4 text-gray-500">
                  No hay unidades definidas
                </div>
              )}
            </div>
          </div>

          {/* Conversions List */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Conversiones</h4>
            <div className="space-y-2">
              {conversionsLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Cargando conversiones...
                </div>
              ) : conversions.length > 0 ? (
                conversions.map((conversion) => (
                  <div
                    key={conversion.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{conversion.fromUnit}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-medium">{conversion.toUnit}</span>
                      <span className="text-sm text-gray-600">
                        (1 {conversion.fromUnit} = {conversion.factor} {conversion.toUnit})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedConversion(conversion);
                          setIsAddingConversion(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConversion(conversion.id!)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  No hay conversiones definidas
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Content>

      {/* Add Unit Dialog */}
      <Dialog
        isOpen={isAddingUnit}
        onClose={() => {
          setIsAddingUnit(false);
          setNewUnit('');
        }}
        title="Agregar Unidad de Medida"
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la unidad"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value.toUpperCase())}
            placeholder="Ej: KILOGRAMO"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingUnit(false);
                setNewUnit('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddUnit}>
              Agregar
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add/Edit Conversion Dialog */}
      <Dialog
        isOpen={isAddingConversion}
        onClose={() => {
          setIsAddingConversion(false);
          setSelectedConversion(null);
        }}
        title={selectedConversion?.id ? 'Editar Conversión' : 'Nueva Conversión'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <select
                value={selectedConversion?.fromUnit || ''}
                onChange={(e) => setSelectedConversion(prev => ({
                  ...prev || { factor: 1 },
                  fromUnit: e.target.value,
                  toUnit: prev?.toUnit === e.target.value ? '' : (prev?.toUnit || '')
                }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccionar unidad...</option>
                {unitMeasures.map(unit => (
                  <option key={unit.id} value={unit.name}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hacia
              </label>
              <select
                value={selectedConversion?.toUnit || ''}
                onChange={(e) => setSelectedConversion(prev => ({
                  ...prev || { factor: 1 },
                  toUnit: e.target.value,
                  fromUnit: prev?.fromUnit === e.target.value ? '' : (prev?.fromUnit || '')
                }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccionar unidad...</option>
                {unitMeasures
                  .filter(unit => unit.name !== selectedConversion?.fromUnit)
                  .map(unit => (
                    <option key={unit.id} value={unit.name}>{unit.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <Input
            type="number"
            label="Factor de conversión"
            value={selectedConversion?.factor || ''}
            onChange={(e) => setSelectedConversion(prev => ({
              ...prev || { fromUnit: '', toUnit: '' },
              factor: parseFloat(e.target.value)
            }))}
            min={0}
            step="0.0001"
            placeholder="Ej: 1000 para KG → G"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingConversion(false);
                setSelectedConversion(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConversionSubmit}>
              {selectedConversion?.id ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}