import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Phone, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { useProviders } from '@/hooks/useProviders';
import { Provider } from '@/types';
import { generateWhatsAppLink, formatPhoneNumber } from '@/lib/utils';

export function Providers() {
  const { providers, loading, addProvider, updateProvider, deleteProvider } = useProviders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter providers based on search term
  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;

    const searchLower = searchTerm.toLowerCase();
    return providers.filter(provider => 
      provider.commercialName.toLowerCase().includes(searchLower) ||
      provider.legalName?.toLowerCase().includes(searchLower) ||
      provider.rut?.toLowerCase().includes(searchLower) ||
      provider.phone?.includes(searchLower)
    );
  }, [providers, searchTerm]);

  const handleSubmit = async (data: Omit<Provider, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id!, data);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await addProvider(data);
        toast.success('Proveedor creado exitosamente');
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error('Ocurrió un error al guardar el proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (provider: Provider) => {
    setProviderToDelete(provider);
  };

  const confirmDelete = async () => {
    if (!providerToDelete) return;
    
    try {
      await deleteProvider(providerToDelete.id!);
      toast.success('Proveedor eliminado exitosamente');
      setProviderToDelete(null);
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Ocurrió un error al eliminar el proveedor');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProvider(null);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  const handleNewProvider = () => {
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isFormOpen || editingProvider) {
    return (
      <ProviderForm
        initialData={editingProvider || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCloseForm}
        isLoading={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button onClick={handleNewProvider} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Providers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold break-words">{provider.commercialName}</h3>
              {provider.legalName && (
                <p className="text-sm text-gray-600 break-words">{provider.legalName}</p>
              )}
              {provider.rut && (
                <p className="text-sm text-gray-600">RUT: {provider.rut}</p>
              )}
              {provider.phone && (
                <p className="text-sm text-gray-600">
                  Celular: {formatPhoneNumber(provider.phone)}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(provider)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(provider)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
              
              {provider.phone && (
                <a
                  href={generateWhatsAppLink(provider.phone, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredProviders.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-center">
              {searchTerm 
                ? 'No se encontraron proveedores que coincidan con la búsqueda'
                : 'No hay proveedores registrados'
              }
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!providerToDelete}
        onClose={() => setProviderToDelete(null)}
        title="Eliminar proveedor"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-amber-800">
              ¿Está seguro que desea eliminar el proveedor <span className="font-semibold">{providerToDelete?.commercialName}</span>?
            </p>
            <p className="text-sm text-amber-700 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setProviderToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}