import { deepMerge } from "./object-mutation";
import { unflatten } from "./flat";

/**
 * Resolve `$` references within an object or array using a provided schema.
 *
 * References are resolved recursively allowing simple string lookups and
 * advanced operations defined by `rules`.
 *
 * @param object - Object or array containing `$path/to/value` references.
 * @param schema - Optional schema object used as the base for lookups.
 *   Defaults to a deep clone of `object`.
 * @param rules - Custom rule definitions used when a reference matches a rule
 *   key. Each rule maps to a tuple where the first element is the task name and
 *   the rest are arguments passed to that task.
 * @param extraTasks - Additional task implementations that can be referenced in
 *   `rules`.
 * @returns The object with all references resolved.
 *
 * ## Reference Types
 * 
 * ### Global References
 * - `"$path/to/value"` - Simple reference to a value in the schema
 * - `"${path/to/value}"` - String interpolation with reference
 * - `"prefix-${path/to/value}-suffix"` - Mixed string with reference
 * 
 * ### Object References with Modifications
 * - `{ ref: "$path/to/template", prop1: "newValue" }` - Extends the referenced object
 * 
 * ### Relative References (NEW)
 * - `"$./path/to/value"` - Reference relative to current object context
 * - `"${./path/to/value}"` - String interpolation with relative reference
 * - `"."` key - Contains relative references processed after object merge
 *
 * ## Template System with Relative References
 * 
 * The `"."` key in an object contains references that are resolved relative to the 
 * final merged object, enabling powerful template systems where templates can 
 * reference their own merged values.
 *
 * @example
 * Basic usage:
 * ```ts
 * const data = { values: { a: 1 } };
 * const obj = { num: "$values/a" };
 * const result = resolveRefs(obj, data);
 * console.log(result.num); // 1
 * ```
 * 
 * @example
 * String interpolation:
 * ```ts
 * const data = { user: { name: "John" }, config: { version: "v1" } };
 * const obj = { greeting: "Hello ${user/name}!", url: "${config/version}/api" };
 * const result = resolveRefs(obj, data);
 * console.log(result.greeting); // "Hello John!"
 * console.log(result.url); // "v1/api"
 * ```
 * 
 * @example
 * Template system with relative references:
 * ```ts
 * const data = {
 *   user1: { ref: "$templates/userTemplate", name: "Alice", age: 25 },
 *   user2: { ref: "$templates/userTemplate", name: "Bob", age: 30 },
 *   templates: {
 *     userTemplate: {
 *       name: "Default",
 *       age: 0,
 *       ".": {
 *         displayName: "User: ${./name}",
 *         description: "${./name} is ${./age} years old",
 *         profile: {
 *           username: "$./name",
 *           isAdult: "$./age" // This would need custom logic for boolean conversion
 *         }
 *       }
 *     }
 *   }
 * };
 * 
 * const result = resolveRefs(data);
 * console.log(result.user1.displayName); // "User: Alice"
 * console.log(result.user1.description); // "Alice is 25 years old"
 * console.log(result.user2.displayName); // "User: Bob"
 * ```
 * 
 * @example
 * Mixed global and relative references:
 * ```ts
 * const data = {
 *   config: { apiUrl: "https://api.example.com", version: "v1" },
 *   service: {
 *     ref: "$templates/serviceTemplate",
 *     endpoint: "/users",
 *     timeout: 5000
 *   },
 *   templates: {
 *     serviceTemplate: {
 *       endpoint: "/default",
 *       timeout: 3000,
 *       ".": {
 *         fullUrl: "${config/apiUrl}/${config/version}${./endpoint}",
 *         settings: {
 *           url: "$./fullUrl", // References another relative reference
 *           timeout: "$./timeout"
 *         }
 *       }
 *     }
 *   }
 * };
 * 
 * const result = resolveRefs(data);
 * console.log(result.service.fullUrl); // "https://api.example.com/v1/users"
 * console.log(result.service.settings.url); // "https://api.example.com/v1/users"
 * console.log(result.service.settings.timeout); // 5000
 * ```
 */
