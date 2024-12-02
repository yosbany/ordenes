import { getAuth, User } from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);

export interface AuthUser extends User {
  displayName: string | null;
  email: string | null;
}

// Mock auth for demo environment
const mockSignIn = async (email: string, password: string) => {
  const fakeUser = {
    uid: 'demo-user',
    email: email,
    displayName: 'Demo User'
  };
  // @ts-ignore - We're mocking the user object
  auth.currentUser = fakeUser;
  return Promise.resolve({ user: fakeUser });
};

// Replace the real signIn with mock in demo environment
auth.signInWithEmailAndPassword = mockSignIn;