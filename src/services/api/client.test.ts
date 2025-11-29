import * as fc from 'fast-check';
import { ApiClient } from './client';
import { ApiError, ApiErrorType } from '../../types/api';

// Mock fetch globally
const originalFetch = global.fetch;

beforeEach(() => {
  // Reset fetch mock before each test
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

/**
 * **Feature: codebase-refactor, Property 1: API Error Standardization**
 * **Validates: Requirements 2.2**
 *
 * *For any* API error encountered by the ApiClient, the returned error object SHALL
 * contain a `type` field (one of: 'network', 'validation', 'server', 'unknown'),
 * a `message` field with a string description, and optionally an `originalError`
 * field preserving the original exception.
 */
describe('Property 1: API Error Standardization', () => {
  const validErrorTypes: ApiErrorType[] = ['network', 'validation', 'server', 'unknown'];
  
  it('should return standardized error with type, message for server errors (5xx)', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 5000 });
    
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 500, max: 599 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (statusCode, path) => {
          (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(null, { status: statusCode })
          );
          
          try {
            await client.get(`/${path}`);
            fail('Expected an error to be thrown');
          } catch (error) {
            const apiError = error as ApiError;
            
            // Must have a valid type
            expect(validErrorTypes).toContain(apiError.type);
            expect(apiError.type).toBe('server');
            
            // Must have a message string
            expect(typeof apiError.message).toBe('string');
            expect(apiError.message.length).toBeGreaterThan(0);
            
            // Should have statusCode for HTTP errors
            expect(apiError.statusCode).toBe(statusCode);
          }
        }
      ),
      { numRuns: 50 }
    );
  });


  it('should return standardized error with type, message for client errors (4xx)', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 5000 });
    
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 499 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (statusCode, path) => {
          (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(null, { status: statusCode })
          );
          
          try {
            await client.get(`/${path}`);
            fail('Expected an error to be thrown');
          } catch (error) {
            const apiError = error as ApiError;
            
            // Must have a valid type
            expect(validErrorTypes).toContain(apiError.type);
            expect(apiError.type).toBe('validation');
            
            // Must have a message string
            expect(typeof apiError.message).toBe('string');
            expect(apiError.message.length).toBeGreaterThan(0);
            
            // Should have statusCode for HTTP errors
            expect(apiError.statusCode).toBe(statusCode);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return standardized error with type, message for network errors', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 5000 });
    
    const networkErrors = [
      new TypeError('Failed to fetch'),
      new TypeError('NetworkError when attempting to fetch resource'),
      new TypeError('fetch failed'),
    ];
    
    for (const networkError of networkErrors) {
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);
      
      try {
        await client.get('/test');
        fail('Expected an error to be thrown');
      } catch (error) {
        const apiError = error as ApiError;
        
        // Must have a valid type
        expect(validErrorTypes).toContain(apiError.type);
        expect(apiError.type).toBe('network');
        
        // Must have a message string
        expect(typeof apiError.message).toBe('string');
        expect(apiError.message.length).toBeGreaterThan(0);
        
        // Should preserve original error
        expect(apiError.originalError).toBeDefined();
      }
    }
  });

  it('should always return error with required fields for any HTTP method', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 5000 });
    const methods = ['get', 'post', 'put', 'delete'] as const;
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...methods),
        fc.integer({ min: 400, max: 599 }),
        async (method, statusCode) => {
          (global.fetch as jest.Mock).mockResolvedValueOnce(
            new Response(null, { status: statusCode })
          );
          
          try {
            if (method === 'get' || method === 'delete') {
              await client[method]('/test');
            } else {
              await client[method]('/test', { data: 'test' });
            }
            fail('Expected an error to be thrown');
          } catch (error) {
            const apiError = error as ApiError;
            
            // Must have required fields
            expect(apiError).toHaveProperty('type');
            expect(apiError).toHaveProperty('message');
            expect(validErrorTypes).toContain(apiError.type);
            expect(typeof apiError.message).toBe('string');
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});


/**
 * **Feature: codebase-refactor, Property 2: Request Cancellation Support**
 * **Validates: Requirements 2.3**
 *
 * *For any* async API operation, when an AbortSignal is provided and subsequently
 * aborted, the operation SHALL reject with an AbortError and cease any pending
 * network activity.
 */
describe('Property 2: Request Cancellation Support', () => {
  it('should reject with network error when request is aborted', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 30000 });
    
    // Mock fetch to simulate a slow request that can be aborted
    (global.fetch as jest.Mock).mockImplementation(
      (_url: string, options: RequestInit) => {
        return new Promise((_, reject) => {
          const abortHandler = () => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          };
          
          if (options.signal?.aborted) {
            abortHandler();
          } else {
            options.signal?.addEventListener('abort', abortHandler);
          }
        });
      }
    );
    
    const controller = new AbortController();
    
    // Start the request
    const requestPromise = client.get('/test', controller.signal);
    
    // Abort immediately
    controller.abort();
    
    try {
      await requestPromise;
      fail('Expected an error to be thrown');
    } catch (error) {
      const apiError = error as ApiError;
      
      // Should be categorized as network error
      expect(apiError.type).toBe('network');
      expect(apiError.message).toBeTruthy();
    }
  });

  it('should support cancellation for all HTTP methods', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 30000 });
    const methods = ['get', 'post', 'put', 'delete'] as const;
    
    for (const method of methods) {
      // Mock fetch to simulate abort
      (global.fetch as jest.Mock).mockImplementation(
        (_url: string, options: RequestInit) => {
          return new Promise((_, reject) => {
            const abortHandler = () => {
              reject(new DOMException('The operation was aborted', 'AbortError'));
            };
            
            if (options.signal?.aborted) {
              abortHandler();
            } else {
              options.signal?.addEventListener('abort', abortHandler);
            }
          });
        }
      );
      
      const controller = new AbortController();
      
      let requestPromise: Promise<unknown>;
      if (method === 'get' || method === 'delete') {
        requestPromise = client[method]('/test', controller.signal);
      } else {
        requestPromise = client[method]('/test', { data: 'test' }, controller.signal);
      }
      
      controller.abort();
      
      try {
        await requestPromise;
        fail(`Expected ${method} to throw when aborted`);
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.type).toBe('network');
      }
    }
  });

  it('should not affect requests without abort signal', async () => {
    const client = new ApiClient({ baseUrl: 'http://test.com', timeout: 5000 });
    
    const mockData = { id: 1, name: 'test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    
    const response = await client.get('/test');
    
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockData);
  });
});
