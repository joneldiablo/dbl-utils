import moment from "moment";

import { deepMerge } from "./object-mutation";

/**
 * Configuration object for text translation.
 * @interface Config
 * @property {string} lang - The current language.
 * @property {Object} dictionary - The dictionary of translations.
 * @property {Object} formatDate - The date formats.
 * @property {Object} formatTime - The time formats.
 * @property {Object} formatDateTime - The date-time formats.
 * @property {Object} formatNumber - The number formats.
 * @property {Object} formatNumberCompact - The compact number formats.
 * @property {Object} formatCurrency - The currency formats.
 * @property {Object} tasks - The tasks to perform if language changes.
 */
interface Config {
  lang: string;
  dictionary: Record<string, any>;
  formatDate: Record<string, any>;
  formatTime: Record<string, any>;
  formatDateTime: Record<string, any>;
  formatNumber: Record<string, any>;
  formatNumberCompact: Record<string, any>;
  formatCurrency: Record<string, any>;
  tasks: Record<string, (lang: string) => void>;
}

const config: Config = {
  lang: '_default',
  dictionary: { default: {} },
  formatDate: { default: 'MM/DD/YYYY' },
  formatTime: { default: 'HH:mm:ss' },
  formatDateTime: { default: 'MM/DD/YYYY HH:mm:ss' },
  formatNumber: { default: {} },
  formatNumberCompact: { default: '0.00a' },
  formatCurrency: { default: { currency: 'USD', style: 'currency' } },
  tasks: {}
};

let isTrackingText = false;
let trackingTextSet = new Set<string>();

export function trackingTexts(setTracking: boolean = true) {
  isTrackingText = setTracking;
}

export function getTexts() {
  return Array.from(trackingTextSet);
}

/**
 * Adds a dictionary to the configuration object.
 * @param {Object} dictionary - The dictionary to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addDictionary = (dictionary: object): boolean => {
  if (typeof dictionary !== 'object') return false;
  deepMerge(config.dictionary, dictionary);
  return true;
}

/**
 * Adds date formats to the configuration object.
 * @param {Object} formats - The date formats to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addFormatDate = (formats: object): boolean => {
  if (typeof formats !== 'object') return false;
  deepMerge(config.formatDate, formats);
  return true;
}

/**
 * Adds time formats to the configuration object.
 * @param {Object} formats - The time formats to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addFormatTime = (formats: object): boolean => {
  if (typeof formats !== 'object') return false;
  deepMerge(config.formatTime, formats);
  return true;
}

/**
 * Adds date-time formats to the configuration object.
 * @param {Object} formats - The date-time formats to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addFormatDateTime = (formats: object): boolean => {
  if (typeof formats !== 'object') return false;
  deepMerge(config.formatDateTime, formats);
  return true;
}

/**
 * Adds number formats to the configuration object.
 * @param {Object} formats - The number formats to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addFormatNumber = (formats: object): boolean => {
  if (typeof formats !== 'object') return false;
  deepMerge(config.formatNumber, formats);
  return true;
}

/**
 * Adds compact number formats to the configuration object.
 * @param {Object} formats - The compact number formats to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addFormatNumberCompact = (formats: object): boolean => {
  if (typeof formats !== 'object') return false;
  deepMerge(config.formatNumberCompact, formats);
  return true;
}

/**
 * Adds currency formats to the configuration object.
 * @param {Object} formats - The currency formats to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addFormatCurrency = (formats: object): boolean => {
  if (typeof formats !== 'object') return false;
  Object.values(formats).forEach(format => (format.style = 'currency'));
  deepMerge(config.formatCurrency, formats);
  return true;
}

/**
 * Adds tasks to be executed on language change.
 * @param {Object} tasks - The tasks to add.
 * @returns {boolean} True if added correctly, false otherwise.
 */
export const addTasks = (tasks: Record<string, (lang: string) => void>): boolean => {
  Object.entries(tasks).forEach(([key, task]) => {
    if (typeof task === 'function') config.tasks[key] = task;
  });
  return true;
}

