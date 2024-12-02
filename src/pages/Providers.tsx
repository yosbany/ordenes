import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
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
      toast.error('Ocurrió un error al guardar el proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (provider: Provider) => {
    setProviderToDelete(provider);
  };

  const confirmDelete = async () => {
    if (!providerToDelete) return;
    
    try {
      await deleteProvider(providerToDelete.id!);
      toast.success('Proveedor eliminado exitosamente');
      setProviderToDelete(null);
    } catch (error) {
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
    if (editingProvider) {
      const dialog = Dialog({
        isOpen: true,
        onClose: () => {},
        title: "Advertencia",
        children: (
          <div className="space-y-4">
            <p className="text-amber-600">
              Hay un proveedor en edición. ¿Desea cancelar los cambios y crear uno nuevo?
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => dialog.close()}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setEditingProvider(null);
                  setIsFormOpen(true);
                  dialog.close();
                }}
              >
                Continuar
              </Button>
            </div>
          </div>
        ),
      });
    } else {
      setIsFormOpen(true);
    }
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
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingProvider ? 'Editar' : 'Nuevo'} Proveedor
        </h2>
        <ProviderForm
          initialData={editingProvider || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleNewProvider}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
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
      </div>

      <Dialog
        isOpen={!!providerToDelete}
        onClose={() => setProviderToDelete(null)}
        title="Eliminar proveedor"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea eliminar el proveedor "{providerToDelete?.commercialName}"?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setProviderToDelete(null)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}