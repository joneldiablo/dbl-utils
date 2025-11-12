# DBL-Utils Wishlist

Lista de mejoras y funcionalidades deseadas para futuras versiones de `dbl-utils`.

## 🎯 High Priority

### resolve-refs: Configuración Global

**Estado**: 💭 Propuesta  
**Descripción**: Implementar sistema de configuración global para `resolve-refs` que evite tener que pasar opciones en cada llamada.

**Implementación propuesta**:

```typescript
// Configuración global interna

const defaultConfig = {
  extraTasks: {},
  separator: "/",
  // Futuras opciones...
};

const config = Object.assign({}, defaultConfig);

// Función principal (sin cambios en la API actual)
function resolveRefs<T = any>(
  object: ResolvableValue,
  schema?: Record<string, any>,
  rules?: ResolveRefsRules,
  extraTasks?: ResolveRefsTasks
): T {
  // Usa config global + parámetros locales
  const finalTasks = { ...config.extraTasks, ...extraTasks };
  const finalSeparator = config.separator;
  // ... resto de la lógica
}

// Métodos de configuración
resolveRefs.setConfig = (conf = {}) => {
  deepMerge(config, conf);
};

resolveRefs.resetConfig = () => {
  Object.assign(config, defaultConfig);
};

resolveRefs.getConfig = () => ({ ...config });

export default resolveRefs;
```

**Ejemplos de uso**:

```typescript
import resolveRefs from "dbl-utils/src/resolve-refs";

// Configurar globalmente una vez
resolveRefs.setConfig({
  separator: ".",
  extraTasks: {
    uppercase: (str) => str.toUpperCase(),
    format: (template, ...args) =>
      template.replace(/{(\d+)}/g, (_, i) => args[i]),
  },
});

// Ahora todas las llamadas usan la configuración global
const config = { api: { url: "test.com", key: "secret" } };

// Usa separador "." automáticamente
const result1 = resolveRefs(
  {
    endpoint: "$api.url", // En vez de "$api/url"
    auth: "Bearer ${api.key}", // En vez de "Bearer ${api/key}"
    formatted: "$uppercase", // Usa extraTask global
  },
  config
);

// También se puede sobrescribir localmente si es necesario
const result2 = resolveRefs(obj, schema, rules, {
  localTask: () => "local override",
}); // Combina global + local
```

**Beneficios**:

- ✅ **DRY**: No repetir configuración en cada llamada
- ✅ **Retrocompatibilidad**: API actual sigue funcionando igual
- ✅ **Flexibilidad**: Permite sobrescribir configuración por llamada
- ✅ **Configuración centralizada**: Ideal para aplicaciones grandes
- ✅ **Mejor DX**: Menos boilerplate en el código

**Casos de uso**:

- Aplicaciones que siempre usan el mismo separador (ej. `.` para JavaScript-like paths)
- Proyectos con conjunto estándar de `extraTasks` reutilizables
- Configuración de herramientas/frameworks que envuelven `resolve-refs`

---

## 📋 Medium Priority

### resolve-refs: Sistema de Acciones con Caracteres Configurables

**Estado**: 💭 Propuesta Avanzada  
**Descripción**: Sistema flexible de acciones usando caracteres simples para evitar interferir con contenido JSON. Separadores y símbolos completamente configurables.

**Configuración propuesta**:
```typescript
resolveRefs.setConfig({
  // Símbolos configurables
  actionSymbol: '$',        // Símbolo principal (configurable)
  pathSeparator: '/',       // Separador de rutas
  paramSeparator: '|',      // Separador de parámetros de acciones
  
  // Mapeo de acciones (caracter -> función)
  actions: {
    '': 'reference',        // $path/to/value (acción por defecto)
    '?': 'conditional',     // $?condition|trueValue|falseValue
    '>': 'async',           // $>url o $>file
    '@': 'iterate',         // $@array|itemName
    '+': 'join',            // $+array|separator
    '!': 'ignore',          // $!path|fallback
    '#': 'if',              // $#condition|found|default
    '.': 'relative'         // $./path (ya existe)
  }
});
```

**Ejemplos de uso**:

```typescript
// Configuración personalizada
resolveRefs.setConfig({
  actionSymbol: '@',       // Cambiar $ por @
  pathSeparator: '.',      // Usar punto como separador
  paramSeparator: '::',    // Usar :: para parámetros
});

// Ahora se usaría así:
const obj = {
  // Referencias normales con separador punto
  endpoint: "@api.url",           // En vez de "$api/url"
  
  // Condicionales con parámetros separados por ::
  value: "@?config.exists::config.value::defaults.value",
  
  // Async con separador personalizado
  data: "@>https::api.com/config",
  
  // Iterate
  users: "@?users::user",
  
  // Join con parámetros
  names: "@+people.names:: and "
};
```

