import React, { useState } from 'react';
import { Scale, Plus, X, Edit2, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUnitMeasures } from '@/hooks/useUnitMeasures';
import { useUnitConversions } from '@/hooks/useUnitConversions';
import { toast } from 'react-hot-toast';

interface UnitManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnitManagementModal({ isOpen, onClose }: UnitManagementModalProps) {
  const { unitMeasures, loading: unitsLoading, addUnitMeasure, updateUnitMeasure } = useUnitMeasures();
  const { conversions, loading: conversionsLoading, addConversion, updateConversion } = useUnitConversions();
  
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{ id: string; name: string } | null>(null);
  const [newUnit, setNewUnit] = useState('');
  const [isAddingConversion, setIsAddingConversion] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState<{
    id?: string;
    fromUnit: string;
    toUnit: string;
    factor: number;
  } | null>(null);

  // Get available units for "to" selection based on selected "from" unit
  const getAvailableToUnits = () => {
    if (!selectedConversion?.fromUnit) return unitMeasures;
    return unitMeasures.filter(unit => unit.name !== selectedConversion.fromUnit);
  };

  // Get available units for "from" selection based on selected "to" unit
  const getAvailableFromUnits = () => {
    if (!selectedConversion?.toUnit) return unitMeasures;
    return unitMeasures.filter(unit => unit.name !== selectedConversion.toUnit);
  };

  const handleAddUnit = async () => {
    if (!newUnit.trim()) {
      toast.error('Ingrese un nombre para la unidad');
      return;
    }

    try {
      await addUnitMeasure(newUnit.trim().toUpperCase());
      setNewUnit('');
      setIsAddingUnit(false);
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Error al agregar la unidad');
    }
  };

  const handleEditUnit = async () => {
    if (!editingUnit) return;
    if (!editingUnit.name.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    try {
      await updateUnitMeasure(editingUnit.id, editingUnit.name.trim().toUpperCase());
      setEditingUnit(null);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Error al actualizar la unidad');
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

  const loading = unitsLoading || conversionsLoading;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Unidades de Medida"
    >
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAddingUnit(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Nueva Unidad
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddingConversion(true)}
            className="gap-1"
            disabled={unitMeasures.length < 2}
            title={unitMeasures.length < 2 ? 'Se necesitan al menos 2 unidades' : ''}
          >
            <Plus className="w-4 h-4" />
            Nueva Conversión
          </Button>
        </div>

        {/* Units List */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Unidades Disponibles</h4>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {loading ? (
              <div className="w-full text-center py-4 text-gray-500">
                Cargando unidades...
              </div>
            ) : unitMeasures.length > 0 ? (
              unitMeasures.map((unit) => (
                <div
                  key={unit.id}
                  className="group relative inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800 hover:bg-violet-200 transition-colors"
                >
                  {unit.name}
                  <button
                    onClick={() => setEditingUnit({ id: unit.id, name: unit.name })}
                    className="ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
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
            {conversions.map((conversion) => (
              <div
                key={conversion.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{conversion.fromUnit}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{conversion.toUnit}</span>
                  <span className="text-sm text-gray-600">
                    (1 {conversion.fromUnit} = {conversion.factor} {conversion.toUnit})
                  </span>
                </div>
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
              </div>
            ))}
            {conversions.length === 0 && (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                No hay conversiones definidas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Unit Dialog */}
      <Dialog
        isOpen={isAddingUnit || !!editingUnit}
        onClose={() => {
          setIsAddingUnit(false);
          setEditingUnit(null);
          setNewUnit('');
        }}
        title={editingUnit ? 'Editar Unidad' : 'Agregar Unidad'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre de la unidad"
            value={editingUnit ? editingUnit.name : newUnit}
            onChange={(e) => {
              if (editingUnit) {
                setEditingUnit({ ...editingUnit, name: e.target.value.toUpperCase() });
              } else {
                setNewUnit(e.target.value.toUpperCase());
              }
            }}
            placeholder="Ej: KILOGRAMO"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingUnit(false);
                setEditingUnit(null);
                setNewUnit('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={editingUnit ? handleEditUnit : handleAddUnit}>
              {editingUnit ? 'Actualizar' : 'Agregar'}
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
                  // Reset toUnit if it's the same as the new fromUnit
                  toUnit: prev?.toUnit === e.target.value ? '' : (prev?.toUnit || '')
                }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccionar unidad...</option>
                {getAvailableFromUnits().map(unit => (
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
                  // Reset fromUnit if it's the same as the new toUnit
                  fromUnit: prev?.fromUnit === e.target.value ? '' : (prev?.fromUnit || '')
                }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Seleccionar unidad...</option>
                {getAvailableToUnits().map(unit => (
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
    </Dialog>
  );
}