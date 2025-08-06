import {
  normalize,
  slugify,
  timeChunks,
  sliceIntoChunks,
  splitAndFlat,
  evaluateColorSimilarity,
  randomS4,
  randomString,
  hash,
  LCG,
  delay,
  generateRandomColors
} from '../src/utils';

describe('utils', () => {
  test('normalize and slugify strings', () => {
    const text = 'Árbol de Navidad';
    expect(normalize(text)).toBe('arbol de navidad');
    expect(slugify(text)).toBe('arbol-de-navidad');
  });

  test('timeChunks generates intervals', () => {
    const result = timeChunks({ from: '2020-01-01', to: '2020-01-01T12:00:00', step: 6 });
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('from');
    expect(result[0]).toHaveProperty('to');
  });

  test('timeChunks validates input', () => {
    expect(() => timeChunks({ from: 'x', to: 'y', step: 0 })).toThrow();
  });

  test('sliceIntoChunks splits arrays', () => {
    const chunks = sliceIntoChunks([1, 2, 3, 4, 5], 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('splitAndFlat processes string arrays', () => {
    const result = splitAndFlat(['a b', 'b', false], ' ');
    expect(result).toEqual(['a', 'b']);
  });

  test('timeChunks respects day boundary', () => {
    const chunks = timeChunks({
      from: '2020-01-01T20:00:00',
      to: '2020-01-02T04:00:00',
      step: 8,
      boundary: 'day'
    });
    expect(chunks[0].to).toContain('2020-01-01');
  });

  test('evaluateColorSimilarity detects identical colors', () => {
    expect(evaluateColorSimilarity(['#fff', '#fff'])).toBe(1);
    expect(evaluateColorSimilarity(['#000', '#fff'])).toBeLessThan(1);
  });

  test('randomS4 generates 4 hex chars', () => {
    expect(randomS4()).toMatch(/^[a-f0-9]{4}$/);
  });

  test('generateRandomColors returns correct formats', () => {
    const hex = generateRandomColors(2); // default hex
    expect(hex).toHaveLength(2);
    expect(hex[0]).toMatch(/^#/);

    const rgb = generateRandomColors(1, { format: 'rgb' })[0] as number[];
    expect(rgb).toHaveLength(3);

    const nrgb = generateRandomColors(1, { format: 'nrgb' })[0] as number[];
    expect(nrgb[0]).toBeGreaterThanOrEqual(0);
    expect(nrgb[0]).toBeLessThanOrEqual(1);
  });

  test('randomString respects length and characters', () => {
    expect(randomString(5, 'a')).toBe('aaaaa');
  });

  test('hash produces deterministic value', () => {
    expect(hash('abc')).toBe(hash('abc'));
  });

  test('LCG generates values between 0 and 1', () => {
    const lcg = new LCG(123);
    const value = lcg.random();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  test('delay waits for timeout', async () => {
    jest.useFakeTimers();
    const spy = jest.fn();
    const promise = delay(100).then(spy);
    jest.advanceTimersByTime(100);
    await promise;
    expect(spy).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
