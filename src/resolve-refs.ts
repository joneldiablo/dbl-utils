import { deepMerge } from "./object-mutation";
import { unflatten } from "./flat";

export default
  (object: any, schema = JSON.parse(JSON.stringify(object)), rules: Record<string, [string, ...any[]]> = {}, extraTasks: Record<string, Function> = {}): any => {
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
    const loop = (item: any): any => {
      if (item === null) return item;
      if (Array.isArray(item)) {
        return item.map(a => loop(a)).flat();
      } else if (typeof item === 'object') {
        let toReturn: Record<string, any> = {};
        if (item.ref) {
          const ref = item.ref;
          delete item.ref;
          const unflattened = unflatten(item, '/');
          const refObj = loop(ref);
          const modify = loop(unflattened);
          if (typeof refObj === 'string') toReturn = deepMerge({ ref: refObj }, modify);
          else toReturn = deepMerge({}, refObj, modify);
        } else {
          Object.keys(item).forEach(i => {
            toReturn[i] = loop(item[i])
          });
        }
        return toReturn;
      } else if (typeof item === 'string' && item[0] === '$') {
        const fixed = processRules(item);
        if (fixed !== undefined) return fixed;
        let keys = item.substring(1).split('/');
        // Obtiene el contenido de $path/to/element 
        let data;
        try {
          data = keys.reduce((obj, key) => obj[key], schema);
          data = JSON.parse(JSON.stringify(data));
        } catch (error) {
          return item;
        }
        return loop(data);
      } else return item;
    }
    return loop(JSON.parse(JSON.stringify(object)));
  }