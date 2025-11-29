/**
 * Configuration constants with environment variable fallbacks
 * Logs warnings when using default values
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_CONNECTION_TIMEOUT = 5000;
const DEFAULT_REQUEST_TIMEOUT = 30000;

/**
 * Helper function to get config value with fallback and warning
 */
function getConfigValue<T>(
  envValue: string | undefined,
  defaultValue: T,
  configName: string,
  parser?: (value: string) => T
): T {
  if (envValue === undefined || envValue === '') {
    console.warn(
      `Configuration "${configName}" is missing. Using default value: ${defaultValue}`
    );
    return defaultValue;
  }
  
  if (parser) {
    const parsed = parser(envValue);
    if (parsed === undefined || (typeof parsed === 'number' && isNaN(parsed))) {
      console.warn(
        `Configuration "${configName}" has invalid value "${envValue}". Using default value: ${defaultValue}`
      );
      return defaultValue;
    }
    return parsed;
  }
  
  return envValue as unknown as T;
}

/**
 * API base URL for backend communication
 * Reads from REACT_APP_API_BASE_URL environment variable
 */
export const API_BASE_URL: string = getConfigValue(
  process.env.REACT_APP_API_BASE_URL,
  DEFAULT_API_BASE_URL,
  'REACT_APP_API_BASE_URL'
);

/**
 * Connection timeout in milliseconds for health checks
 * Reads from REACT_APP_CONNECTION_TIMEOUT environment variable
 */
export const CONNECTION_TIMEOUT: number = getConfigValue(
  process.env.REACT_APP_CONNECTION_TIMEOUT,
  DEFAULT_CONNECTION_TIMEOUT,
  'REACT_APP_CONNECTION_TIMEOUT',
  (value) => parseInt(value, 10)
);

/**
 * Request timeout in milliseconds for API calls
 * Reads from REACT_APP_REQUEST_TIMEOUT environment variable
 */
export const REQUEST_TIMEOUT: number = getConfigValue(
  process.env.REACT_APP_REQUEST_TIMEOUT,
  DEFAULT_REQUEST_TIMEOUT,
  'REACT_APP_REQUEST_TIMEOUT',
  (value) => parseInt(value, 10)
);

// Export the helper for testing purposes
export { getConfigValue };