/**
 * Removes a specific task.
 * @param {string} key - The key of the task to remove.
 * @returns {boolean} True if removed, false otherwise.
 */
export const removeTask = (key: string): boolean => {
  if (!config.tasks[key]) return false;
  delete config.tasks[key];
  return true;
}

/**
 * Sets the current language.
 * @param {string} newLang - The new language to set.
 * @returns {boolean} True if set correctly, false otherwise.
 */
export const setLang = (newLang: string): boolean => {
  if (!newLang || config.lang === newLang) return false;
  moment.locale(newLang);
  config.lang = newLang;
  Object.values(config.tasks).forEach(task => task(newLang));
  return true;
}

/**
 * Gets the current language.
 * @returns {string} The current language.
 */
export const getLang = (): string => {
  return config.lang;
}

/**
 * Selects a text from the default dictionary.
 * @param {string} text - The text to select.
 * @param {string} [context] - The context of the text.
 * @returns {string} The selected text from the default dictionary.
 */
const selectFromDefault = (text: string, context?: string): string => {
  const dictDefault = config.dictionary.default;
  if (context && typeof dictDefault[context] === 'object' && dictDefault[context][text])
    return dictDefault[context][text];
  return dictDefault[text] || text;
}

/**
 * Function to translate texts.
 * @param {string} text - The text to translate.
 * @param {string} [context] - The context of the text.
 * @returns {string} The translated text.
 */
const t = (text: string, context?: string): string => {
  if (isTrackingText) {
    trackingTextSet.add(text);
  }

  if (config.lang === '_default') return selectFromDefault(text, context);
  const dict1 = config.dictionary[config.lang];
  if (typeof dict1 !== 'object') return selectFromDefault(text, context);
  const objContext = context && dict1[context];
  if (typeof objContext === 'object' && objContext[text]) return objContext[text];
  return dict1[text] || selectFromDefault(text);
}

/**
 * Formats a value according to the current language and context.
 * @param {Record<string, any>} formatObject - The configuration object to use.
 * @param {string} [context] - The context of the value.
 * @returns {string} The formatted value.
 */
function formatGeneric(formatObject: Record<string, any>, context?: string): string {
  if (context && formatObject[context]) {
    return formatObject[context];
  } else if (config.lang !== '_default' && formatObject[config.lang]) {
    return context && formatObject[config.lang][context]
      ? formatObject[config.lang][context]
      : formatObject[config.lang].default || formatObject[config.lang];
  }
  return context && formatObject.default[context]
    ? formatObject.default[context]
    : formatObject.default;
}

/**
 * Formats a date according to the current language and context.
 * @param {string} [context] - The context of the date.
 * @returns {string} The formatted date.
 */
export const formatDate = (context?: string): string => {
  return formatGeneric(config.formatDate, context);
}

/**
 * Formats a time according to the current language and context.
 * @param {string} [context] - The context of the time.
 * @returns {string} The formatted time.
 */
export const formatTime = (context?: string): string => {
  return formatGeneric(config.formatTime, context);
}

/**
 * Formats a date-time according to the current language and context.
 * @param {string} [context] - The context of the date-time.
 * @returns {string} The formatted date-time.
 */
export const formatDateTime = (context?: string): string => {
  return formatGeneric(config.formatDateTime, context);
}

/**
 * Formats a number according to the current language and context.
 * @param {string} [context] - The context of the number.
 * @returns {string} The formatted number.
 */
export const formatNumber = (context?: string): string => {
  return formatGeneric(config.formatNumber, context);
}

/**
 * Formats a compact number according to the current language and context.
 * @param {string} [context] - The context of the compact number.
 * @returns {string} The formatted compact number.
 */
export const formatNumberCompact = (context?: string): string => {
  return formatGeneric(config.formatNumberCompact, context);
}

/**
 * Formats a currency according to the current language and context.
 * @param {string} [context] - The context of the currency.
 * @returns {string} The formatted currency.
 */
export const formatCurrency = (context?: string): string => {
  return formatGeneric(config.formatCurrency, context);
}

export default t;


