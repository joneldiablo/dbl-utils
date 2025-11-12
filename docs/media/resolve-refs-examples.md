# Resolve-Refs: Real-World Examples

This file contains comprehensive examples showing how to use the `resolve-refs` utility in real-world scenarios.

## Table of Contents

1. [Multi-Environment Configuration](#multi-environment-configuration)
2. [Dynamic API Documentation](#dynamic-api-documentation)
3. [Component Template System](#component-template-system)
4. [Internationalization with Templates](#internationalization-with-templates)
5. [Database Configuration Management](#database-configuration-management)
6. [Feature Flag System](#feature-flag-system)
7. [Build Pipeline Configuration](#build-pipeline-configuration)
8. [E-commerce Product Catalog](#e-commerce-product-catalog)

## Multi-Environment Configuration

Manage different configurations across development, staging, and production environments.

```typescript
import resolveRefs from 'dbl-utils/src/resolve-refs';

const environmentConfig = {
  // Environment-specific variables
  environments: {
    development: {
      domain: "localhost",
      port: 3000,
      protocol: "http",
      debug: true,
      database: { host: "localhost", port: 5432 }
    },
    staging: {
      domain: "staging.myapp.com",
      port: 443,
      protocol: "https",
      debug: true,
      database: { host: "staging-db.myapp.com", port: 5432 }
    },
    production: {
      domain: "myapp.com",
      port: 443,
      protocol: "https",
      debug: false,
      database: { host: "prod-db.myapp.com", port: 5432 }
    }
  },
  
  // Current environment (would be set via ENV variable)
  currentEnv: "development",
  
  // Application configuration using templates
  app: {
    ref: "$templates/appConfig"
  },
  
  services: {
    api: { ref: "$templates/service", path: "/api/v1", timeout: 30000 },
    auth: { ref: "$templates/service", path: "/auth", timeout: 10000 },
    uploads: { ref: "$templates/service", path: "/uploads", timeout: 60000 }
  },
  
  templates: {
    // Base application configuration
    appConfig: {
      ".": {
        env: "$./currentEnv",
        baseUrl: "${environments/${./currentEnv}/protocol}://${environments/${./currentEnv}/domain}:${environments/${./currentEnv}/port}",
        apiUrl: "$./baseUrl/api/v1",
        debugMode: "${environments/${./currentEnv}/debug}",
        database: {
          connectionString: "postgresql://user:pass@${environments/${./currentEnv}/database/host}:${environments/${./currentEnv}/database/port}/myapp"
        }
      }
    },
    
    // Service configuration template
    service: {
      path: "/",
      timeout: 30000,
      retries: 3,
      ".": {
        url: "${app/baseUrl}${./path}",
        config: {
          baseURL: "$./url",
          timeout: "$./timeout",
          retries: "$./retries",
          headers: {
            "User-Agent": "MyApp/1.0",
            "X-Environment": "${app/env}"
          }
        }
      }
    }
  }
};

const config = resolveRefs(environmentConfig);

console.log(config.app.baseUrl); // "http://localhost:3000"
console.log(config.services.api.url); // "http://localhost:3000/api/v1"
console.log(config.app.database.connectionString); // "postgresql://user:pass@localhost:5432/myapp"
```

## Dynamic API Documentation

Generate API documentation with shared schemas and endpoint-specific overrides.

```typescript
const apiDocumentation = {
  // API metadata
  info: {
    title: "User Management API",
    version: "2.1.0",
    baseUrl: "https://api.example.com/v2"
  },
  
  // Reusable response schemas
  schemas: {
    User: {
      type: "object",
      properties: {
        id: { type: "integer", example: 123 },
        name: { type: "string", example: "John Doe" },
        email: { type: "string", example: "john@example.com" },
        createdAt: { type: "string", format: "date-time" }
      }
    },
    Error: {
      type: "object",
      properties: {
        code: { type: "integer" },
        message: { type: "string" },
        details: { type: "array", items: { type: "string" } }
      }
    }
  },
  
  // API endpoints using templates
  endpoints: {
    getUsers: {
      ref: "$templates/endpoint",
      method: "GET",
      path: "/users",
      description: "Retrieve a list of users",
      responses: {
        200: { ref: "$templates/successResponse", schema: "$schemas/User" }
      }
    },
    
    createUser: {
      ref: "$templates/endpoint", 
      method: "POST",
      path: "/users",
      description: "Create a new user",
      requestBody: { ref: "$schemas/User" },
      responses: {
        201: { ref: "$templates/successResponse", schema: "$schemas/User" },
        400: { ref: "$templates/errorResponse" }
      }
    },
    
    getUserById: {
      ref: "$templates/endpoint",
      method: "GET", 
      path: "/users/{id}",
      description: "Get user by ID",
      parameters: [
        { name: "id", in: "path", type: "integer", required: true }
      ],
      responses: {
        200: { ref: "$templates/successResponse", schema: "$schemas/User" },
        404: { ref: "$templates/errorResponse" }
      }
    }
  },
  
  templates: {
    endpoint: {
      method: "GET",
      path: "/",
      description: "",
      parameters: [],
      responses: {},
      ".": {
        operationId: "${./method}_${./path}",
        fullUrl: "${info/baseUrl}${./path}",
        summary: "${./description}",
        tags: ["${./path}" ],
        curl: "curl -X ${./method} \"${./fullUrl}\"",
        documentation: {
          method: "$./method",
          endpoint: "$./fullUrl",
          description: "$./description",
          parameters: "$./parameters",
          responses: "$./responses"
        }
      }
    },
    
    successResponse: {
      description: "Successful operation",
      ".": {
        content: {
          "application/json": {
            schema: "$./schema"
          }
        }
      }
    },
    
    errorResponse: {
      description: "Error occurred",
      ".": {
        content: {
          "application/json": {
            schema: "$schemas/Error"
          }
        }
      }
    }
  }
};

const docs = resolveRefs(apiDocumentation);

console.log(docs.endpoints.getUsers.fullUrl); // "https://api.example.com/v2/users"
console.log(docs.endpoints.createUser.curl); // "curl -X POST \"https://api.example.com/v2/users\""
```

## Component Template System

Create reusable UI component configurations with theme support.

```typescript
const componentSystem = {
  // Theme configuration
  themes: {
    light: {
      colors: {
        primary: "#007bff",
        secondary: "#6c757d", 
        success: "#28a745",
        danger: "#dc3545",
        background: "#ffffff",
        text: "#212529"
      },
      spacing: { small: "8px", medium: "16px", large: "24px" }
    },
    dark: {
      colors: {
        primary: "#0d6efd",
        secondary: "#6c757d",
        success: "#198754", 
        danger: "#dc3545",
        background: "#212529",
        text: "#ffffff"
      },
      spacing: { small: "8px", medium: "16px", large: "24px" }
    }
  },
  
  currentTheme: "light",
  
  // Component instances
  components: {
    primaryButton: {
      ref: "$templates/button",
      variant: "primary",
      size: "medium",
      text: "Click Me"
    },
    
    dangerButton: {
      ref: "$templates/button",
      variant: "danger", 
      size: "small",
      text: "Delete",
      icon: "trash"
    },
    
    loginForm: {
      ref: "$templates/form",
      title: "Login",
      fields: [
        { ref: "$templates/input", name: "email", type: "email", label: "Email" },
        { ref: "$templates/input", name: "password", type: "password", label: "Password" }
      ],
      submitButton: { ref: "$templates/button", variant: "primary", text: "Login" }
    }
  },
  
  templates: {
    button: {
      variant: "primary",
      size: "medium", 
      text: "Button",
      disabled: false,
      ".": {
        className: "btn btn-${./variant} btn-${./size}",
        style: {
          backgroundColor: "${themes/${../currentTheme}/colors/${./variant}}",
          color: "${themes/${../currentTheme}/colors/background}",
          padding: "${themes/${../currentTheme}/spacing/${./size}}",
          border: "1px solid ${themes/${../currentTheme}/colors/${./variant}}",
          borderRadius: "4px",
          cursor: "$./disabled ? 'not-allowed' : 'pointer'"
        },
        props: {
          type: "button",
          disabled: "$./disabled",
          className: "$./className",
          style: "$./style"
        },
        content: "$./text"
      }
    },
    
    input: {
      type: "text",
      name: "",
      label: "",
      required: false,
      ".": {
        id: "input_${./name}",
        className: "form-control",
        style: {
          padding: "${themes/${../currentTheme}/spacing/small}",
          border: "1px solid ${themes/${../currentTheme}/colors/secondary}",
          borderRadius: "4px",
          backgroundColor: "${themes/${../currentTheme}/colors/background}",
          color: "${themes/${../currentTheme}/colors/text}"
        },
        props: {
          id: "$./id",
          name: "$./name",
          type: "$./type",
          required: "$./required",
          className: "$./className",
          style: "$./style"
        },
        label: {
          htmlFor: "$./id",
          text: "$./label",
          style: {
            color: "${themes/${../currentTheme}/colors/text}",
            marginBottom: "${themes/${../currentTheme}/spacing/small}"
          }
        }
      }
    },
    
    form: {
      title: "",
      fields: [],
      ".": {
        className: "form",
        style: {
          backgroundColor: "${themes/${../currentTheme}/colors/background}",
          color: "${themes/${../currentTheme}/colors/text}",
          padding: "${themes/${../currentTheme}/spacing/large}",
          borderRadius: "8px"
        },
        header: {
          text: "$./title",
          style: {
            fontSize: "24px",
            marginBottom: "${themes/${../currentTheme}/spacing/medium}",
            color: "${themes/${../currentTheme}/colors/text}"
          }
        }
      }
    }
  }
};

const ui = resolveRefs(componentSystem);

console.log(ui.components.primaryButton.style.backgroundColor); // "#007bff"
console.log(ui.components.loginForm.className); // "form"
console.log(ui.components.loginForm.fields[0].label.text); // "Email"
```

## Feature Flag System

Manage feature flags with environment-specific overrides and complex conditions.

```typescript
const featureFlagConfig = {
  // Environment settings
  environment: {
    name: "production",
    region: "us-east-1",
    version: "2.1.0"
  },
  
  // User context (would come from authentication)
  user: {
    id: 12345,
    plan: "premium",
    betaTester: true,
    region: "us-east-1"
  },
  
  // Base feature definitions
  features: {
    newDashboard: {
      ref: "$templates/feature",
      name: "new_dashboard",
      description: "New user dashboard design",
      rolloutPercentage: 50,
      enabledForBeta: true,
      requiredPlan: "basic"
    },
    
    advancedAnalytics: {
      ref: "$templates/feature",
      name: "advanced_analytics", 
      description: "Advanced analytics features",
      rolloutPercentage: 25,
      enabledForBeta: false,
      requiredPlan: "premium",
      enabledRegions: ["us-east-1", "eu-west-1"]
    },
    
    experimentalAPI: {
      ref: "$templates/feature",
      name: "experimental_api",
      description: "Experimental API endpoints",
      rolloutPercentage: 0,
      enabledForBeta: true,
      requiredPlan: "enterprise",
      minVersion: "2.1.0"
    }
  },
  
  templates: {
    feature: {
      name: "",
      description: "",
      rolloutPercentage: 0,
      enabledForBeta: false,
      requiredPlan: "basic",
      enabledRegions: [],
      minVersion: "1.0.0",
      ".": {
        // Complex feature flag logic
        enabled: "$isFeatureEnabled",
        
        // Metadata for debugging
        metadata: {
          featureName: "$./name",
          description: "$./description",
          rolloutPercentage: "$./rolloutPercentage",
          userEligible: "$userMeetsRequirements",
          regionAllowed: "$regionCheck",
          versionCompatible: "$versionCheck",
          betaAccess: "$betaCheck"
        },
        
        // Configuration based on enablement
        config: {
          apiEndpoint: "/api/v1/features/${./name}",
          telemetryEnabled: "$./enabled",
          fallbackBehavior: "$./enabled ? 'new' : 'legacy'"
        }
      }
    }
  },
  
  // Custom rules for complex feature flag logic
  rules: {
    "$isFeatureEnabled": ["and", "$userMeetsRequirements", "$regionCheck", "$versionCheck", "$rolloutCheck"],
    "$userMeetsRequirements": ["planCheck", "$./requiredPlan"],
    "$regionCheck": ["regionCheck", "$./enabledRegions"],
    "$versionCheck": ["versionCheck", "$./minVersion"],
    "$rolloutCheck": ["rollout", "$./rolloutPercentage"],
    "$betaCheck": ["betaAccess", "$./enabledForBeta"]
  }
};

// Custom tasks for feature flag evaluation
const featureTasks = {
  and: (...conditions: boolean[]) => conditions.every(Boolean),
  
  planCheck: (requiredPlan: string) => {
    const planHierarchy = { basic: 1, premium: 2, enterprise: 3 };
    const userPlanLevel = planHierarchy[featureFlagConfig.user.plan as keyof typeof planHierarchy] || 0;
    const requiredLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0;
    return userPlanLevel >= requiredLevel;
  },
  
  regionCheck: (enabledRegions: string[]) => {
    if (enabledRegions.length === 0) return true; // No restrictions
    return enabledRegions.includes(featureFlagConfig.user.region);
  },
  
  versionCheck: (minVersion: string) => {
    const parseVersion = (v: string) => v.split('.').map(Number);
    const current = parseVersion(featureFlagConfig.environment.version);
    const required = parseVersion(minVersion);
    
    for (let i = 0; i < Math.max(current.length, required.length); i++) {
      const c = current[i] || 0;
      const r = required[i] || 0;
      if (c > r) return true;
      if (c < r) return false;
    }
    return true;
  },
  
  rollout: (percentage: number) => {
    const hash = featureFlagConfig.user.id % 100;
    return hash < percentage;
  },
  
  betaAccess: (enabledForBeta: boolean) => {
    return !enabledForBeta || featureFlagConfig.user.betaTester;
  }
};

const flags = resolveRefs(featureFlagConfig, undefined, featureFlagConfig.rules, featureTasks);

console.log(flags.features.newDashboard.enabled); // true/false based on conditions
console.log(flags.features.advancedAnalytics.metadata); // Debugging metadata
console.log(flags.features.experimentalAPI.config.fallbackBehavior); // "new" or "legacy"
```

## E-commerce Product Catalog

Create a flexible product catalog with variants, pricing tiers, and localization.

```typescript
const productCatalog = {
  // Pricing and locale settings
  settings: {
    currency: "USD",
    locale: "en-US", 
    taxRate: 0.08,
    currentSeason: "winter",
    membershipTier: "gold" // bronze, silver, gold, platinum
  },
  
  // Discount rules
  discounts: {
    seasonal: { winter: 0.15, spring: 0.1, summer: 0.05, fall: 0.1 },
    membership: { bronze: 0, silver: 0.05, gold: 0.1, platinum: 0.15 },
    bulk: { 5: 0.05, 10: 0.1, 20: 0.15 }
  },
  
  // Base product templates
  products: {
    laptop_macbook: {
      ref: "$templates/product",
      category: "electronics",
      name: "MacBook Pro",
      basePrice: 1999,
      variants: [
        { ref: "$templates/variant", name: "13-inch", price: 0, sku: "MBP13" },
        { ref: "$templates/variant", name: "16-inch", price: 500, sku: "MBP16" }
      ],
      specs: { processor: "M2", memory: "16GB", storage: "512GB" },
      seasonal: true
    },
    
    shirt_basic: {
      ref: "$templates/product", 
      category: "clothing",
      name: "Basic T-Shirt",
      basePrice: 25,
      variants: [
        { ref: "$templates/variant", name: "Small", price: 0, sku: "SHIRT-S" },
        { ref: "$templates/variant", name: "Medium", price: 0, sku: "SHIRT-M" },
        { ref: "$templates/variant", name: "Large", price: 2, sku: "SHIRT-L" },
        { ref: "$templates/variant", name: "XL", price: 4, sku: "SHIRT-XL" }
      ],
      colors: ["red", "blue", "white", "black"],
      seasonal: false
    }
  },
  
  templates: {
    product: {
      category: "",
      name: "",
      basePrice: 0,
      variants: [],
      seasonal: false,
      ".": {
        // Price calculations
        seasonalDiscount: "$./seasonal ? ${discounts/seasonal/${settings/currentSeason}} : 0",
        membershipDiscount: "${discounts/membership/${settings/membershipTier}}",
        totalDiscount: "${./seasonalDiscount} + ${./membershipDiscount}",
        discountedPrice: "${./basePrice} * (1 - ${./totalDiscount})",
        
        // Formatted display
        display: {
          name: "$./name",
          category: "$./category", 
          originalPrice: "$./basePrice",
          currentPrice: "$./discountedPrice",
          savings: "${./basePrice} - ${./discountedPrice}",
          discountPercent: "${./totalDiscount} * 100",
          
          // Localized pricing
          formatted: {
            originalPrice: "$formatCurrency",
            currentPrice: "$formatDiscountedPrice",
            savings: "$formatSavings"
          }
        },
        
        // SEO and metadata
        seo: {
          title: "${./name} - ${./category}",
          description: "${./name} starting at ${./display/formatted/currentPrice}",
          url: "/products/${./category}/${./name}",
          schema: {
            "@type": "Product",
            name: "$./name",
            category: "$./category",
            offers: {
              "@type": "Offer",
              price: "$./discountedPrice",
              priceCurrency: "${settings/currency}"
            }
          }
        }
      }
    },
    
    variant: {
      name: "",
      price: 0,
      sku: "",
      ".": {
        totalPrice: "${../basePrice} + ${./price}",
        discountedTotal: "${../discountedPrice} + ${./price}",
        display: {
          name: "${../name} - ${./name}",
          sku: "$./sku",
          price: "$./discountedTotal",
          formattedPrice: "$formatVariantPrice"
        }
      }
    }
  },
  
  // Custom formatting rules
  rules: {
    "$formatCurrency": ["formatMoney", "$./basePrice"],
    "$formatDiscountedPrice": ["formatMoney", "$./discountedPrice"], 
    "$formatSavings": ["formatMoney", "$./savings"],
    "$formatVariantPrice": ["formatMoney", "$./discountedTotal"]
  }
};

// Custom formatting tasks
const catalogTasks = {
  formatMoney: (amount: number) => {
    const { currency, locale } = productCatalog.settings;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};

const catalog = resolveRefs(productCatalog, undefined, productCatalog.rules, catalogTasks);

console.log(catalog.products.laptop_macbook.display.formatted.currentPrice); // "$1,499.25"
console.log(catalog.products.laptop_macbook.seo.title); // "MacBook Pro - electronics"
console.log(catalog.products.laptop_macbook.variants[0].display.formattedPrice); // "$1,499.25"
console.log(catalog.products.shirt_basic.display.discountPercent); // "10"
```

## Conclusion

These examples demonstrate the versatility and power of the `resolve-refs` utility:

- **Configuration Management**: Handle complex multi-environment setups
- **Template Systems**: Create reusable, extensible object templates
- **Dynamic Content**: Generate content based on context and conditions
- **Feature Flags**: Implement sophisticated feature flag logic
- **E-commerce**: Build flexible product catalogs with dynamic pricing
- **API Documentation**: Auto-generate consistent API documentation
- **UI Components**: Create theme-aware component systems

The key benefits include:

1. **DRY Principle**: Eliminate duplication through template inheritance
2. **Maintainability**: Centralize configuration and templates
3. **Flexibility**: Support for complex conditional logic
4. **Type Safety**: Full TypeScript support with custom interfaces
5. **Performance**: Efficient resolution with caching and cycle detection
6. **Extensibility**: Custom rules and tasks for domain-specific logic

Use these patterns as starting points for your own implementations, adapting them to your specific use cases and requirements.