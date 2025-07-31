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
 *
 * @param object - The object to flatten
 * @param options - Configuration options for flattening
 * @returns A single-level object with flattened keys
 * @throws Will throw an error if the input is not an object
 *
 * @example
 * ```ts
 * const result = flatten({ a: { b: 1 } });
 * // result => { 'a.b': 1 }
 * ```
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
 * Reconstructs a nested object from a flattened one using a delimiter.
 * Numeric keys are automatically treated as array indices so arrays
 * are recreated correctly.
 *
 * @param object - The flattened object.
 * @param delimiter - The string delimiter used to split keys.
 * @returns The nested (unflattened) object.
 *
 * @example
 * ```ts
 * const obj = { 'a.0': 1, 'a.1': 2 };
 * unflatten(obj);
 * // => { a: [1, 2] }
 * ```
 */
export function unflatten(
  object: Record<string, any>,
  delimiter: string = "."
): Record<string, any> {
  if (typeof object !== "object" || object === null)
    throw new Error("Input must be an object");

  const result: Record<string, any> = {};

  const isInteger = (key: string): boolean => /^\d+$/.test(key);

  for (const flatKey of Object.keys(object)) {
    const value = object[flatKey];
    const keys = flatKey.split(delimiter);
    let current: any = result;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      const isLast = i === keys.length - 1;
      const keyIsIndex = isInteger(key);
      const nextIsIndex = isInteger(nextKey);

      // Convert key if it should be array index
      const realKey = keyIsIndex ? parseInt(key, 10) : key;

      // Handle last key (set value)
      if (isLast) {
        current[realKey] = value;
      } else {
        // Create container if needed
        if (current[realKey] === undefined) {
          current[realKey] = nextIsIndex ? [] : {};
        }

        // Move deeper
        current = current[realKey];
      }
    }
  }

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
 *
 * @example
 * ```ts
 * const data = { a: 1, b: { c: 2 } };
 * const entries = await serialize(data);
 * // entries[0] => { path: 'a', value: '1', type: 'number', uuid: '...' }
 * ```
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
  // Default options
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

          // Separate metadata fields
          const metaValues: Record<string, any> = {};
          Object.keys(lineContent).forEach((k) => {
            if (!k.startsWith(opts.metaIdentifier!)) return;
            metaValues[k.slice(opts.metaIdentifier!.length)] = lineContent[k];
            delete lineContent[k];
          });

          // Generate a groupKey if none is provided in metadata
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
                    [groupKeyName]: metaValues[groupKeyName], // always include groupKey
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
 *
 * @example
 * ```ts
 * const objects = await deserialize(entries);
 * // objects => [{ a: 1, b: { c: 2 } }]
 * ```
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
      metaObject: false,
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

    // Always store the groupKey
    const idKey = opts.metaObject
      ? opts.groupKey!
      : opts.metaIdentifier + opts.groupKey!;

    groupMeta[idKey] = groupMeta[idKey] ?? groupId;

    // Use Set to accumulate metadata
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

  // Final cleanup: convert Set → single value, array or remove
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
