import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, User } from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);

export interface AuthUser extends User {
  displayName: string | null;
  email: string | null;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user as AuthUser;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Error de autenticación: credenciales inválidas');
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Error al cerrar sesión');
  }
}