**Sintaxis Completa**:
```typescript
// Formato general: {actionSymbol}{action}{path}{paramSeparator}{param1}{paramSeparator}{param2}...

// Referencias básicas (acción vacía = referencia normal)
"$config/api/url"                    // Referencia normal
"@config.api.url"                    // Con símbolos personalizados

// Referencias condicionales
"$?config/exists|config/value|default/value"    // Si existe, sino fallback
"$?env=prod|prod/url|dev/url"                    // Condicional con comparación

// Referencias asíncronas  
"$>https://api.com/config"           // HTTP fetch
"$>./template.json"                  // Archivo local
"$?>./template.json|https://backup"  // Condicional async

// Operaciones de array
"$@users|user"                       // Iterate sobre array
"$+names|, "                         // Join array con separador
"$+users/names| and "                // Join nested array

// Operaciones seguras
"$!optional/path|fallback"           // Ignore con fallback
"$#condition|found|default"          // If con condición

// Relativas (ya existen)
"$./local/path"                      // Referencia relativa
"${./name} ${./surname}"             // Interpolación relativa
```

**Beneficios del sistema**:
- ✅ **No interfiere con JSON**: Solo caracteres especiales, no palabras
- ✅ **Totalmente configurable**: Cambiar cualquier símbolo
- ✅ **Extensible**: Fácil agregar nuevas acciones
- ✅ **Compacto**: Sintaxis muy concisa
- ✅ **Retrocompatible**: Configuración por defecto mantiene API actual
- ✅ **Separación clara**: `|` separa parámetros sin ambigüedad

**Casos de uso avanzados**:
```typescript
// Para aplicaciones que usan mucho $ en sus datos
resolveRefs.setConfig({ actionSymbol: '#' });
const data = {
  price: "$100.00",           // No interfiere, es contenido normal
  apiUrl: "#config.api.url"   // Esta sí es una referencia
};

// Para paths estilo JavaScript
resolveRefs.setConfig({ pathSeparator: '.' });
const config = {
  endpoint: "$app.services.api.url"  // Más natural para JS
};

// Para sistemas que ya usan | en contenido
resolveRefs.setConfig({ paramSeparator: '::' });
const obj = {
  conditional: "$?exists::value::default"
};
```

### resolve-refs: Caché de Referencias

**Estado**: 💭 Idea  
**Descripción**: Sistema de caché para evitar resolver las mismas referencias múltiples veces en objetos grandes.

```typescript
resolveRefs.setConfig({
  cache: true,
  cacheSize: 1000,
});
```

### resolve-refs: Modo Debug

**Estado**: 💭 Idea  
**Descripción**: Modo debug que muestre información sobre resolución de referencias.

```typescript
resolveRefs.setConfig({
  debug: true,
  logger: console.log,
});

// Mostraría:
// [resolve-refs] Resolving reference: $config/api/url -> "https://api.com"
// [resolve-refs] Template inheritance: userTemplate -> { name: "John", ... }
```

### i18n: Pluralización Automática

**Estado**: 💭 Idea  
**Descripción**: Sistema de pluralización automática en el módulo i18n.

```typescript
t("item", { count: 1 }); // "1 item"
t("item", { count: 5 }); // "5 items"
```

---

## 🔮 Future Ideas

### resolve-refs: Acciones Avanzadas Implementadas

**Estado**: 💭 Propuesta  
**Descripción**: Implementación de las acciones específicas usando el sistema de caracteres configurables.

#### Acciones Condicionales (`?`)
```typescript
const obj = {
  // Condicional simple: si existe path, usarlo, sino null
  value: "$?config/optional/value",
  
  // Con fallback: si no existe, usar alternativo  
  value2: "$?config/api/url|defaults/url",
  
  // Condicional con comparación
  env: "$?environment=production|prod/settings|dev/settings",
  
  // Múltiples condiciones anidadas
  complex: "$?user/role=admin|admin/config|?user/role=user|user/config|guest/config"
};
```

#### Acciones Asíncronas (`>`)
```typescript
const obj = {
  // Fetch HTTP
  remoteConfig: "$>https://api.com/config",
  
  // Archivo local (Node.js)
  localTemplate: "$>./templates/user.json",
  
  // Condicional + async: intenta local, sino remoto
  config: "$?>./local-config.json|https://api.com/fallback-config",
  
  // Con timeout y opciones
  api: "$>https://api.com/data|timeout:5000|headers:auth-token"
};

// Uso asíncrono
const result = await resolveRefsAsync(obj);
```

