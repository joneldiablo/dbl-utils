import moment from "moment";
import numeral from "numeral";

import t, {
  formatDate, formatNumber, formatNumberCompact,
  formatCurrency, formatTime, formatDateTime, getLang
} from "./i18n";

// Define types for format configurations
type FormatType =
  | 'number-compact'
  | 'numbercompact'
  | 'number'
  | 'currency'
  | 'dictionary'
  | 'date'
  | 'time'
  | 'date-time'
  | 'datetime';

interface FormatConfig {
  format?: FormatType;
  formatConf?: string | Intl.NumberFormatOptions;
  context?: any;
  currency?: string;
}

/**
 * Formats a value based on the provided configuration.
 * 
 * @param value - The value to format
 * @param conf - Configuration options for formatting
 * @returns The formatted value or the original value if the format is not specified
 */
export default function formatValue(value: any, conf: FormatConfig): any {
  if (!conf?.format) return value;

  switch (conf.format) {
    case 'number-compact':
    case 'numbercompact': {
      // TODO: move to i18n
      // TODO: move to i18n
      numeral.locale(getLang());
      return numeral(value).format(conf.formatConf as string || formatNumberCompact(conf.context));
    }
    case 'number': {
      return typeof value === 'boolean' ? Number(value)
        : value.toLocaleString(getLang(), conf.formatConf || formatNumber(conf.context));
    }
    case 'currency': {
      const globalConf = (conf.formatConf || formatCurrency(conf.context)) as Intl.NumberFormatOptions;
      if (typeof globalConf === 'string')
        throw new Error("currency format must have formatConf as an Intl.NumberFormatOptions");

      return value.toLocaleString(getLang(), {
        ...globalConf,
        style: "currency",
        currency: conf.currency || (globalConf.currency as string),
      });
    }
    case 'dictionary': {
      return t(value, conf.context);
    }
    case 'date': {
      return moment(value).format(conf.formatConf as string || formatDate(conf.context));
    }
    case 'time': {
      return moment(value).format(conf.formatConf as string || formatTime(conf.context));
    }
    case 'date-time':
    case 'datetime': {
      return moment(value).format(conf.formatConf as string || formatDateTime(conf.context));
    }
    default: {
      return value;
    }
  }
}
