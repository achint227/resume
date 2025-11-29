import * as fc from 'fast-check';
import { getConfigValue } from './config';

/**
 * **Feature: codebase-refactor, Property 10: Configuration Fallback Behavior**
 * **Validates: Requirements 7.4**
 * 
 * *For any* missing configuration value, the system SHALL use a predefined 
 * default value and log a warning message indicating which configuration was missing.
 */
describe('Configuration Fallback Behavior', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  /**
   * Property: For any default value and config name, when env value is undefined,
   * the function returns the default value and logs a warning
   */
  it('should return default value and log warning when env value is undefined', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // configName
        fc.string(),                   // defaultValue (string)
        (configName, defaultValue) => {
          consoleWarnSpy.mockClear();
          
          const result = getConfigValue(undefined, defaultValue, configName);
          
          // Should return the default value
          expect(result).toBe(defaultValue);
          
          // Should log a warning with the config name
          expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining(configName)
          );
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('missing')
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any default value and config name, when env value is empty string,
   * the function returns the default value and logs a warning
   */
  it('should return default value and log warning when env value is empty string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // configName
        fc.integer(),                  // defaultValue (number)
        (configName, defaultValue) => {
          consoleWarnSpy.mockClear();
          
          const result = getConfigValue('', defaultValue, configName);
          
          // Should return the default value
          expect(result).toBe(defaultValue);
          
          // Should log a warning
          expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining(configName)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any valid env value, when provided, the function returns
   * the env value (or parsed value) without logging a warning
   */
  it('should return env value without warning when value is provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // envValue (non-empty)
        fc.string(),                   // defaultValue
        fc.string({ minLength: 1 }),  // configName
        (envValue, defaultValue, configName) => {
          consoleWarnSpy.mockClear();
          
          const result = getConfigValue(envValue, defaultValue, configName);
          
          // Should return the env value
          expect(result).toBe(envValue);
          
          // Should NOT log a warning
          expect(consoleWarnSpy).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any numeric default and valid numeric string env value,
   * the parser should correctly parse and return the number
   */
  it('should correctly parse numeric env values with parser', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),  // numeric value
        fc.integer({ min: 0, max: 100000 }),  // defaultValue
        fc.string({ minLength: 1 }),          // configName
        (numericValue, defaultValue, configName) => {
          consoleWarnSpy.mockClear();
          
          const envValue = String(numericValue);
          const parser = (value: string) => parseInt(value, 10);
          
          const result = getConfigValue(envValue, defaultValue, configName, parser);
          
          // Should return the parsed numeric value
          expect(result).toBe(numericValue);
          
          // Should NOT log a warning
          expect(consoleWarnSpy).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any non-numeric string with a numeric parser,
   * the function should return the default and log a warning
   */
  it('should return default and warn when parser returns NaN', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => isNaN(parseInt(s, 10)) && s.length > 0),  // non-numeric string
        fc.integer({ min: 1000, max: 50000 }),  // defaultValue
        fc.string({ minLength: 1 }),            // configName
        (invalidValue, defaultValue, configName) => {
          consoleWarnSpy.mockClear();
          
          const parser = (value: string) => parseInt(value, 10);
          
          const result = getConfigValue(invalidValue, defaultValue, configName, parser);
          
          // Should return the default value
          expect(result).toBe(defaultValue);
          
          // Should log a warning about invalid value
          expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('invalid')
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
