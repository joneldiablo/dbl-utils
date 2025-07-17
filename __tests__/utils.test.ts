import { normalize, slugify, timeChunks } from '../src/utils';

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
});
