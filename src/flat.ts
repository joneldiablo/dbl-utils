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
 *
 * @example
 * ```ts
 * flatten({ a: { b: 1 } });
 * // => { 'a.b': 1 }
 * ```
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
 *
 * @example
 * ```ts
 * unflatten({ 'a.b': 1 });
 * // => { a: { b: 1 } }
 * ```
 */
export function unflatten(object: Record<string, any>, delimiter: string = '.'): object {
  if (typeof object !== 'object' || object === null) throw new Error('Input must be an object');

  // Determines if a string represents an integer value
  const isInteger = (key: string): boolean => /^\d+$/.test(key);

  // Recursively sets a value on the target based on the provided key path
  const setValue = (target: any, keys: string[], value: any): any => {
    if (keys.length === 0) return value;

    const [currentKey, ...rest] = keys;
    const keyIsInteger = isInteger(currentKey);
    const parsedKey = keyIsInteger ? parseInt(currentKey, 10) : currentKey;
    const nextShouldBeArray = rest.length > 0 && isInteger(rest[0]);

    if (rest.length === 0) {
      if (keyIsInteger) {
        if (!Array.isArray(target)) target = [];
        target[parsedKey] = value;
      } else {
        if (typeof target !== 'object' || target === null || Array.isArray(target)) target = {};
        target[parsedKey] = value;
      }
      return target;
    }

    if (keyIsInteger) {
      if (!Array.isArray(target)) target = [];
      target[parsedKey] = setValue(target[parsedKey] ?? (nextShouldBeArray ? [] : {}), rest, value);
    } else {
      if (typeof target !== 'object' || target === null || Array.isArray(target)) target = {};
      target[parsedKey] = setValue(target[parsedKey] ?? (nextShouldBeArray ? [] : {}), rest, value);
    }

    return target;
  };

  let result: any = Array.isArray(object) ? [] : {};
  Object.entries(object).forEach(([flatKey, value]) => {
    const keys = flatKey.split(delimiter);
    result = setValue(result, keys, value);
  });

  return result;
}

