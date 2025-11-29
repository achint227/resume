// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress React 18 act() deprecation warning from @testing-library/react
const originalError = console.error;
console.error = (...args: unknown[]): void => {
  if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act')) {
    return;
  }
  originalError.call(console, ...args);
};
