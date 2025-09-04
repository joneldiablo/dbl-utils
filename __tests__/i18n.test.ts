import t, {
  addDictionary,
  setLang,
  addFormatDate,
  formatDate,
  trackingTexts,
  getTexts,
  addFormatNumberCompact,
  formatNumberCompact,
  addTasks,
  removeTask,
  addFormatTime,
  formatTime,
  addFormatDateTime,
  formatDateTime,
  addFormatNumber,
  formatNumber,
  addFormatCurrency,
  formatCurrency,
  getLang
} from '../src/i18n';

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

  test('trackingTexts collects keys', () => {
    trackingTexts(true);
    t('hello');
    trackingTexts(false);
    expect(getTexts()).toContain('hello');
  });

  test('formatNumberCompact uses language specific config', () => {
    addFormatNumberCompact({ es: '0a' });
    setLang('es');
    expect(formatNumberCompact()).toBe('0a');
  });

  test('addTasks executes on language change and can be removed', () => {
    const spy = jest.fn();
    addTasks({ test: spy });
    setLang('fr');
    expect(spy).toHaveBeenCalledWith('fr');
    expect(removeTask('test')).toBe(true);
    expect(removeTask('test')).toBe(false);
  });
  test('addFormatTime and formatTime with context', () => {
    addFormatTime({ es: { short: 'HH:mm' } });
    setLang('es');
    expect(formatTime('short')).toBe('HH:mm');
  });

  test('addFormatDateTime and formatDateTime with context', () => {
    addFormatDateTime({ es: { short: 'DD/MM HH:mm' } });
    setLang('es');
    expect(formatDateTime('short')).toBe('DD/MM HH:mm');
  });

  test('addFormatNumber and formatNumber return objects', () => {
    addFormatNumber({ es: { short: { maximumFractionDigits: 1 } } });
    setLang('es');
    expect(formatNumber('short')).toEqual({ maximumFractionDigits: 1 });
  });

  test('addFormatCurrency sets style and formatCurrency returns config', () => {
    addFormatCurrency({ es: { short: { currency: 'EUR' } } });
    setLang('es');
    expect(formatCurrency('short')).toEqual({ currency: 'EUR' });
  });

  test('setLang and getLang handle invalid inputs', () => {
    setLang('_default');
    expect(setLang('_default')).toBe(false);
    expect(setLang('')).toBe(false);
    setLang('en');
    expect(getLang()).toBe('en');
  });

  test('addDictionary rejects non objects and context lookup works', () => {
    expect(addDictionary('nope' as any)).toBe(false);
    addDictionary({ default: { section: { key: 'value' } } });
    expect(t('key', 'section')).toBe('value');
  });
});
