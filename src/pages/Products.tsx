import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ProviderSelector } from '@/components/ui/ProviderSelector';
import { useProviders } from '@/hooks/useProviders';
import { useProducts } from '@/hooks/useProducts';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { GlobalProductSearch } from '@/components/products/GlobalProductSearch';
import { ProviderProductSearch } from '@/components/products/ProviderProductSearch';
import { FullscreenProductForm } from '@/components/products/FullscreenProductForm';
import { Product } from '@/types';
import { SECTORS } from '@/config/constants';
import { calculateNewOrder } from '@/lib/order/utils';

export function Products() {
  const { providers } = useProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts(selectedProviderId);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id!, {
          ...data,
          id: editingProduct.id
        });
        handleCloseForm();
        toast.success('Producto actualizado exitosamente');
      } else {
        const defaultSector = SECTORS[0].code;
        const sectorProducts = products.filter(p => getSectorFromOrder(p.order) === defaultSector);
        const newOrder = calculateNewOrder(defaultSector, sectorProducts.length + 1);
        
        await addProduct({ ...data, order: newOrder });
        handleCloseForm();
        toast.success('Producto creado exitosamente');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
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

  return (
    <div className="space-y-6">
      {/* Global Product Search */}
      <GlobalProductSearch onProductSelect={handleEdit} />

      {/* Provider Selection and New Product Button */}
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1">
          <ProviderSelector
            providers={providers}
            selectedProviderId={selectedProviderId}
            onChange={setSelectedProviderId}
          />
        </div>

        {selectedProviderId && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white h-[48px] px-6 rounded-lg shadow-sm hover:shadow transition-all w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="whitespace-nowrap">Nuevo Producto</span>
          </Button>
        )}
      </div>

      {/* Product Form */}
      {isFormOpen && (
        <FullscreenProductForm
          providerId={editingProduct?.providerId || selectedProviderId}
          initialData={editingProduct || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      )}

      {/* Main Content */}
      {selectedProviderId ? (
        loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          !isFormOpen && (
            <>
              <ProviderProductSearch
                products={products}
                onFilter={setFilteredProducts}
              />
              <ProductCarousel
                products={filteredProducts.length > 0 ? filteredProducts : products}
                onEdit={handleEdit}
                onDelete={handleDelete}
                providerId={selectedProviderId}
              />
            </>
          )
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