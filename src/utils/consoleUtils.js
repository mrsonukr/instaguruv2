// Console utility functions

/**
 * Clear browser console programmatically
 */
export const clearConsole = () => {
  try {
    // Method 1: Standard console.clear()
    if (typeof console !== 'undefined' && console.clear) {
      console.clear();
      return true;
    }
    
    // Method 2: Alternative for older browsers
    if (typeof console !== 'undefined' && console.log) {
      console.log('\x1Bc'); // ANSI escape sequence
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Could not clear console:', error);
    return false;
  }
};

