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
});
