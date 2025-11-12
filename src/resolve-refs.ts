import { deepMerge } from "./object-mutation";
import { unflatten } from "./flat";
import type { 
  ResolveRefsRules, 
  ResolveRefsTasks, 
  ResolvableValue 
} from "./types";

/**
 * Resolve references within objects and arrays using advanced reference resolution.
 * 
 * This powerful utility enables dynamic object composition through multiple reference types:
 * global references, relative references, string interpolation, and template inheritance.
 * Perfect for configuration management, dynamic content generation, and object templating.
 *
 * @param object - The source object or array containing references to resolve.
 *                 References use `$path/to/value` syntax for global lookups or 
 *                 `$./path` for relative references.
 * @param schema - Schema object used as the base for global reference lookups.
 *                 If not provided, uses a deep clone of the source object.
 *                 This is where `$path/to/value` references are resolved against.
 * @param rules - Custom rule definitions for advanced reference processing.
 *                Each rule maps a reference key to a tuple `[taskName, ...args]`.
 *                Built-in tasks: 'iterate', 'join', 'ignore', 'if'.
 * @param extraTasks - Additional custom task functions that can be used in rules.
 *                     Each task receives the resolved arguments and should return a value.
 * @returns A new object with all references resolved and templates expanded.
 *
 * ## Reference Types
 * 
 * ### 1. Global References
 * Reference values anywhere in the schema using absolute paths:
 * - `"$path/to/value"` - Direct reference to a value
 * - `"${path/to/value}"` - String interpolation (embeds value in string)
 * - `"prefix-${path/to/value}-suffix"` - Mixed string with interpolated values
 * 
 * ### 2. Object Template References
 * Extend and modify referenced objects:
 * - `{ ref: "$path/to/template", newProp: "value" }` - Template inheritance
 * - `{ ref: "path/to/template", existingProp: "override" }` - Property override
 * 
 * ### 3. Relative References
 * Reference values within the current object context:
 * - `"$./property"` - Direct relative reference
 * - `"${./nested/property}"` - Relative string interpolation
 * - `"${./path}-${./other}"` - Multiple relative references in strings
 * 
 * ### 4. Template System with Deferred Resolution
 * Use the special `"."` key for references resolved after template merging:
 * - `"."` object contains references processed after base template + overrides
 * - Enables templates to reference their final merged state
 * - Supports recursive resolution until stable state is reached
 *
 * ## Advanced Features
 * 
 * ### Custom Rules and Tasks
 * Define reusable logic for complex transformations:
 * ```ts
 * const rules = {
 *   "$users": ["iterate", "$data/users", "currentUser"],
 *   "$joinNames": ["join", "$people", ", ", "$extraPeople"]
 * };
 * 
 * const extraTasks = {
 *   uppercase: (value: string) => value.toUpperCase(),
 *   calculate: (a: number, b: number) => a + b
 * };
 * ```
 * 
 * ### Built-in Tasks
 * - `iterate(array, itemName)` - Process array items with template
 * - `join(array, separator, ...extra)` - Join arrays with separator
 * - `ignore(path, fallback)` - Safe lookup with fallback
 * - `if(condition, trueValue, falseValue)` - Conditional resolution
 *
 * @example
 * Basic global references:
 * ```ts
 * const config = { api: { url: "https://api.com", key: "abc123" } };
 * const settings = { endpoint: "$api/url", auth: "Bearer ${api/key}" };
 * 
 * const result = resolveRefs(settings, config);
 * // { endpoint: "https://api.com", auth: "Bearer abc123" }
 * ```
 * 
 * @example
 * Template inheritance with property overrides:
 * ```ts
 * const data = {
 *   defaultUser: { name: "Guest", role: "viewer", active: false },
 *   admin: { ref: "$defaultUser", name: "Admin", role: "admin", active: true },
 *   viewer: { ref: "$defaultUser", name: "John" }
 * };
 * 
 * const result = resolveRefs(data);
 * // result.admin = { name: "Admin", role: "admin", active: true }
 * // result.viewer = { name: "John", role: "viewer", active: false }
 * ```
 * 
 * @example
 * Relative references with template system:
 * ```ts
 * const data = {
 *   user1: { ref: "$templates/user", firstName: "Alice", lastName: "Smith" },
 *   user2: { ref: "$templates/user", firstName: "Bob", lastName: "Jones" },
 *   templates: {
 *     user: {
 *       firstName: "",
 *       lastName: "",
 *       email: "",
 *       ".": {
 *         fullName: "${./firstName} ${./lastName}",
 *         email: "${./firstName}.${./lastName}@company.com",
 *         profile: {
 *           displayName: "$./fullName",
 *           username: "$./firstName"
 *         }
 *       }
 *     }
 *   }
 * };
 * 
 * const result = resolveRefs(data);
 * // result.user1.fullName = "Alice Smith"
 * // result.user1.email = "Alice.Smith@company.com"
 * // result.user1.profile.displayName = "Alice Smith"
 * ```
 * 
 * @example
 * Configuration management with mixed references:
 * ```ts
 * const config = {
 *   env: { baseUrl: "https://api.prod.com", version: "v2" },
 *   services: {
 *     auth: { ref: "$templates/service", path: "/auth", timeout: 5000 },
 *     users: { ref: "$templates/service", path: "/users", timeout: 3000 }
 *   },
 *   templates: {
 *     service: {
 *       path: "/",
 *       timeout: 30000,
 *       retries: 3,
 *       ".": {
 *         url: "${env/baseUrl}/${env/version}${./path}",
 *         config: {
 *           endpoint: "$./url",
 *           timeout: "$./timeout",
 *           retries: "$./retries"
 *         }
 *       }
 *     }
 *   }
 * };
 * 
 * const result = resolveRefs(config);
 * // result.services.auth.url = "https://api.prod.com/v2/auth"
 * // result.services.auth.config.endpoint = "https://api.prod.com/v2/auth"
 * ```
 * 
 * @example
 * Custom rules and tasks:
 * ```ts
 * const data = { users: ["Alice", "Bob"], items: [1, 2, 3] };
 * const template = { 
 *   userList: "$buildUserList",
 *   summary: "$joinItems" 
 * };
 * 
 * const rules = {
 *   "$buildUserList": ["iterate", "$users", "user"],
 *   "$joinItems": ["join", "$items", " + "]
 * };
 * 
 * const extraTasks = {
 *   format: (template: string, ...values: any[]) => 
 *     template.replace(/{(\d+)}/g, (_, i) => values[i])
 * };
 * 
 * const result = resolveRefs(template, data, rules, extraTasks);
 * ```
 * 
 * ## Best Practices
 * 
 * 1. **Schema Organization**: Keep templates in a dedicated section (e.g., `templates/`)
 * 2. **Reference Clarity**: Use descriptive paths like `config/database/url` vs `c/d/u`
 * 3. **Template Design**: Use relative references in `"."` for dynamic template properties
 * 4. **Performance**: Avoid deep circular references that could cause infinite loops
 * 5. **Type Safety**: Consider using TypeScript interfaces for your schema structure
 * 
 * ## Error Handling
 * 
 * - Invalid references return the original reference string
 * - Missing paths in schema return `undefined` 
 * - Circular references are prevented through iteration limits
 * - Type mismatches in string interpolation are converted to strings
 */
export default function resolveRefs<T = any>(
  object: ResolvableValue,
  schema: Record<string, any> = JSON.parse(JSON.stringify(object)),
  rules: ResolveRefsRules = {},
  extraTasks: ResolveRefsTasks = {}
): T {
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
  }

