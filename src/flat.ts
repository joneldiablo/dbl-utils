import { deepMerge } from "./object-mutation";
import { v4 as uuidv4 } from "uuid";

// Formatter functions by type
const FORMATTERS: Record<string, (v: string) => any> = {
  string: (v) => v,
  number: (v) => Number(v),
  boolean: (v) => v.toLowerCase() === "true",
};

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
export function flatten(
  object: object,
  options: FlatCopyOptions = {}
): Record<string, any> {
  if (options.delimiter === undefined) options.delimiter = ".";
  if (options.ommit === undefined) options.ommit = [];
  if (options.ommitArrays === undefined) options.ommitArrays = false;

  const newObject: Record<string, any> = {};
  if (typeof object !== "object" || object === null)
    throw new Error("Must be object");

  /**
   * Recursively flattens the object.
   *
   * @param element - Current element being processed
   * @param key - Current key in the object
   * @param index - Current index being constructed
   */
  const recursive = (
    element: any,
    key: string | undefined,
    index?: string
  ): void => {
    const newIndex = index ? [index, key].join(options.delimiter) : key;

    if (typeof element === "object" && element !== null) {
      const ommitedByFn =
        typeof options.ommitFn === "function" &&
        !!options.ommitFn(key!, element, newIndex!);

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
          Object.entries(element).forEach(([i, e]) =>
            recursive(e, i, newIndex)
          );
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
export function unflatten(
  object: Record<string, any>,
  delimiter: string = "."
): object {
  if (typeof object !== "object" || object === null)
    throw new Error("Input must be an object");

  const result: Record<string, any> = {};

  // Helper function to determine if a string is a valid integer
  const isInteger = (key: string): boolean => /^\d+$/.test(key);

  // Iterate over each key-value pair in the flattened object
  Object.keys(object).forEach((flatKey) => {
    const value = object[flatKey];
    const keys = flatKey.split(delimiter);
    let current = result;

    // Traverse the keys path
    keys.forEach((key, index) => {
      // Check if the key is a valid integer
      const keyIsInteger = isInteger(key);

      // Determine whether to create an array or an object
      const isLastKey = index === keys.length - 1;

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

/**
 * Converts a string into its original type (string, number, boolean).
 */
export function formatAs(
  value: string,
  type: string
): string | number | boolean {
  const format = FORMATTERS[type] ?? FORMATTERS.string;
  return format(value);
}

/**
 * Adds extra formatter functions to the internal registry.
 */
export const addFormatters = (
  extraFormatters: Record<string, (v: string) => any>
) => {
  Object.assign(FORMATTERS, extraFormatters);
  return true;
};

/**
 * Serializes an object or array of objects into a flat list of field entries.
 * You can customize the process using `before` (pre-processing per item)
 * and `after` (post-processing per field).
 */
export const serialize = async (
  data: any,
  opts: {
    before?: (
      element: any,
      index: number
    ) => Promise<Record<string, any> | null | false | undefined>;
    after?: (
      path: string,
      value: string | number | boolean,
      metaInfo: Record<string, any>
    ) => Promise<string | number | boolean | null | undefined>;
    metaIdentifier?: string;
    groupKey?: string;
  } = {}
) => {
  // Opciones por defecto
  opts = Object.assign(
    {
      metaIdentifier: "$",
      groupKey: "uuid",
    },
    opts
  );

  const serialized = (
    await Promise.all(
      [data]
        .flat()
        .map(async (rawLineContent: Record<string, any>, i: number) => {
          const lineContent = opts.before
            ? deepMerge(
                rawLineContent,
                (await opts.before(rawLineContent, i)) ?? {}
              )
            : rawLineContent;

          // Separar los metadatos
          const metaValues: Record<string, any> = {};
          Object.keys(lineContent).forEach((k) => {
            if (!k.startsWith(opts.metaIdentifier!)) return;
            metaValues[k.slice(opts.metaIdentifier!.length)] = lineContent[k];
            delete lineContent[k];
          });

          // ✅ Si no hay groupKey en los metadatos, generamos uno
          const groupKeyName = opts.groupKey!;
          metaValues[groupKeyName] = metaValues[groupKeyName] || uuidv4();

          const tmp = flatten(lineContent, { delimiter: "/" });

          return await Promise.all(
            Object.entries(tmp).map(async ([path, rawValue]) => {
              const cpMetaValues = { ...metaValues };
              const value: string | number | boolean | null | undefined =
                opts.after
                  ? await opts.after(path, rawValue, cpMetaValues)
                  : rawValue;

              const obj = ([null, undefined] as any).includes(value)
                ? false
                : {
                    path,
                    value: String(value),
                    type: typeof value,
                    [groupKeyName]: metaValues[groupKeyName], // ✅ siempre incluir groupKey
                    ...cpMetaValues,
                  };
              return obj;
            })
          );
        })
    )
  )
    .flat()
    .filter(Boolean);

  return serialized;
};

/**
 * Deserializes a flat list of entries into full objects.
 * Groups entries by a defined key (e.g. uuid or content_uuid) if present.
 * Optionally applies a `before` hook to each entry before processing.
 */
export const deserialize = async (
  serialized: Array<{
    path: string;
    value: string;
    type: string;
    [meta: string]: any;
  }>,
  opts: {
    before?: (entry: {
      path: string;
      value: string;
      type: string;
      [meta: string]: any;
    }) => Promise<Record<string, any> | null | false | undefined>;
    metaIdentifier?: string;
    groupKey?: string;
    metaObject?: boolean;
  } = {}
) => {
  opts = Object.assign(
    {
      metaIdentifier: "$",
      groupKey: "uuid",
      metaObject: false
    },
    opts
  );

  const grouped: Record<string, any> = {};

  for (const rawEntry of serialized) {
    const entry = opts.before
      ? deepMerge(rawEntry, (await opts.before(rawEntry)) ?? {})
      : rawEntry;

    const { path, value, type, ...meta } = entry;
    const formattedValue = formatAs(value, type);
    const groupId = meta[opts.groupKey!] ?? "__ungrouped__";

    grouped[groupId] = grouped[groupId] ?? {};

    const groupMeta = opts.metaObject
      ? (grouped[groupId][opts.metaIdentifier!] ??= {})
      : grouped[groupId];

    // Siempre guardar el groupKey
    const idKey = opts.metaObject
      ? opts.groupKey!
      : opts.metaIdentifier + opts.groupKey!;

    groupMeta[idKey] = groupMeta[idKey] ?? groupId;

    // Usamos Set para acumular metadatos
    Object.entries(meta).forEach(([key, rawVal]) => {
      let val;
      switch (true) {
        case rawVal === null:
          val = undefined;
          break;
        case typeof rawVal === "object" && rawVal instanceof Date:
          val = rawVal.toISOString();
          break;
        case typeof rawVal === "object":
          val = String(rawVal);
          break;
        default:
          val = rawVal;
          break;
      }

      const metaKey = opts.metaObject ? key : opts.metaIdentifier + key;
      const current = groupMeta[metaKey];

      if (!current) groupMeta[metaKey] = new Set([val]);
      else if (current instanceof Set) current.add(val);
      else groupMeta[metaKey] = new Set([current, val]);
    });

    grouped[groupId][path] = formattedValue;
  }

  // Limpieza final: convertir Set → único valor, array o eliminar
  for (const group of Object.values(grouped)) {
    const container = opts.metaObject ? group[opts.metaIdentifier!] : group;

    for (const [key, value] of Object.entries(container)) {
      if (value instanceof Set) {
        const arr = Array.from(value).filter(Boolean);
        if (arr.length === 0) delete container[key];
        else if (arr.length === 1) container[key] = arr[0];
        else container[key] = arr;
      }
    }
  }

  const deserialized = Object.values(grouped).map((flat) =>
    unflatten(flat, "/")
  );

  return deserialized;
};

