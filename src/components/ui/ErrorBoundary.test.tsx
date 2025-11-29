import * as fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { ErrorContext } from './ErrorBoundary';

/**
 * **Feature: codebase-refactor, Property 7: Error Context Propagation**
 * **Validates: Requirements 6.2**
 *
 * *For any* error caught by ErrorBoundary, the error object SHALL include
 * contextual information about where the error occurred (component name or operation type).
 */
describe('Property 7: Error Context Propagation', () => {
  // Suppress console.error during tests since we're testing error handling
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Component that throws an error when rendered
  const ThrowingComponent = ({ error }: { error: Error }) => {
    throw error;
  };

  it('should include componentName in error context for any provided component name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }),
        (componentName, errorMessage) => {
          let capturedContext: ErrorContext | null = null;

          const onError = (_error: Error, context: ErrorContext) => {
            capturedContext = context;
          };

          const testError = new Error(errorMessage);

          render(
            <ErrorBoundary componentName={componentName} onError={onError}>
              <ThrowingComponent error={testError} />
            </ErrorBoundary>
          );

          // Verify context was captured
          expect(capturedContext).not.toBeNull();
          expect(capturedContext!.componentName).toBe(componentName);
          expect(capturedContext!.timestamp).toBeInstanceOf(Date);
          expect(typeof capturedContext!.operationType).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always include operationType in error context', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage) => {
          let capturedContext: ErrorContext | null = null;

          const onError = (_error: Error, context: ErrorContext) => {
            capturedContext = context;
          };

          const testError = new Error(errorMessage);

          render(
            <ErrorBoundary componentName="TestComponent" onError={onError}>
              <ThrowingComponent error={testError} />
            </ErrorBoundary>
          );

          expect(capturedContext).not.toBeNull();
          expect(capturedContext!.operationType).toBeTruthy();
          expect(['network', 'render', 'state', 'validation', 'unknown']).toContain(
            capturedContext!.operationType
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize network-related errors correctly', () => {
    const networkKeywords = ['fetch', 'network', 'NetworkError', 'Failed to fetch'];

    fc.assert(
      fc.property(
        fc.constantFrom(...networkKeywords),
        (keyword) => {
          let capturedContext: ErrorContext | null = null;

          const onError = (_error: Error, context: ErrorContext) => {
            capturedContext = context;
          };

          const testError = new Error(`Error: ${keyword} failed`);

          render(
            <ErrorBoundary componentName="TestComponent" onError={onError}>
              <ThrowingComponent error={testError} />
            </ErrorBoundary>
          );

          expect(capturedContext).not.toBeNull();
          expect(capturedContext!.operationType).toBe('network');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize validation-related errors correctly', () => {
    const validationKeywords = ['validation', 'invalid', 'Validation failed', 'Invalid input'];

    fc.assert(
      fc.property(
        fc.constantFrom(...validationKeywords),
        (keyword) => {
          let capturedContext: ErrorContext | null = null;

          const onError = (_error: Error, context: ErrorContext) => {
            capturedContext = context;
          };

          const testError = new Error(`Error: ${keyword}`);

          render(
            <ErrorBoundary componentName="TestComponent" onError={onError}>
              <ThrowingComponent error={testError} />
            </ErrorBoundary>
          );

          expect(capturedContext).not.toBeNull();
          expect(capturedContext!.operationType).toBe('validation');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always include a timestamp in error context', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (componentName, errorMessage) => {
          let capturedContext: ErrorContext | null = null;
          const beforeTime = new Date();

          const onError = (_error: Error, context: ErrorContext) => {
            capturedContext = context;
          };

          const testError = new Error(errorMessage);

          render(
            <ErrorBoundary componentName={componentName} onError={onError}>
              <ThrowingComponent error={testError} />
            </ErrorBoundary>
          );

          const afterTime = new Date();

          expect(capturedContext).not.toBeNull();
          expect(capturedContext!.timestamp).toBeInstanceOf(Date);
          expect(capturedContext!.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
          expect(capturedContext!.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should default componentName to "Unknown" when not provided', () => {
    let capturedContext: ErrorContext | null = null;

    const onError = (_error: Error, context: ErrorContext) => {
      capturedContext = context;
    };

    const testError = new Error('Test error');

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent error={testError} />
      </ErrorBoundary>
    );

    expect(capturedContext).not.toBeNull();
    expect(capturedContext!.componentName).toBe('Unknown');
  });

  it('should call onError callback with error and context for any error', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage) => {
          let callbackCalled = false;
          let capturedError: Error | null = null;
          let capturedContext: ErrorContext | null = null;

          const onError = (error: Error, context: ErrorContext) => {
            callbackCalled = true;
            capturedError = error;
            capturedContext = context;
          };

          const testError = new Error(errorMessage);

          render(
            <ErrorBoundary componentName="TestComponent" onError={onError}>
              <ThrowingComponent error={testError} />
            </ErrorBoundary>
          );

          expect(callbackCalled).toBe(true);
          expect(capturedError).toBe(testError);
          expect(capturedContext).not.toBeNull();
          expect(capturedContext!.componentName).toBe('TestComponent');
        }
      ),
      { numRuns: 100 }
    );
  });
});
