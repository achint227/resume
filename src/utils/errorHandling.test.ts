import * as fc from 'fast-check';
import {
  classifyError,
  createUserFriendlyMessage,
  calculateRetryDelay,
  RetryConfig,
} from './errorHandling';
import { ApiError, ApiErrorType } from '../types/api';

/**
 * **Feature: codebase-refactor, Property 6: Error Categorization Completeness**
 * **Validates: Requirements 6.1**
 *
 * *For any* error thrown during API operations, the error handling system SHALL
 * categorize it into exactly one of: 'network' (connection failures), 'validation'
 * (invalid data), 'server' (5xx responses), or 'unknown' (all other cases).
 */
describe('Property 6: Error Categorization Completeness', () => {
  const validErrorTypes: ApiErrorType[] = ['network', 'validation', 'server', 'unknown'];

  it('should categorize TypeError with network messages as network errors', () => {
    const networkMessages = ['Failed to fetch', 'fetch failed', 'NetworkError', 'network request failed'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...networkMessages),
        (message) => {
          const error = new TypeError(message);
          const result = classifyError(error);
          
          expect(result.type).toBe('network');
          expect(validErrorTypes).toContain(result.type);
          expect(result.message).toBeTruthy();
          expect(typeof result.message).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize 5xx status codes as server errors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 599 }),
        (statusCode) => {
          const response = new Response(null, { status: statusCode });
          const result = classifyError(response);
          
          expect(result.type).toBe('server');
          expect(validErrorTypes).toContain(result.type);
          expect(result.statusCode).toBe(statusCode);
          expect(result.message).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize 4xx status codes as validation errors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 400, max: 499 }),
        (statusCode) => {
          const response = new Response(null, { status: statusCode });
          const result = classifyError(response);
          
          expect(result.type).toBe('validation');
          expect(validErrorTypes).toContain(result.type);
          expect(result.statusCode).toBe(statusCode);
          expect(result.message).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize objects with 5xx status as server errors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 599 }),
        fc.string(),
        (statusCode, extraProp) => {
          const errorObj = { status: statusCode, extra: extraProp };
          const result = classifyError(errorObj);
          
          expect(result.type).toBe('server');
          expect(validErrorTypes).toContain(result.type);
          expect(result.statusCode).toBe(statusCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should categorize objects with 4xx status as validation errors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 400, max: 499 }),
        fc.string(),
        (statusCode, extraProp) => {
          const errorObj = { status: statusCode, message: extraProp };
          const result = classifyError(errorObj);
          
          expect(result.type).toBe('validation');
          expect(validErrorTypes).toContain(result.type);
          expect(result.statusCode).toBe(statusCode);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return a valid error type for various input types', () => {
    // Test with various simple input types instead of fc.anything()
    const testInputs = [
      null,
      undefined,
      42,
      'string error',
      true,
      false,
      [],
      {},
      { foo: 'bar' },
      new Error('test error'),
      new TypeError('type error'),
    ];
    
    for (const input of testInputs) {
      const result = classifyError(input);
      expect(validErrorTypes).toContain(result.type);
      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe('string');
    }
  });

  it('should categorize errors with validation messages as validation errors', () => {
    const validationMessages = ['validation failed', 'invalid input', 'required field missing'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...validationMessages),
        (message) => {
          const error = new Error(message);
          const result = classifyError(error);
          
          expect(result.type).toBe('validation');
          expect(validErrorTypes).toContain(result.type);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * **Feature: codebase-refactor, Property 9: Exponential Backoff Retry**
 * **Validates: Requirements 6.4**
 *
 * *For any* retryable operation with n retry attempts, the delay before attempt n
 * SHALL be greater than the delay before attempt n-1 (exponential growth pattern).
 */
describe('Property 9: Exponential Backoff Retry', () => {
  it('should produce monotonically increasing delays for consecutive attempts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 100, max: 5000 }),
        fc.integer({ min: 10000, max: 60000 }),
        (attempt, baseDelayMs, maxDelayMs) => {
          const config: RetryConfig = {
            maxAttempts: 5,
            baseDelayMs,
            maxDelayMs,
          };
          
          const delay1 = calculateRetryDelay(attempt, config);
          const delay2 = calculateRetryDelay(attempt + 1, config);
          
          expect(delay2).toBeGreaterThanOrEqual(delay1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never exceed maxDelayMs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 100, max: 5000 }),
        fc.integer({ min: 1000, max: 60000 }),
        (attempt, baseDelayMs, maxDelayMs) => {
          const config: RetryConfig = {
            maxAttempts: 5,
            baseDelayMs,
            maxDelayMs,
          };
          
          const delay = calculateRetryDelay(attempt, config);
          
          expect(delay).toBeLessThanOrEqual(maxDelayMs);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should start at baseDelayMs for attempt 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }),
        fc.integer({ min: 10000, max: 60000 }),
        (baseDelayMs, maxDelayMs) => {
          const config: RetryConfig = {
            maxAttempts: 5,
            baseDelayMs,
            maxDelayMs,
          };
          
          const delay = calculateRetryDelay(0, config);
          
          expect(delay).toBe(baseDelayMs);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should follow exponential formula: baseDelay * 2^attempt', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 100, max: 1000 }),
        fc.integer({ min: 100000, max: 200000 }),
        (attempt, baseDelayMs, maxDelayMs) => {
          const config: RetryConfig = {
            maxAttempts: 5,
            baseDelayMs,
            maxDelayMs,
          };
          
          const delay = calculateRetryDelay(attempt, config);
          const expectedDelay = baseDelayMs * Math.pow(2, attempt);
          
          expect(delay).toBe(Math.min(expectedDelay, maxDelayMs));
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: codebase-refactor, Property 8: User-Friendly Error Messages**
 * **Validates: Requirements 6.3**
 *
 * *For any* error displayed to users, the message SHALL be a human-readable string
 * without technical jargon (no stack traces, error codes, or internal identifiers
 * visible to users).
 */
describe('Property 8: User-Friendly Error Messages', () => {
  const technicalPatterns = [
    /Error:/i,
    /Exception/i,
    /stack/i,
    /at\s+\w+\s*\(/,
    /0x[0-9a-f]+/i,
    /undefined/i,
    /null/i,
    /NaN/i,
    /\[object\s+\w+\]/,
  ];

  it('should produce messages without technical jargon for all error types', () => {
    const errorTypes: ApiErrorType[] = ['network', 'validation', 'server', 'unknown'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...errorTypes),
        fc.integer({ min: 400, max: 599 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (type, statusCode, originalMessage) => {
          const apiError: ApiError = {
            type,
            message: originalMessage,
            statusCode,
            originalError: new Error(originalMessage),
          };
          
          const userMessage = createUserFriendlyMessage(apiError);
          
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);
          
          for (const pattern of technicalPatterns) {
            expect(userMessage).not.toMatch(pattern);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not expose original error messages to users', () => {
    const technicalMessages = [
      'Error: Something failed',
      'TypeError: Cannot read property',
      'Exception in thread main',
      'NetworkError when attempting to fetch',
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom('network', 'validation', 'server', 'unknown') as fc.Arbitrary<ApiErrorType>,
        fc.constantFrom(...technicalMessages),
        (type, technicalMessage) => {
          const apiError: ApiError = {
            type,
            message: technicalMessage,
            originalError: new Error(technicalMessage),
          };
          
          const userMessage = createUserFriendlyMessage(apiError);
          
          expect(userMessage).not.toContain(technicalMessage);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce properly formatted sentences', () => {
    const errorTypes: ApiErrorType[] = ['network', 'validation', 'server', 'unknown'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...errorTypes),
        (type) => {
          const apiError: ApiError = {
            type,
            message: 'Some technical error',
          };
          
          const userMessage = createUserFriendlyMessage(apiError);
          
          expect(userMessage).toMatch(/[.!?]$/);
          expect(userMessage[0]).toBe(userMessage[0].toUpperCase());
        }
      ),
      { numRuns: 100 }
    );
  });
});
