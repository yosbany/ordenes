export * from './BaseError';
export * from './DatabaseError';
export * from './ValidationError';

export function isKnownError(error: unknown): error is Error {
  return error instanceof BaseError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}