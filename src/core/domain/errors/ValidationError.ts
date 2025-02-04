import { BaseError } from './BaseError';

export class ValidationError extends BaseError {
  constructor(
    message: string,
    public field?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ValidationError';
  }
}