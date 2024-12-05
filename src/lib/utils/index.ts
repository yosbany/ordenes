// Re-export all utility functions
export * from './formatting';
export * from './cn';
export * from './order';

// Re-export mergeClasses as cn for backward compatibility
export { mergeClasses as cn } from './cn';