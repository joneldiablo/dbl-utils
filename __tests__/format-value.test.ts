import formatValue from '../src/format-value';
import numeral from 'numeral';
import { addDictionary, setLang } from '../src/i18n';

describe('formatValue', () => {
  beforeEach(() => {
    setLang('en');
    addDictionary({ default: { hello: 'Hello' } });
  });

  it('formats numbers', () => {
    const result = formatValue(1000, { format: 'number', formatConf: { minimumFractionDigits: 0 } });
    expect(result).toBe('1,000');
  });

  it('formats dictionary values', () => {
    const result = formatValue('hello', { format: 'dictionary' });
    expect(result).toBe('Hello');
  });

  it('formats numbers in compact form', () => {
    const localeSpy = jest.spyOn(numeral, 'locale');
    const result = formatValue(1500, { format: 'number-compact' });
    expect(localeSpy).toHaveBeenCalledWith('en');
    expect(result).toBe('1.50k');
  });

  it('formats currency using provided options', () => {
    const result = formatValue(1000, {
      format: 'currency',
      formatConf: { currency: 'USD', style: 'currency', minimumFractionDigits: 2 }
    });
    expect(result).toBe('$1,000.00');
  });

  it('throws when currency format configuration is invalid', () => {
    expect(() =>
      formatValue(10, { format: 'currency', formatConf: 'bad' as any })
    ).toThrow('currency format must have formatConf as an Intl.NumberFormatOptions');
  });

  it('formats dates and times', () => {
    const date = new Date('2024-01-02T03:04:05Z');
    expect(formatValue(date, { format: 'date', formatConf: 'YYYY-MM-DD' })).toBe('2024-01-02');
    expect(formatValue(date, { format: 'time', formatConf: 'HH:mm' })).toBe('03:04');
    expect(
      formatValue(date, { format: 'date-time', formatConf: 'YYYY-MM-DD HH:mm' })
    ).toBe('2024-01-02 03:04');
  });
});

