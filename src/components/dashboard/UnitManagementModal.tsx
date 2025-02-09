import React, { useState } from 'react';
import { Scale, Plus, X, Save, Edit2, Trash2, AlertTriangle, ArrowRight, Check } from 'lucide-react';
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
  const { conversions, loading: conversionsLoading, addConversion, updateConversion, deleteConversion } = useUnitConversions();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const [editingConversionId, setEditingConversionId] = useState<string | null>(null);
  const [editingConversion, setEditingConversion] = useState<{
    fromUnit: string;
    toUnit: string;
    factor: number;
  } | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [isAddingConversion, setIsAddingConversion] = useState(false);
  const [newConversion, setNewConversion] = useState<{
    fromUnit: string;
    toUnit: string;
    factor: number;
  }>({ fromUnit: '', toUnit: '', factor: 1 });

  // Filter units and conversions based on search term
  const filteredUnits = unitMeasures.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversions = conversions.filter(conversion =>
    conversion.fromUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversion.toUnit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveUnit = async (id: string, name: string) => {
    try {
      await updateUnitMeasure(id, name.trim().toUpperCase());
      setEditingUnitId(null);
      setEditingUnitName('');
      toast.success('Unidad actualizada exitosamente');
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Error al actualizar la unidad');
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) {
      toast.error('Ingrese un nombre para la unidad');
      return;
    }

    try {
      await addUnitMeasure(newUnitName.trim().toUpperCase());
      setNewUnitName('');
      setIsAddingUnit(false);
      toast.success('Unidad agregada exitosamente');
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Error al agregar la unidad');
    }
  };

  const handleSaveConversion = async (id: string | null) => {
    const conversionData = id ? editingConversion : newConversion;
    if (!conversionData) return;

    if (!conversionData.fromUnit || !conversionData.toUnit) {
      toast.error('Seleccione ambas unidades');
      return;
    }

    if (!conversionData.factor || conversionData.factor <= 0) {
      toast.error('El factor debe ser mayor a 0');
      return;
    }

    try {
      if (id) {
        await updateConversion(id, conversionData);
        setEditingConversionId(null);
        setEditingConversion(null);
        toast.success('Conversión actualizada exitosamente');
      } else {
        await addConversion(conversionData);
        setIsAddingConversion(false);
        setNewConversion({ fromUnit: '', toUnit: '', factor: 1 });
        toast.success('Conversión agregada exitosamente');
      }
    } catch (error) {
      console.error('Error saving conversion:', error);
      toast.error('Error al guardar la conversión');
    }
  };

  if (unitsLoading || conversionsLoading) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="Gestión de Unidades de Medida"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Unidades de Medida"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Input
            placeholder="Buscar unidades o conversiones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Units List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Unidades de Medida</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingUnit(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {/* Add New Unit Row */}
            {isAddingUnit && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value.toUpperCase())}
                  placeholder="Nueva unidad..."
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddUnit}
                    className="w-8 h-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingUnit(false);
                      setNewUnitName('');
                    }}
                    className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Units List */}
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                {editingUnitId === unit.id ? (
                  <>
                    <Input
                      value={editingUnitName}
                      onChange={(e) => setEditingUnitName(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveUnit(unit.id, editingUnitName)}
                        className="w-8 h-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUnitId(null);
                          setEditingUnitName('');
                        }}
                        className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium">{unit.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingUnitId(unit.id);
                        setEditingUnitName(unit.name);
                      }}
                      className="w-8 h-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conversions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Conversiones</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingConversion(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {/* Add New Conversion Row */}
            {isAddingConversion && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newConversion.fromUnit}
                    onChange={(e) => setNewConversion(prev => ({
                      ...prev,
                      fromUnit: e.target.value,
                      toUnit: prev.toUnit === e.target.value ? '' : prev.toUnit
                    }))}
                    className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Desde...</option>
                    {unitMeasures.map(unit => (
                      <option key={unit.id} value={unit.name}>{unit.name}</option>
                    ))}
                  </select>

                  <select
                    value={newConversion.toUnit}
                    onChange={(e) => setNewConversion(prev => ({
                      ...prev,
                      toUnit: e.target.value,
                      fromUnit: prev.fromUnit === e.target.value ? '' : prev.fromUnit
                    }))}
                    className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Hacia...</option>
                    {unitMeasures
                      .filter(unit => unit.name !== newConversion.fromUnit)
                      .map(unit => (
                        <option key={unit.id} value={unit.name}>{unit.name}</option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newConversion.factor}
                    onChange={(e) => setNewConversion(prev => ({
                      ...prev,
                      factor: parseFloat(e.target.value) || 0
                    }))}
                    min={0}
                    step="0.0001"
                    placeholder="Factor de conversión"
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveConversion(null)}
                      className="w-8 h-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingConversion(false);
                        setNewConversion({ fromUnit: '', toUnit: '', factor: 1 });
                      }}
                      className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {newConversion.fromUnit && newConversion.toUnit && newConversion.factor > 0 && (
                  <div className="text-sm text-blue-700">
                    1 {newConversion.fromUnit} = {newConversion.factor} {newConversion.toUnit}
                  </div>
                )}
              </div>
            )}

            {/* Conversions List */}
            {filteredConversions.map((conversion) => (
              <div
                key={conversion.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {editingConversionId === conversion.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editingConversion?.fromUnit || ''}
                        onChange={(e) => setEditingConversion(prev => ({
                          ...prev!,
                          fromUnit: e.target.value,
                          toUnit: prev?.toUnit === e.target.value ? '' : (prev?.toUnit || '')
                        }))}
                        className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Desde...</option>
                        {unitMeasures.map(unit => (
                          <option key={unit.id} value={unit.name}>{unit.name}</option>
                        ))}
                      </select>

                      <select
                        value={editingConversion?.toUnit || ''}
                        onChange={(e) => setEditingConversion(prev => ({
                          ...prev!,
                          toUnit: e.target.value,
                          fromUnit: prev?.fromUnit === e.target.value ? '' : (prev?.fromUnit || '')
                        }))}
                        className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Hacia...</option>
                        {unitMeasures
                          .filter(unit => unit.name !== editingConversion?.fromUnit)
                          .map(unit => (
                            <option key={unit.id} value={unit.name}>{unit.name}</option>
                          ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editingConversion?.factor || ''}
                        onChange={(e) => setEditingConversion(prev => ({
                          ...prev!,
                          factor: parseFloat(e.target.value) || 0
                        }))}
                        min={0}
                        step="0.0001"
                        placeholder="Factor de conversión"
                        className="flex-1"
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveConversion(conversion.id!)}
                          className="w-8 h-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingConversionId(null);
                            setEditingConversion(null);
                          }}
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {editingConversion?.fromUnit && editingConversion?.toUnit && editingConversion?.factor > 0 && (
                      <div className="text-sm text-blue-700">
                        1 {editingConversion.fromUnit} = {editingConversion.factor} {editingConversion.toUnit}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{conversion.fromUnit}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{conversion.toUnit}</span>
                      <span className="text-sm text-gray-500">
                        (1 {conversion.fromUnit} = {conversion.factor} {conversion.toUnit})
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingConversionId(conversion.id);
                          setEditingConversion({
                            fromUnit: conversion.fromUnit,
                            toUnit: conversion.toUnit,
                            factor: conversion.factor
                          });
                        }}
                        className="w-8 h-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteConversion(conversion.id!)}
                        className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}