type MutationFunction = (key: string, value: any, data: any) => any;

interface MergeOptions {
  mutation: MutationFunction;
  ommit?: string[];
  data?: any;
}

interface ConfigOptions {
  fix?: (target: any, source: any) => any;
}

interface TransformOptions {
  beforeFunc?: (context: Context) => any;
  duringFunc?: (context: Context) => any;
  afterFunc?: (context: Context) => any;
  nonObjectFunc?: (context: Context) => any;
  filter?: string | string[] | ((context: Context) => boolean);
  key?: string;
  root?: any;
}

interface Context {
  input: any;
  key: string | null;
  parentObj: any;
  parentKey: string | null;
  path: string;
}

let useConfig: ConfigOptions = {};

/**
 * Check if an item is a simple object.
 * @param item - The item to check.
 * @returns True if the item is an object, false otherwise.
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deeply merge objects into the target object.
 * @param target - The target object where to merge.
 * @param sources - The sources to be merged into the target.
 * @returns The merged target object.
 */
function effectiveDeepMerge(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  let fixValue;
  if (typeof useConfig.fix === 'function') {
    fixValue = useConfig.fix(target, source);
  }
  if (fixValue !== undefined) target = fixValue;
  else if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        effectiveDeepMerge(target[key], source[key]);
      } else if (typeof source[key] !== 'undefined') {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return effectiveDeepMerge(target, ...sources);
}

/**
 * Execute a mutation function on the object and merge results.
 * @param target - The target object to be merged with mutation.
 * @param options - Options for mutation, ommit keys and additional data.
 * @param parentKey - Internal tracking key for recursion.
 * @returns The mutated and merged target object.
 * @example
 * ```typescript
 * await mergeWithMutation({ user: {} }, {
 *   mutation: (key) => (key === 'user' ? { active: true } : undefined),
 * });
 * // => { user: { active: true } }
 * ```
 */
export async function mergeWithMutation(
  target: any,
  { mutation, ommit = [], data }: MergeOptions,
  parentKey = ''
): Promise<any> {
  for (const key in target) {
    if (!ommit.includes(key) && typeof target[key] === 'object') {
      const keyFixed = Array.isArray(target) ? parentKey + '.' + key : key;
      const mergeResult = await mutation(keyFixed, target[key], data);
      if (mergeResult) effectiveDeepMerge(target[key], mergeResult);
      await mergeWithMutation(target[key], { mutation, ommit, data }, key);
    }
  }
  return target;
}

/**
 * Deep merge multiple objects.
 * @param target - The target object where other objects will be merged.
 * @param sources - Other objects to be merged into the target.
 * @returns The merged object.
 * @example
 * ```typescript
 * deepMerge({ foo: 1 }, { bar: 2 });
 * // => { foo: 1, bar: 2 }
 * ```
 */
export function deepMerge(target: any, ...sources: any[]): any {
  const mergedObject = effectiveDeepMerge(target, ...sources);
  useConfig = {};
  return mergedObject;
}

/**
 * Configure deep merge behavior. Useful for setting a custom
 * fixer function before calling {@link deepMerge}.
 *
 * @param config - Configuration options.
 * @example
 * ```typescript
 * deepMerge.setConfig({ fix: () => ({ fixed: true }) });
 * deepMerge({}, { a: 1 });
 * // => { fixed: true }
 * ```
 */
deepMerge.setConfig = (config: ConfigOptions) => {
  useConfig = config;
};

/**
 * Transforms and flattens a JSON object.
 *
 * @param json - The JSON object to be transformed.
 * @param options - Options for the mutation functions.
 * @returns An array with the modified object and the flattened object.
 * @example
 * ```typescript
 * const [copy, flat] = transformJson({ a: { b: 1 } }, { filter: 'a' });
 * // copy => { a: { b: 1 } }
 * // flat => { a: 1 }
 * ```
 */
export function transformJson(json: any, options: TransformOptions = {}): [any, any] {
  const objCopy = JSON.parse(JSON.stringify(json));
  const flattenObj: Record<string, any> = {};

  const recursive = (
    obj: any,
    key: string | null = null,
    parentObj: any = null,
    parentKey: string | null = null,
    path: string = ''
  ) => {
    if (typeof options.beforeFunc === 'function') {
      const mutation = options.beforeFunc({ input: obj, key, parentObj, parentKey, path });
      if (mutation && typeof mutation === 'object') {
        if (mutation.replace) parentObj[key as string] = mutation.replace;
        else if (mutation.merge) deepMerge(obj, mutation.merge);
        else if (mutation.delete) delete parentObj[key as string];
      }
    }

    for (const innerKey in obj) {
      const value = obj[innerKey];
      const newPath = path ? `${path}.${innerKey}` : innerKey;
      if (typeof options.filter === 'string' && innerKey === options.filter) {
        flattenObj[newPath] = value;
        continue;
      } else if (Array.isArray(options.filter) && options.filter.includes(innerKey)) {
        flattenObj[newPath] = value;
        continue;
      } else if (
        typeof options.filter === 'function' &&
        !options.filter({ input: value, key: innerKey, parentObj: obj, parentKey: key, path: newPath })
      ) {
        flattenObj[newPath] = value;
        continue;
      }

      if (typeof value === 'object' && value !== null) {
        if (typeof options.duringFunc === 'function') {
          const mutation = options.duringFunc({ input: value, key: innerKey, parentObj: obj, parentKey: key, path: newPath });
          if (mutation && typeof mutation === 'object') {
            if (mutation.replace) obj[innerKey] = mutation.replace;
            else if (mutation.merge) obj[innerKey] = deepMerge(value, mutation.merge);
            else if (mutation.delete) { delete obj[innerKey]; continue; }
          }
        }
        recursive(value, innerKey, obj, key, newPath);
      } else {
        if (options.nonObjectFunc) {
          const mutation = options.nonObjectFunc({ input: value, key: innerKey, parentObj: obj, parentKey: key, path: newPath });
          if (mutation && typeof mutation === 'object') {
            if (mutation.replace) obj[innerKey] = mutation.replace;
            else if (mutation.merge) obj[innerKey] += mutation.merge;
            else if (mutation.delete) { delete obj[innerKey]; continue; }
          }
        }
        flattenObj[newPath] = value;
      }
    }

    if (typeof options.afterFunc === 'function') {
      const mutation = options.afterFunc({ input: obj, key, parentObj, parentKey, path });
      if (mutation && typeof mutation === 'object') {
        if (mutation.replace) parentObj[key as string] = mutation.replace;
        else if (mutation.merge) deepMerge(obj, mutation.merge);
        else if (mutation.delete) delete parentObj[key as string];
      }
    }
  };

  const rootKey = options.key || '_root';
  const rootObj: any = options.root || {};
  recursive(objCopy, rootKey, rootObj);
  return [objCopy, rootObj[rootKey]];
}
