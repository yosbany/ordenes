import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProviders } from '@/hooks/useProviders';
import { useProducts } from '@/hooks/useProducts';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { GlobalProductSearch } from '@/components/products/GlobalProductSearch';
import { FullscreenProductForm } from '@/components/products/FullscreenProductForm';
import { Product } from '@/types';
import { getSectorFromOrder, getSequenceFromOrder, calculateNewOrder } from '@/lib/order/utils';
import { reorderProducts } from '@/lib/order/reorder';
import { reorderAfterDelete } from '@/lib/order/delete';
import { SECTORS } from '@/config/constants';

export function Products() {
  const { providers } = useProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts(selectedProviderId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, data);
        
        // Reorder products if order changed
        if (data.order !== editingProduct.order) {
          const sector = getSectorFromOrder(data.order);
          const position = getSequenceFromOrder(data.order);
          
          const updatedProducts = reorderProducts(
            products,
            sector,
            position,
            editingProduct.id!
          );

          // Update all affected products
          await Promise.all(
            updatedProducts
              .filter(p => p.order !== products.find(op => op.id === p.id)?.order)
              .map(p => updateProduct(p.id!, { order: p.order }))
          );
        }

        toast.success('Producto actualizado exitosamente');
      } else {
        // For new products, calculate order at the end of the first sector
        const defaultSector = SECTORS[0].code;
        const sectorProducts = products.filter(p => getSectorFromOrder(p.order) === defaultSector);
        const newOrder = calculateNewOrder(defaultSector, sectorProducts.length + 1);
        await addProduct({ ...data, order: newOrder });
        toast.success('Producto creado exitosamente');
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Ocurrió un error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderChange = async (product: Product, newOrder: number) => {
    try {
      const sector = getSectorFromOrder(newOrder);
      const position = getSequenceFromOrder(newOrder);
      
      // Reorder all products in the sector
      const updatedProducts = reorderProducts(
        products,
        sector,
        position,
        product.id!
      );

      // Update all affected products
      await Promise.all(
        updatedProducts
          .filter(p => p.order !== products.find(op => op.id === p.id)?.order)
          .map(p => updateProduct(p.id!, { order: p.order }))
      );

      toast.success('Orden actualizado exitosamente');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el orden');
    }
  };

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      // First reorder the remaining products
      const updatedProducts = reorderAfterDelete(products, productToDelete);
      
      // Update orders of affected products
      await Promise.all(
        updatedProducts
          .filter(p => p.order !== products.find(op => op.id === p.id)?.order)
          .map(p => updateProduct(p.id!, { order: p.order }))
      );

      // Then delete the product
      await deleteProduct(productToDelete.id!);
      toast.success('Producto eliminado exitosamente');
      setProductToDelete(null);
    } catch (error) {
      toast.error('Ocurrió un error al eliminar el producto');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleGlobalProductSelect = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const providerOptions = providers.map(provider => ({
    value: provider.id!,
    label: provider.commercialName
  }));

  return (
    <div className="space-y-4">
      {/* Global Product Search */}
      <GlobalProductSearch onProductSelect={handleGlobalProductSelect} />

      {/* Provider Selection and New Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 max-w-xs">
          <SearchableSelect
            options={providerOptions}
            value={selectedProviderId}
            onChange={setSelectedProviderId}
            placeholder="Seleccionar Proveedor"
          />
        </div>

        {selectedProviderId && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {/* Main Content */}
      {selectedProviderId ? (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {isFormOpen && (
              <FullscreenProductForm
                providerId={selectedProviderId}
                initialData={editingProduct || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
                isLoading={isSubmitting}
              />
            )}

            {!isFormOpen && (
              <ProductCarousel
                products={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOrderChange={handleOrderChange}
              />
            )}
          </>
        )
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-center px-4">
            Seleccione un proveedor para ver sus productos
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Eliminar producto"
      >
        <div className="space-y-4">
          <p className="text-amber-600">
            ¿Está seguro que desea eliminar el producto "{productToDelete?.name}"?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
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