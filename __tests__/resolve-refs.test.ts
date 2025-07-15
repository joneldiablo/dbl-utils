
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

});

