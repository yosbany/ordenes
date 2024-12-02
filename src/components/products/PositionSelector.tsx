import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SECTORS } from '@/config/constants';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getSectorFromOrder, getSequenceFromOrder, getSectorProducts } from '@/lib/order/utils';

interface PositionSelectorProps {
  product: Product;
  products: Product[];
  onMove: (direction: 'prev' | 'next') => void;
  disabled?: boolean;
}

export function PositionSelector({ product, products, onMove, disabled }: PositionSelectorProps) {
  const currentSector = getSectorFromOrder(product.order);
  const sectorProducts = getSectorProducts(products, currentSector);
  const currentIndex = sectorProducts.findIndex(p => p.id === product.id);
  
  const prevProduct = currentIndex > 0 ? sectorProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex < sectorProducts.length - 1 ? sectorProducts[currentIndex + 1] : null;

  const variants = {
    enter: (direction: 'prev' | 'next') => ({
      x: direction === 'next' ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'prev' | 'next') => ({
      x: direction === 'next' ? -300 : 300,
      opacity: 0
    })
  };

  const renderProduct = (p: Product | null, label: string) => (
    <div className={`
      p-4 rounded-lg border ${p ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 border-dashed'}
      ${p ? 'cursor-pointer transform transition hover:scale-105' : ''}
    `}>
      {p ? (
        <>
          <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
          <span className="block text-sm font-medium text-gray-900 truncate">{p.name}</span>
          <span className="block text-xs text-gray-500 mt-1">
            Posición {getSequenceFromOrder(p.order)}
          </span>
        </>
      ) : (
        <span className="block text-xs text-gray-400">Sin producto {label.toLowerCase()}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {SECTORS.find(s => s.code === currentSector)?.name}
        </span>
        <span className="text-sm text-gray-500">
          Posición {getSequenceFromOrder(product.order)} de {sectorProducts.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`prev-${prevProduct?.id || 'empty'}`}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            onClick={() => prevProduct && !disabled && onMove('prev')}
          >
            {renderProduct(prevProduct, "Anterior")}
          </motion.div>

          <motion.div
            key={`current-${product.id}`}
            className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4"
          >
            <span className="block text-xs font-medium text-blue-600 mb-1">Actual</span>
            <span className="block text-sm font-medium text-gray-900 truncate">{product.name}</span>
            <span className="block text-xs text-gray-500 mt-1">
              Posición {getSequenceFromOrder(product.order)}
            </span>
          </motion.div>

          <motion.div
            key={`next-${nextProduct?.id || 'empty'}`}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            onClick={() => nextProduct && !disabled && onMove('next')}
          >
            {renderProduct(nextProduct, "Siguiente")}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onMove('prev')}
          disabled={disabled || !prevProduct}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onMove('next')}
          disabled={disabled || !nextProduct}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}