
import resolveRefs from '../src/resolve-refs';


describe('TEST resolveRefs', () => {

  const data = {
    values: {
      value1: 1,
      value2: 2,
      value3: 3
    }
  }

  beforeAll(async () => {

  });

  beforeEach(() => {

  });

  afterAll(async () => {

  });

  test('Resolve references from object', () => {
    const result = resolveRefs({
      valueOne: "$values/value1",
      valueTwo: "$values/value2",
      valueThree: "$values/value3"
    }, data);
    expect(result.valueOne).toEqual(data.values.value1);
    expect(result.valueTwo).toEqual(data.values.value2);
    expect(result.valueThree).toEqual(data.values.value3);
  });

  test('Resolve references from array', () => {
    const result = resolveRefs([
      "$values/value1",
      "$values/value2",
      "$values/value3"
    ], data);
    expect(result[0]).toEqual(data.values.value1);
    expect(result[1]).toEqual(data.values.value2);
    expect(result[2]).toEqual(data.values.value3);
  });

  test('Resolve embedded references in strings using ${...}', () => {
    const result = resolveRefs({
      greeting: "Hola ${values/value1}, cómo estás?",
      complex: "Suma: ${values/value1} + ${values/value2} = ${values/value3}"
    }, data);
    expect(result.greeting).toEqual(`Hola ${data.values.value1}, cómo estás?`);
    expect(result.complex).toEqual(`Suma: ${data.values.value1} + ${data.values.value2} = ${data.values.value3}`);
  });

  test('Resolve references expanding object and replace value', () => {
    const result = resolveRefs({
      ref: "$values",
      extra: 5,
      value3: 80
    }, data);
    expect(result.value1).toEqual(data.values.value1);
    expect(result.value2).toEqual(data.values.value2);
    expect(result.value3).toEqual(80);
    expect(result.extra).toEqual(5);
  });

  test('Resolve relative references with $./ syntax', () => {
    const testData = {
      obj1: {
        ref: "$definitions/template",
        var1: "xxxx",
        var2: "0000"
      },
      obj2: {
        ref: "$definitions/template",
        var1: "yyyyyy", 
        var2: "111111"
      },
      definitions: {
        template: {
          var1: "zzzzz",
          var2: "33333",
          ".": {
            valueVar1: "$./var1",
            objExtra: {
              otrasCosas: ["$./var2"]
            }
          }
        }
      }
    };

    const result = resolveRefs(testData);
    
    expect(result.obj1.valueVar1).toEqual("xxxx");
    expect(result.obj1.objExtra.otrasCosas[0]).toEqual("0000");
    expect(result.obj2.valueVar1).toEqual("yyyyyy");
    expect(result.obj2.objExtra.otrasCosas[0]).toEqual("111111");
  });

  test('Resolve relative references with ${./} syntax in strings', () => {
    const testData = {
      obj1: {
        ref: "$definitions/template",
        name: "Juan",
        age: 25
      },
      definitions: {
        template: {
          name: "Default",
          age: 0,
          ".": {
            greeting: "Hola ${./name}, tienes ${./age} años",
            summary: "Usuario: ${./name} (${./age})"
          }
        }
      }
    };

    const result = resolveRefs(testData);
    
    expect(result.obj1.greeting).toEqual("Hola Juan, tienes 25 años");
    expect(result.obj1.summary).toEqual("Usuario: Juan (25)");
  });

  test('Resolve nested relative references', () => {
    const testData = {
      user: {
        ref: "$templates/userTemplate",
        personal: {
          firstName: "Carlos",
          lastName: "Pérez"
        },
        contact: {
          email: "carlos@example.com"
        }
      },
      templates: {
        userTemplate: {
          personal: {
            firstName: "Default",
            lastName: "User"
          },
          contact: {
            email: "default@example.com"
          },
          ".": {
            fullName: "${./personal/firstName} ${./personal/lastName}",
            profile: {
              displayName: "$./personal/firstName",
              contactInfo: "$./contact/email"
            }
          }
        }
      }
    };

    const result = resolveRefs(testData);
    
    expect(result.user.fullName).toEqual("Carlos Pérez");
    expect(result.user.profile.displayName).toEqual("Carlos");
    expect(result.user.profile.contactInfo).toEqual("carlos@example.com");
  });

  test('Mixed global and relative references', () => {
    const testData = {
      config: {
        baseUrl: "https://api.example.com",
        version: "v1"
      },
      services: {
        ref: "$templates/serviceTemplate",
        endpoint: "/users",
        timeout: 5000
      },
      templates: {
        serviceTemplate: {
          endpoint: "/default",
          timeout: 3000,
          ".": {
            fullUrl: "${config/baseUrl}/${config/version}${./endpoint}",
            settings: {
              url: "$./fullUrl",
              timeout: "$./timeout"
            }
          }
        }
      }
    };

    const result = resolveRefs(testData);
    
    expect(result.services.fullUrl).toEqual("https://api.example.com/v1/users");
    expect(result.services.settings.url).toEqual("https://api.example.com/v1/users");
    expect(result.services.settings.timeout).toEqual(5000);
  });

  test('Relative references with arrays', () => {
    const testData = {
      product: {
        ref: "$templates/productTemplate",
        items: ["item1", "item2", "item3"],
        category: "electronics"
      },
      templates: {
        productTemplate: {
          items: [],
          category: "default",
          ".": {
            itemCount: "$./items/length",
            summary: {
              category: "$./category",
              firstItem: "$./items/0",
              allItems: "$./items"
            }
          }
        }
      }
    };

    const result = resolveRefs(testData);
    
    expect(result.product.summary.category).toEqual("electronics");
    expect(result.product.summary.firstItem).toEqual("item1");
    expect(result.product.summary.allItems).toEqual(["item1", "item2", "item3"]);
  });

});