#### Acciones de Array (`@` y `+`)
```typescript
const data = {
  users: [{ name: "Alice" }, { name: "Bob" }],
  tags: ["react", "typescript", "utils"]
};

const template = {
  // Iterar sobre array aplicando template
  userList: "$@users|user",          // Cada item se llama 'user'
  
  // Join array con separador
  tagString: "$+tags|, ",             // "react, typescript, utils"
  
  // Join con formato personalizado
  userNames: "$+users/name| and ",    // "Alice and Bob"
  
  // Combinado: join después de iterar
  formatted: "$+{@users|user}| | "      // Itera y luego join con " | "
};
```

#### Acciones Seguras (`!` y `#`)
```typescript
const obj = {
  // Ignore: si no existe, usar fallback sin error
  optional: "$!config/missing/path|default-value",
  
  // If: condicional explícito
  status: "$#user/active|online|offline",
  
  // Combinando seguridad con condicionales
  display: "$!?user/avatar|user/avatar|default/avatar"
};
```

**Implementación de resolveRefsAsync**:
```typescript
// Nueva función para manejar acciones asíncronas
export async function resolveRefsAsync<T = any>(
  object: ResolvableValue,
  schema?: Record<string, any>,
  rules?: ResolveRefsRules,
  extraTasks?: ResolveRefsTasks
): Promise<T> {
  // Maneja acciones async como $>, $?>, etc.
}

// También como método de configuración
resolveRefs.async = resolveRefsAsync;
```

### utils: Tree Shaking Mejorado

**Estado**: 💭 Idea  
**Descripción**: Optimizar la librería para mejor tree shaking y bundles más pequeños.

### Performance: Lazy Loading

**Estado**: 💭 Idea  
**Descripción**: Carga lazy de módulos pesados para mejorar tiempo de inicialización.

---

## � Implementación Técnica

### Parser de Acciones
```typescript
interface ParsedAction {
  symbol: string;      // El símbolo de acción encontrado
  action: string;      // Nombre de la acción mapeada
  path: string;        // Path principal
  params: string[];    // Parámetros adicionales
}

function parseActionString(input: string, config: ResolveConfig): ParsedAction {
  const { actionSymbol, paramSeparator, actions } = config;
  
  if (!input.startsWith(actionSymbol)) return null;
  
  // Extraer acción: $?path|param -> action="?", rest="path|param"
  const actionChar = input[1] || '';
  const actionName = actions[actionChar] || 'reference';
  
  // Split por paramSeparator
  const parts = input.substring(actionChar ? 2 : 1).split(paramSeparator);
  const path = parts[0];
  const params = parts.slice(1);
  
  return { symbol: actionChar, action: actionName, path, params };
}
```

### Registro de Acciones
```typescript
const actionHandlers = {
  reference: (path: string, params: string[], context: ResolveContext) => {
    // Lógica actual de referencias
    return resolvePath(path, context);
  },
  
  conditional: (path: string, params: string[], context: ResolveContext) => {
    // $?condition|trueValue|falseValue
    const [truePath, falsePath] = params;
    const condition = resolvePath(path, context);
    return condition ? resolvePath(truePath, context) : resolvePath(falsePath, context);
  },
  
  async: async (path: string, params: string[], context: ResolveContext) => {
    // $>url o $>file
    if (path.startsWith('http')) {
      return await fetch(path).then(r => r.json());
    } else {
      return await import('fs').then(fs => fs.readFileSync(path, 'utf8'));
    }
  },
  
  iterate: (path: string, params: string[], context: ResolveContext) => {
    // $@array|itemName
    const [itemName] = params;
    const array = resolvePath(path, context);
    return array.map(item => {
      context.schema[itemName] = item;
      return resolveWithContext(context);
    });
  }
  
  // ... más acciones
};
```

### Configuración Extendida
```typescript
interface ResolveRefsConfig {
  // Símbolos configurables
  actionSymbol: string;
  pathSeparator: string;
  paramSeparator: string;
  
  // Mapeo de acciones
  actions: Record<string, string>;
  
  // Handlers personalizados
  actionHandlers: Record<string, ActionHandler>;
  
  // Opciones existentes
  extraTasks: ResolveRefsTasks;
  
  // Nuevas opciones
  async: boolean;
  cache: boolean;
  debug: boolean;
}

// API extendida
resolveRefs.setConfig(config);
resolveRefs.addAction(char, name, handler);
resolveRefs.removeAction(char);
resolveRefs.getActions();
```

---

## �📝 Notes

- **Prioridad**: High > Medium > Future
- **Estados**: 💭 Propuesta → 🚧 En desarrollo → ✅ Completado → ❌ Rechazado
- **Compatibilidad**: Todas las mejoras deben mantener retrocompatibilidad
- **Tests**: Cada nueva funcionalidad debe incluir tests comprehensivos

---

## 🤝 Contributing

¿Tienes ideas para agregar al wishlist?

1. Agrega tu propuesta a la sección correspondiente
2. Incluye ejemplos de uso
3. Describe beneficios y casos de uso
4. Considera impacto en retrocompatibilidad
