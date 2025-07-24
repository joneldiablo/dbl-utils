import t, { addDictionary, setLang, addFormatDate, formatDate } from '../src/i18n';

describe('i18n utilities', () => {
  beforeEach(() => {
    addDictionary({ default: { hello: 'Hello' }, es: { hello: 'Hola' } });
  });

  test('translates text based on current language', () => {
    setLang('es');
    expect(t('hello')).toBe('Hola');
  });

  test('formatDate uses locale specific format', () => {
    addFormatDate({ es: 'DD/MM/YYYY' });
    setLang('es');
    expect(formatDate()).toBe('DD/MM/YYYY');
  });
});
