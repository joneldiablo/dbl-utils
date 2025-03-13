import { deepMerge } from "./object-mutation";
import { unflatten } from "./flat";

interface Options {
  omit?: (item: any) => boolean;
  deep?: number;
  notFound?: any;
  rules?: Record<string, [string, ...any[]]>;
  extraTasks?: Record<string, (arg: any) => any>;
  delimiter: string;
}

export interface TaskFunctions {
  iterate?: (keyData: any, itemName: string) => any[];
  join?: (first: any, join: string, ...next: any[]) => string;
  ignore?: (d: string, def: any) => any;
  if?: (d: string, found: any, def: any) => any;
  [key: string]: Function | undefined;
}

/**
 * Processes rules to determine tasks for each item.
 * @param {string} key - The key to process rules for.
 * @param {any} schema - The schema to resolve data against.
 * @param {Options} opts - Configuration options including rules and extra tasks.
 * @returns {*} The processed data or undefined.
 */
const processRules = (key: string, schema: any, opts: Options): any => {
  if (!opts.rules || !opts.rules[key]) return undefined;

  const tasks: TaskFunctions = {
    iterate: (keyData: any, itemName: string): any[] => {
      const data = loop(keyData, schema, opts);
      if (!Array.isArray(data)) return [];

      const itemFound = key.substring(1).split(opts.delimiter)
        .reduce((obj, k) => obj[k], schema);

      const builded = data.map((item) => {
        schema[itemName] = item;
        return loop(itemFound, schema, opts);
      });

      delete schema[itemName];
      return builded;
    },
    join: (first: any, join: string, ...next: any[]): string => {
      const f = loop(first, schema, opts);
      if (Array.isArray(f)) return f.join(join);
      return [f, ...loop([join, ...next], schema, opts)].join('');
    },
    ignore: (d: string, def: any): any => {
      return d.substring(1).split(opts.delimiter)
        .reduce((obj, k) => obj[k], schema) || def;
    },
    if: (d: string, found: any, def: any): any => {
      return (d.substring(1).split(opts.delimiter)
        .reduce((obj, k) => obj[k], schema) && loop(found, schema, opts)) || def;
    },
    ...opts.extraTasks
  };

  const [task, ...attrs] = opts.rules[key];
  return typeof tasks[task] === 'function' ? tasks[task](...attrs) : undefined;
};

/**
 * Loop through an item and resolve references.
 * @param {*} item - The item to process.
 * @param {*} schema - The schema of the object.
 * @param {Options} opts - Configuration options.
 * @returns {*} The object with resolved references.
 */
const loop = (item: any, schema: any, opts: Options): any => {
  if (item === null) return item;

  if (typeof opts.omit === 'function' && opts.omit(item)) return item;

  if (Array.isArray(item)) {
    return item.map(a => loop(a, schema, opts)).flat();
  } else if (typeof item === 'object') {
    let mergedObject: any = {};

    if (item.ref) {
      const ref = item.ref;
      delete item.ref;
      const unflattened = unflatten(item, opts.delimiter);
      console.log(unflattened);
      const refObj = loop(ref, schema, opts);
      const modify = loop(unflattened, schema, opts);

      mergedObject = typeof refObj === 'string'
        ? deepMerge({ ref: refObj }, modify)
        : deepMerge({}, refObj, modify);

    } else {
      for (const key of Object.keys(item)) {
        mergedObject[key] = loop(item[key], schema, opts);
      }
    }

    return mergedObject;
  } else if (typeof item === 'string' && item[0] === '$') {
    const fixed = processRules(item, schema, opts);
    if (fixed !== undefined) return fixed;

    const orKeys = item.substring(1).split(opts.delimiter);;
    let data;

    for (const orKey of orKeys) {
      const keys = orKey.split(opts.delimiter);
      data = keys.reduce((obj, key) => {
        return obj ? obj[key] : undefined;
      }, schema);

      if (data !== undefined) break;
    }

    if (data === undefined) {
      return opts.notFound !== undefined ? opts.notFound : item;
    }

    if (data.constructor.name === 'Object') {
      data = JSON.parse(JSON.stringify(data));
    }

    const loopAgain = (typeof opts.deep === 'number' && opts.deep > 0) ? !!(--opts.deep) : true;
    return loopAgain ? loop(data, schema, opts) : data;
  } else {
    return item;
  }
}

/**
 * Resolves the references of an object.
 * @param {*} object - The object to process.
 * @param {*} schema - The schema of the object.
 * @param {Options} options - Configuration options.
 * @returns {*} The object with resolved references.
 */
const resolveRefs = (object: any, schema?: any, options: Partial<Options> = {}): any => {
  const opts: Options = {
    delimiter: options.delimiter || '/',
    omit: options.omit,
    notFound: options.notFound,
    deep: options.deep,
    rules: options.rules || {},
    extraTasks: options.extraTasks || {},
  };

  const clonedObject = JSON.parse(JSON.stringify(object));
  return loop(clonedObject, schema || clonedObject, opts);
};

export default resolveRefs;
