import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signIn, signOut, AuthUser } from '@/lib/firebase/auth';
import { validateConfig } from '@/lib/firebase/validation';
import { isDemoMode } from '@/lib/firebase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user as AuthUser);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthError(error instanceof Error ? error : new Error('Error de autenticación'));
      setLoading(false);
    }
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    if (isDemoMode) {
      toast.error('Autenticación no disponible en modo demo');
      return;
    }

    try {
      await signIn(email, password);
      toast.success('¡Bienvenido!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Credenciales inválidas');
      throw error;
    }
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      toast.error('Cierre de sesión no disponible en modo demo');
      return;
    }

    try {
      await signOut();
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  // Show error message if Firebase failed to initialize
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error de Inicialización</h2>
          <p className="text-gray-600">
            No se pudo inicializar la aplicación. Por favor, verifique la configuración e intente nuevamente.
          </p>
          {isDemoMode && (
            <p className="mt-4 text-sm text-amber-600">
              Ejecutando en modo demo. Algunas funciones estarán limitadas.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        isDemoMode
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}