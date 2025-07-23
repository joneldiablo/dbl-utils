import formatValue from '../src/format-value';
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
});

