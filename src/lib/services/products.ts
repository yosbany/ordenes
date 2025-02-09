import { ref, update, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase/auth';
import { Product, PriceHistoryEntry } from '@/types';
import { DatabaseError } from './errors';

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  if (!auth.currentUser) {
    throw new DatabaseError('User not authenticated');
  }

  try {
    // First get current product data
    const productRef = ref(db, `products/${id}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) {
      throw new DatabaseError('Product not found');
    }

    const currentProduct = {
      ...snapshot.val(),
      enabled: snapshot.val().enabled ?? true // Set default enabled state
    } as Product;
    
    // Create a clean updates object with only defined values
    const cleanUpdates: Record<string, any> = {
      lastUpdated: Date.now()
    };

    // Handle enabled state explicitly
    if (typeof updates.enabled === 'boolean') {
      cleanUpdates.enabled = updates.enabled;
    }

    // Handle price updates and history
    if (typeof updates.price === 'number') {
      const newPrice = Number(updates.price);
      if (Math.abs(newPrice - currentProduct.price) > 0.01) {
        cleanUpdates.price = newPrice;
        
        // Calculate price change percentage
        const changePercentage = currentProduct.price > 0
          ? ((newPrice - currentProduct.price) / currentProduct.price) * 100
          : 0;

        // Create price history entry
        const historyEntry: PriceHistoryEntry = {
          date: Date.now(),
          price: newPrice,
          changePercentage: Number(changePercentage.toFixed(2))
        };

        // Add to price history
        const priceHistory = currentProduct.priceHistory || [];
        cleanUpdates.priceHistory = [...priceHistory, historyEntry];
      }
    }

    // Handle sale price updates and history
    if (typeof updates.salePrice === 'number') {
      const newSalePrice = Number(updates.salePrice);
      if (Math.abs(newSalePrice - (currentProduct.salePrice || 0)) > 0.01) {
        cleanUpdates.salePrice = newSalePrice;
        
        // Calculate price change percentage
        const changePercentage = currentProduct.salePrice
          ? ((newSalePrice - currentProduct.salePrice) / currentProduct.salePrice) * 100
          : 0;

        // Create price history entry
        const historyEntry: PriceHistoryEntry = {
          date: Date.now(),
          price: newSalePrice,
          changePercentage: Number(changePercentage.toFixed(2))
        };

        // Add to sale price history
        const salePriceHistory = currentProduct.salePriceHistory || [];
        cleanUpdates.salePriceHistory = [...salePriceHistory, historyEntry];
      }
    }

    // Handle other fields
    if (typeof updates.name === 'string') {
      cleanUpdates.name = updates.name.trim().toUpperCase();
    }
    if (typeof updates.sku === 'string') {
      cleanUpdates.sku = updates.sku.trim().toUpperCase();
    }
    if (typeof updates.supplierCode === 'string') {
      cleanUpdates.supplierCode = updates.supplierCode.trim().toUpperCase();
    }
    if (typeof updates.purchasePackaging === 'string') {
      cleanUpdates.purchasePackaging = updates.purchasePackaging.trim().toUpperCase();
    }
    if (typeof updates.salePackaging === 'string') {
      cleanUpdates.salePackaging = updates.salePackaging.trim().toUpperCase();
    }
    if (typeof updates.order === 'number') {
      cleanUpdates.order = updates.order;
    }
    if (typeof updates.minPackageStock === 'number') {
      cleanUpdates.minPackageStock = updates.minPackageStock;
    }
    if (typeof updates.desiredStock === 'number') {
      cleanUpdates.desiredStock = updates.desiredStock;
    }
    if (Array.isArray(updates.tags)) {
      cleanUpdates.tags = updates.tags;
    }
    if (typeof updates.isProduction === 'boolean') {
      cleanUpdates.isProduction = updates.isProduction;
    }
    if (typeof updates.forSale === 'boolean') {
      cleanUpdates.forSale = updates.forSale;
    }
    if (typeof updates.unitMeasure === 'string') {
      cleanUpdates.unitMeasure = updates.unitMeasure.trim().toUpperCase();
    }
    if (typeof updates.pricePerUnit === 'number') {
      cleanUpdates.pricePerUnit = updates.pricePerUnit;
    }
    if (typeof updates.saleCostPerUnit === 'number') {
      cleanUpdates.saleCostPerUnit = updates.saleCostPerUnit;
    }
    if (typeof updates.priceThreshold === 'number') {
      cleanUpdates.priceThreshold = updates.priceThreshold;
    }

    // Handle stock adjustments
    if (Array.isArray(updates.stockAdjustments)) {
      // Only add new adjustments that don't exist
      const currentAdjustments = currentProduct.stockAdjustments || [];
      const newAdjustments = updates.stockAdjustments.filter(adj => 
        !currentAdjustments.some(current => 
          current.date === adj.date && 
          current.quantity === adj.quantity
        )
      );

      if (newAdjustments.length > 0) {
        cleanUpdates.stockAdjustments = [...currentAdjustments, ...newAdjustments];
        cleanUpdates.lastStockCheck = Date.now();
      }
    }

    // Only update if we have valid changes
    if (Object.keys(cleanUpdates).length > 0) {
      await update(productRef, cleanUpdates);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error instanceof DatabaseError) {
      throw error;
    }
    
    throw new DatabaseError('Failed to update product', { 
      cause: error instanceof Error ? error : new Error('Unknown error') 
    });
  }
}