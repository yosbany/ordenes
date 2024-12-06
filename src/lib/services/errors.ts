export class DatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

export function isKnownError(error: unknown): error is Error {
  return error instanceof DatabaseError || error instanceof ValidationError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}