export default (
  object: any,
  schema = JSON.parse(JSON.stringify(object)),
  rules: Record<string, [string, ...any[]]> = {},
  extraTasks: Record<string, Function> = {}
): any => {
    const processRules = (key: string): any => {
      if (!rules[key]) return undefined;
      const tasks: Record<string, Function> = {
        iterate: (keyData: any, itemName: string) => {
          const data = loop(keyData);
          if (!Array.isArray(data)) return [];
          const itemFound = key.substring(1).split('/')
            .reduce((obj, key) => obj[key], schema);
          const builded = data.map((item) => {
            schema[itemName] = item;
            return loop(itemFound);
          });
          delete schema[itemName];
          return builded;
        },
        join: (first: any, join: string, ...next: any) => {
          const f = loop(first);
          if (Array.isArray(f)) return f.join(join);
          return [f, ...loop([join, next])].join('');
        },
        ignore: (d: string, def: any) => d.substring(1).split('/')
          .reduce((obj, key) => obj[key], schema) || def,
        if: (d: string, found: any, def: any) => (d.substring(1).split('/')
          .reduce((obj, key) => obj[key], schema) && loop(found)) || def,
        ...extraTasks
      }
      const [task, ...attrs] = rules[key];
      return tasks[task](...attrs);
    }
    const loop = (item: any, currentContext?: any, skipRelativeRefs = false): any => {
      if (item === null) return item;
      if (Array.isArray(item)) {
        return item.map(a => loop(a, currentContext, skipRelativeRefs)).flat();
      } else if (typeof item === 'object') {
        let toReturn: Record<string, any> = {};
        if (item.ref) {
          const ref = item.ref;
          delete item.ref;
          const unflattened = unflatten(item, '/');
          // Skip relative references when getting the template
          const refObj = loop(ref, currentContext, true);
          
          // First merge the reference object with modifications, excluding "." for now
          let baseObject = {};
          let relativeRefs = null;
          
          if (typeof refObj === 'object' && refObj !== null && refObj['.']) {
            // Extract relative references from the template
            relativeRefs = refObj['.'];
            baseObject = { ...refObj };
            delete (baseObject as any)['.'];
          } else {
            baseObject = refObj;
          }
          
          // Merge base object with modifications
          let mergedObject;
          if (typeof baseObject === 'string') {
            mergedObject = deepMerge({ ref: baseObject }, unflattened);
          } else {
            mergedObject = deepMerge({}, baseObject, unflattened);
          }
          
          // Now process relative references if they exist, using the merged object as context
          if (relativeRefs) {
            let processedRelativeRefs = loop(relativeRefs, mergedObject);
            // Keep processing relative references until no more changes are made
            let hasChanges = true;
            while (hasChanges) {
              const currentContext = deepMerge(mergedObject, processedRelativeRefs);
              const newProcessed = loop(processedRelativeRefs, currentContext);
              hasChanges = JSON.stringify(newProcessed) !== JSON.stringify(processedRelativeRefs);
              processedRelativeRefs = newProcessed;
            }
            toReturn = deepMerge(mergedObject, processedRelativeRefs);
          } else {
            toReturn = mergedObject;
          }
        } else {
          Object.keys(item).forEach(i => {
            if (i === '.' && !skipRelativeRefs) {
              // El objeto "." contiene referencias relativas al objeto actual
              // Necesitamos procesar primero el resto del objeto para tener el contexto completo
              Object.keys(item).forEach(j => {
                if (j !== '.') {
                  toReturn[j] = loop(item[j], currentContext, skipRelativeRefs);
                }
              });
              // Ahora procesamos las referencias relativas con el objeto ya construido
              const relativeRefs = loop(item[i], toReturn);
              toReturn = deepMerge(toReturn, relativeRefs);
            } else if (i !== '.' || skipRelativeRefs) {
              // Solo procesar si no es "." o si estamos saltando referencias relativas
              if (!item['.'] || skipRelativeRefs) {
                toReturn[i] = loop(item[i], currentContext, skipRelativeRefs);
              }
            }
          });
        }
        return toReturn;
      } else if (typeof item === 'string' && item[0] === '$' && item[1] !== '{') {
        const fixed = processRules(item);
        if (fixed !== undefined) return fixed;
        
        // Check for relative reference starting with $./
        if (item.startsWith('$./')) {
          if (!currentContext) return item; // No context available
          let keys = item.substring(3).split('/'); // Remove $./ prefix
          try {
            let data = keys.reduce((obj, key) => obj[key], currentContext);
            data = JSON.parse(JSON.stringify(data));
            return loop(data, currentContext, skipRelativeRefs);
          } catch (error) {
            return item;
          }
        }
        
        let keys = item.substring(1).split('/');
        // Get the content of $path/to/element
        let data;
        try {
          data = keys.reduce((obj, key) => obj[key], schema);
          data = JSON.parse(JSON.stringify(data));
        } catch (error) {
          return item;
        }
        return loop(data, currentContext, skipRelativeRefs);
      } else if (typeof item === 'string' && item.includes('${')) {
        // Replace all occurrences of ${some/path} within the string
        const pattern = /\$\{([^}]+?)\}/g; // Matches ${something/here}
        let result = item;

        result = result.replace(pattern, (match, path) => {
          try {
            // Check for relative reference starting with ./
            if (path.startsWith('./')) {
              if (!currentContext) return match; // No context available
              const keys = path.substring(2).split('/'); // Remove ./ prefix
              let data = keys.reduce((obj: any, key: string) => obj[key], currentContext);
              data = JSON.parse(JSON.stringify(data));
              const processed = loop(data, currentContext, skipRelativeRefs);
              return typeof processed === 'string' ? processed : JSON.stringify(processed);
            } else {
              // Regular global reference
              const keys = path.split('/');
              let data = keys.reduce((obj: any, key: string) => obj[key], schema);
              data = JSON.parse(JSON.stringify(data));
              const processed = loop(data, currentContext, skipRelativeRefs);
              return typeof processed === 'string' ? processed : JSON.stringify(processed);
            }
          } catch (err) {
            return match; // If lookup fails, keep the original
          }
        });

        return result;
      } else {
        return item;
      }
    }
    return loop(JSON.parse(JSON.stringify(object)));
  };

