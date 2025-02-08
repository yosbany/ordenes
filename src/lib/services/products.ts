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

    const currentProduct = snapshot.val() as Product;
    
    // Create a clean updates object with only defined values
    const cleanUpdates: Record<string, any> = {};

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

    // Handle forSale flag
    if (typeof updates.forSale === 'boolean') {
      cleanUpdates.forSale = updates.forSale;
    }

    // Handle pricePerUnit
    if (typeof updates.pricePerUnit === 'number') {
      cleanUpdates.pricePerUnit = Number(updates.pricePerUnit);
    }

    // Handle stock adjustments
    if (Array.isArray(updates.stockAdjustments)) {
      cleanUpdates.stockAdjustments = updates.stockAdjustments;
    }

    // Handle lastStockCheck
    if (typeof updates.lastStockCheck === 'number') {
      cleanUpdates.lastStockCheck = updates.lastStockCheck;
    }

    // Handle priceThreshold
    if (typeof updates.priceThreshold === 'number') {
      cleanUpdates.priceThreshold = updates.priceThreshold;
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