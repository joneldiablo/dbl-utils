/**
 * Type definition for the options parameter
 */
type FlatCopyOptions = {
  delimiter?: string;
  ommit?: string[];
  ommitArrays?: boolean;
  prefix?: string;
  ommitFn?: (key: string, value: any, newIndex: string) => boolean;
};

/**
 * Flattens an object into a single-level object with delimited keys.
 * 
 * @param object - The object to flatten
 * @param options - Configuration options for flattening
 * @returns A single-level object with flattened keys
 * @throws Will throw an error if the input is not an object
 */
export function flatten(object: object, options: FlatCopyOptions = {}): Record<string, any> {
  if (options.delimiter === undefined) options.delimiter = '.';
  if (options.ommit === undefined) options.ommit = [];
  if (options.ommitArrays === undefined) options.ommitArrays = false;

  const newObject: Record<string, any> = {};
  if (typeof object !== 'object' || object === null) throw new Error('Must be object');

  /**
   * Recursively flattens the object.
   * 
   * @param element - Current element being processed
   * @param key - Current key in the object
   * @param index - Current index being constructed
   */
  const recursive = (element: any, key: string | undefined, index?: string): void => {
    const newIndex = (index ? [index, key].join(options.delimiter) : key);

    if (typeof element === 'object' && element !== null) {
      const ommitedByFn = (typeof options.ommitFn === 'function') && !!options.ommitFn(key!, element, newIndex!);

      if (Array.isArray(element)) {
        if (options.ommitArrays || ommitedByFn) {
          newObject[newIndex!] = element;
        } else {
          element.forEach((e, i) => recursive(e, i.toString(), newIndex));
        }
      } else {
        if ((key && options.ommit?.includes(key)) || ommitedByFn) {
          newObject[newIndex!] = element;
        } else {
          Object.entries(element).forEach(([i, e]) => recursive(e, i, newIndex));
        }
      }
    } else {
      newObject[newIndex!] = element;
    }
  };

  recursive(object, options.prefix);
  return newObject;
}

/**
 * Reverts a flattened object back to its nested structure, with support for arrays.
 * 
 * @param object - The object to unflatten
 * @param delimiter - The delimiter used to flatten the object
 * @returns A nested object or array
 */
export function unflatten(object: Record<string, any>, delimiter: string = '.'): object {
  if (typeof object !== 'object' || object === null) throw new Error('Input must be an object');

  const result: Record<string, any> = {};

  // Helper function to determine if a string is a valid integer
  const isInteger = (key: string): boolean => /^\d+$/.test(key);

  // Iterate over each key-value pair in the flattened object
  Object.keys(object).forEach(flatKey => {
    const value = object[flatKey];
    const keys = flatKey.split(delimiter);
    let current = result;

    // Traverse the keys path
    keys.forEach((key, index) => {
      // Check if the key is a valid integer
      const keyIsInteger = isInteger(key);

      // Determine whether to create an array or an object
      const isLastKey = (index === keys.length - 1);

      if (keyIsInteger) {
        if (!Array.isArray(current)) {
          const parent = keys.slice(0, index - 1).reduce((acc, k) => {
            const kIsInteger = isInteger(k);
            return acc[kIsInteger ? parseInt(k) : k];
          }, result);
          parent[keys[index - 1]] = Object.values(current);
          current = parent[keys[index - 1]];
        }
        current[parseInt(key)] = {};
      } else if (!current[key]) {
        current[key] = {};
      }

      if (isLastKey) {
        current[keyIsInteger ? parseInt(key) : key] = value;
      } else {
        current = current[keyIsInteger ? parseInt(key) : key];
      }
    });
  });

  return result;
}

