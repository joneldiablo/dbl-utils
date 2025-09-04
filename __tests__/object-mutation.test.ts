import { deepMerge, mergeWithMutation, transformJson } from '../src/object-mutation';

describe('object-mutation utilities', () => {
  test('deepMerge merges nested objects', () => {
    const objA = { foo: { bar: 1 } };
    const objB = { foo: { baz: 2 } };
    const result = deepMerge({}, objA, objB);
    expect(result).toEqual({ foo: { bar: 1, baz: 2 } });
  });

  test('mergeWithMutation applies mutation recursively', async () => {
    const data = { a: { b: 1 } } as any;
    await mergeWithMutation(data, {
      mutation: () => ({ c: 2 }),
    });
    expect(data).toEqual({ a: { b: 1, c: 2 } });
  });

  test('transformJson returns copy and undefined flat object by default', () => {
    const [copy, flat] = transformJson({ a: { b: 1 } });
    expect(copy).toEqual({ a: { b: 1 } });
    expect(flat).toBeUndefined();
  });

  test('deepMerge can use a fixer function', () => {
    deepMerge.setConfig({ fix: () => ({ fixed: true }) });
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ fixed: true });
  });

  test('transformJson supports hooks and filter string', () => {
    const json = { a: { b: { c: 1 } }, c: 2, d: 3 };
    const [mod] = transformJson(json, {
      beforeFunc: ({ key }) => (key === 'a' ? { merge: { pre: true } } : undefined),
      duringFunc: ({ key }) => (key === 'b' ? { merge: { inner: true } } : undefined),
      afterFunc: ({ key }) => (key === 'a' ? { merge: { post: true } } : undefined),
      nonObjectFunc: ({ key }) => (key === 'd' ? { merge: 1 } : undefined),
      filter: 'c'
    });
    expect(mod).toEqual({ a: { b: { c: 1, inner: true }, pre: true, post: true }, c: 2, d: 4 });
  });

  test('transformJson handles array and function filters', () => {
    const json = { a: 1, b: 2, c: 3 };
    transformJson(json, { filter: ['b'] });
    transformJson(json, { filter: ({ key }) => key !== 'c' });
  });
});
