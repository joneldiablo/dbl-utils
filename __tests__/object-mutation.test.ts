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

  test('deepMerge.setConfig applies custom fixer', () => {
    deepMerge.setConfig({ fix: () => ({ fixed: true }) });
    const result = deepMerge({}, { a: 1 });
    expect(result).toEqual({ fixed: true });
  });

  test('transformJson handles beforeFunc mutations', () => {
    const input = {
      a: { val: 1 },
      b: { val: 2 },
      c: { val: 3 },
    };
    const [copy] = transformJson(input, {
      beforeFunc: ({ key }) => {
        if (key === 'a') return { replace: { val: 10 } };
        if (key === 'b') return { merge: { extra: 5 } };
        if (key === 'c') return { delete: true };
      },
    });
    expect(copy).toEqual({ a: { val: 10 }, b: { val: 2, extra: 5 } });
  });

  test('transformJson filters keys using string, array and function', () => {
    let [copy, flat] = transformJson({ a: 1, b: 2, c: 3 }, { filter: 'a' });
    expect(copy).toEqual({ a: 1, b: 2, c: 3 });
    expect(flat).toBeUndefined();

    [copy, flat] = transformJson({ a: 1, b: 2, c: 3 }, { filter: ['b'] });
    expect(copy).toEqual({ a: 1, b: 2, c: 3 });
    expect(flat).toBeUndefined();

    [copy, flat] = transformJson(
      { a: 1, b: 2, c: 3 },
      { filter: ({ key }) => key !== 'c' }
    );
    expect(copy).toEqual({ a: 1, b: 2, c: 3 });
    expect(flat).toBeUndefined();
  });

  test('transformJson applies duringFunc mutations', () => {
    const input = {
      a: { x: 1 },
      b: { y: 2 },
      c: { z: 3 },
    };
    const [copy] = transformJson(input, {
      duringFunc: ({ key }) => {
        if (key === 'a') return { replace: { replaced: true } };
        if (key === 'b') return { merge: { extra: 5 } };
        if (key === 'c') return { delete: true };
      },
    });
    expect(copy).toEqual({ a: { replaced: true }, b: { y: 2, extra: 5 } });
  });

  test('transformJson applies nonObjectFunc mutations', () => {
    const input = { a: 1, b: 2, c: 3 };
    const [copy] = transformJson(input, {
      nonObjectFunc: ({ key }) => {
        if (key === 'a') return { replace: 10 };
        if (key === 'b') return { merge: 5 };
        if (key === 'c') return { delete: true };
      },
    });
    expect(copy).toEqual({ a: 10, b: 7 });
  });

  test('transformJson applies afterFunc mutations', () => {
    const input = {
      a: { val: 1 },
      b: { val: 2 },
      c: { val: 3 },
    };
    const [copy] = transformJson(input, {
      afterFunc: ({ key }) => {
        if (key === 'a') return { replace: { done: true } };
        if (key === 'b') return { merge: { extra: 4 } };
        if (key === 'c') return { delete: true };
      },
    });
    expect(copy).toEqual({ a: { done: true }, b: { val: 2, extra: 4 } });
  });
});
