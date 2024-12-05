import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, User } from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);

export interface AuthUser extends User {
  displayName: string | null;
  email: string | null;
}

export async function signIn(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user as AuthUser;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}