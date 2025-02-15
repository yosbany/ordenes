import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut, Menu, X, ChefHat, Calendar, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard, color: 'bg-blue-500' },
  { name: 'Proveedores', to: '/providers', icon: Users, color: 'bg-emerald-500' },
  { name: 'Productos', to: '/products', icon: Package, color: 'bg-purple-500' },
  { name: 'Recetas', to: '/recipes', icon: ChefHat, color: 'bg-amber-500' },
  { name: 'Órdenes', to: '/orders', icon: ShoppingCart, color: 'bg-indigo-500' },
  { name: 'Cronograma', to: '/schedule', icon: Calendar, color: 'bg-rose-500' },
  { name: 'Inventario', to: '/inventory', icon: ClipboardCheck, color: 'bg-teal-500' },
];

export function TopNav() {
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Get current route color
  const currentRoute = navigation.find(item => item.to === location.pathname);
  const currentColor = currentRoute?.color || 'bg-gray-100';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 mr-4 whitespace-nowrap">Gestión de Compras</h1>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden ml-2 p-2 rounded-md hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? `${item.color.replace('bg-', 'text-')} ${item.color.replace('bg-', 'bg-')}/10`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )
                }
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-base font-medium rounded-md w-full transition-colors',
                    isActive
                      ? `${item.color.replace('bg-', 'text-')} ${item.color.replace('bg-', 'bg-')}/10`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={() => signOut()}
              className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md w-full transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </nav>
        )}
      </div>

      {/* Colored bar indicating current section */}
      <div className={`h-1 ${currentColor}`} />
    </header>
  );
}