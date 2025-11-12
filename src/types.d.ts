declare module 'pluralize-es';

// Type definitions for resolve-refs module
export interface ResolveRefsRule extends Array<any> {
  0: string; // Task name
  [index: number]: any; // Additional arguments
}

export type ResolveRefsRules = Record<string, ResolveRefsRule>;

export type ResolveRefsTask = (...args: any[]) => any;

export type ResolveRefsTasks = Record<string, ResolveRefsTask>;

export interface ResolveRefsBuiltInTasks {
  /**
   * Iterates over an array and processes each item with a template
   * @param keyData - The array data to iterate over
   * @param itemName - The temporary variable name for each item
   */
  iterate: (keyData: any, itemName: string) => any[];
  
  /**
   * Joins array elements or concatenates values with a separator
   * @param first - First value (array or single value)
   * @param join - Separator string
   * @param next - Additional values to join
   */
  join: (first: any, join: string, ...next: any[]) => string;
  
  /**
   * Safe property lookup with fallback value
   * @param path - Path string starting with $
   * @param defaultValue - Fallback value if lookup fails
   */
  ignore: (path: string, defaultValue: any) => any;
  
  /**
   * Conditional resolution based on path existence
   * @param path - Path string to check
   * @param foundValue - Value to return if path exists
   * @param defaultValue - Value to return if path doesn't exist
   */
  if: (path: string, foundValue: any, defaultValue: any) => any;
}

export interface TemplateReference {
  ref: string;
  [key: string]: any;
}

export interface RelativeReferences {
  ".": Record<string, any>;
  [key: string]: any;
}

export type ResolvableValue = 
  | string // Direct reference like "$path/to/value" or interpolation "${path/to/value}"
  | TemplateReference // Object with ref property
  | RelativeReferences // Object with "." key for relative refs
  | Record<string, any> // Regular object
  | any[] // Array of resolvable values
  | any; // Primitive values

/**
 * Resolve references within objects and arrays using advanced reference resolution.
 * 
 * @param object - The source object or array containing references to resolve
 * @param schema - Schema object used as the base for global reference lookups
 * @param rules - Custom rule definitions for advanced reference processing
 * @param extraTasks - Additional custom task functions
 * @returns A new object with all references resolved
 */
export declare function resolveRefs<T = any>(
  object: ResolvableValue,
  schema?: Record<string, any>,
  rules?: ResolveRefsRules,
  extraTasks?: ResolveRefsTasks
): T;

