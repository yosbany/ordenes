import { useState } from 'react';
import { Product } from '@/types';
import { validateProduct } from '@/lib/validation/productValidation';
import { toast } from 'react-hot-toast';

interface UseProductFormProps {
  initialData?: Product;
  providerId: string;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
}

export function useProductForm({ initialData, providerId, onSubmit }: UseProductFormProps) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: initialData?.name?.toUpperCase() || '',
    sku: initialData?.sku || '',
    supplierCode: initialData?.supplierCode || '',
    purchasePackaging: initialData?.purchasePackaging?.toUpperCase() || '',
    salePackaging: initialData?.salePackaging?.toUpperCase() || '',
    order: initialData?.order || 0,
    price: initialData?.price || 0,
    desiredStock: initialData?.desiredStock || 0,
    minPackageStock: initialData?.minPackageStock || 0,
    providerId: initialData?.providerId || providerId,
    tags: initialData?.tags || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof Omit<Product, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProviderChange = (newProviderId: string) => {
    updateField('providerId', newProviderId);
    // Clear supplier code when provider changes
    updateField('supplierCode', '');
  };

  const validateForm = (): boolean => {
    const validationError = validateProduct(formData);
    if (validationError) {
      setErrors({ [validationError.field]: validationError.message });
      toast.error(validationError.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setErrors({});

    try {
      // Validate form
      if (!validateForm()) return;

      setIsSubmitting(true);

      // Format data before submission
      const formattedData = {
        ...formData,
        name: formData.name.toUpperCase(),
        sku: formData.sku.toUpperCase(),
        supplierCode: formData.supplierCode?.toUpperCase() || '',
        purchasePackaging: formData.purchasePackaging.toUpperCase(),
        salePackaging: formData.salePackaging?.toUpperCase() || '',
        price: Number(formData.price),
        minPackageStock: Number(formData.minPackageStock),
        desiredStock: Number(formData.desiredStock),
        order: Number(formData.order),
        tags: formData.tags || []
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateField,
    handleProviderChange,
    handleSubmit,
    isSubmitting,
    errors,
    validateForm
  };
}