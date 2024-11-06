import chroma from 'chroma-js';
import moment from 'moment';

//----------------------------------Arrays

/**
 * Splits an array into chunks of a given size.
 * @param {T[]} arr - Array to split into chunks.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {T[][]} Array of chunked arrays.
 */
export function sliceIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

/**
 * Splits and flattens a list of strings based on a separator.
 * @param {string[]} arrayStrings - Array of strings to split and flatten.
 * @param {string} separator - Separator to use for splitting.
 * @returns {string[]} Flattened and splitted array of strings.
 */
export function splitAndFlat(
  arrayStrings: (null | undefined | boolean | string)[],
  separator: string = ' '
): string[] {
  const r: Array<false | string> = arrayStrings.flatMap(s =>
    (typeof s === 'string' && s.split(separator)) as Array<false | string>
  );
  const filtered = r.filter(Boolean) as Array<string>;
  return Array.from(new Set(filtered));
}

//-----------------------------------colors

/**
 * Generates a random set of colors with an optional format.
 * @param count - Number of colors to generate.
 * @param options - Object containing optional parameters.
 * @param options.format - The format of the output colors ('hex', 'rgb', 'nrgb').
 * @param options.bounds - The bounds for color transformation.
 * @param options.distribute - Whether the colors should be evenly distributed.
 * @returns An array of colors in the specified format.
 */
export function generateRandomColors(
  count: number,
  {
    format = 'hex',
    bounds = 1,
    distribute = true
  }: { format?: 'hex' | 'rgb' | 'nrgb', bounds?: number | number[] | { r: number, g: number, b: number }, distribute?: boolean } = {}
): Array<string | [number, number, number] | number[]> {
  const uniqueColors = new Set<chroma.Color>();

  if (distribute) {
    const step = Math.floor(0xFFFFFF / count);
    for (let i = 0; i < count; i++) {
      const colorValue = i * step;
      const colorHex = '#' + colorValue.toString(16).padStart(6, '0');
      const color = chroma(colorHex);
      uniqueColors.add(color);
    }
  } else {
    while (uniqueColors.size < count) {
      uniqueColors.add(chroma.random());
    }
  }

  const formattedColors = Array.from(uniqueColors).map((color) => {
    const [r, g, b] = color.rgb();
    const adjustedColor: [number, number, number] = (typeof bounds === 'number' || Array.isArray(bounds))
      ? color.rgb().map((c: number) => transform(c, bounds)) as [number, number, number]
      : [
        transform(r, bounds.r),
        transform(g, bounds.g),
        transform(b, bounds.b)
      ];
    return chroma(...adjustedColor);
  });

  return formattedColors.map(color => {
    if (format === 'hex') {
      return color.hex();
    } else if (format === 'rgb') {
      return color.rgb();
    } else if (format === 'nrgb') {
      return color.rgb().map((c: number) => c / 255);
    }
  }) as Array<string | [number, number, number] | number[]>;
}

/**
 * Transforms a color value based on the specified limit.
 * @param value - The color component value.
 * @param limit - The limit for transformation.
 * @returns The transformed color component.
 */
function transform(value: number, limit: number | number[]): number {
  const [min, max] = Array.isArray(limit) ? limit : typeof limit === 'number' ? [0, limit] : [0, 1];
  return ((value / 255) * (max - min) + min) * 255;
}

/**
 * Evaluates the similarity of a set of colors.
 * @param cls - Array of colors in hex format.
 * @returns A similarity score between 0 and 1, where 0 indicates all colors are distinct and 1 indicates all are similar.
 */
export function evaluateColorSimilarity(colors: string[]): number {
  let totalDistance = 0;
  let pairsCount = 0;
  const cls = colors.sort();

  for (let i = 0; i < cls.length; i++) {
    for (let j = i + 1; j < cls.length; j++) {
      totalDistance += chroma.distance(cls[i], cls[j]);
      pairsCount++;
    }
  }

  const averageDistance = totalDistance / pairsCount;
  const maxDistance = Math.sqrt(Math.pow(255, 2) * 3); // Maximum possible distance in RGB
  return 1 - (averageDistance / maxDistance);
}

//-------------------------------------strings

/**
 * Normalizes a string by converting it to lowercase and removing diacritical marks.
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string.
 */
export function normalize(str: string = ''): string {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Converts a string to a slug.
 * @param {string} str - The string to slugify.
 * @returns {string} The slugified string.
 */
export function slugify(str: string = ''): string {
  return normalize(str)
    .replace(/\s/g, '-')
    .replace(/[^a-zA-Z\d\-]+/g, '')
    .replace(/-+/g, '-');
}

/**
 * Generates a random four-character string consisting of hexadecimal digits.
 * @returns {string} The random four-character string.
 */
export function randomS4(): string {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

export function randomString(
  length: number = 16,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) {
  let result = '';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//------------------------------------------time

/**
 * Generates an array of time intervals between two dates.
 * @param {Object} options - Options for generating time intervals.
 * @param {string|number} options.from - Start date in string format or as a UNIX timestamp.
 * @param {string|number} options.to - End date in string format or as a UNIX timestamp.
 * @param {number} options.step - The step size in hours for each time interval.
 * @param {string} [options.boundary] - Restrict chunks to 'day', 'month', or 'day,month' boundaries.
 * @returns {Array} An array of objects representing each time interval.
 */
export function timeChunks(options: { from: string | number, to: string | number, step: number, boundary?: string }): { from: string, to: string, step: number }[] {
  const { from, to, step, boundary } = options;

  if (!(step > 0)) {
    throw new Error('Invalid step ' + step);
  }

  if (!moment(from).isValid()) {
    throw new Error('Invalid date ' + from);
  }

  if (!moment(to).isValid()) {
    throw new Error('Invalid date ' + to);
  }

  const hoursArray = [];
  const fromMoment = Number.isInteger(from) ? moment.unix(from as number) : moment(from);
  const toMoment = Number.isInteger(to) ? moment.unix(to as number) : moment(to);
  const diffHours = toMoment.diff(fromMoment, 'hours');

  for (let i = 0; i < diffHours; i += step) {
    let hourMoment = moment(from).add(i, 'hours');
    let nextHourMoment = moment(from).add(i + step, 'hours');

    if (boundary) {
      const boundaries = boundary.split(',');
      if (boundaries.includes('day')) {
        const endOfDay = moment(hourMoment).endOf('day');
        nextHourMoment = nextHourMoment.isAfter(endOfDay) ? endOfDay : nextHourMoment;
      }

      if (boundaries.includes('month')) {
        const endOfMonth = moment(hourMoment).endOf('month');
        nextHourMoment = nextHourMoment.isAfter(endOfMonth) ? endOfMonth : nextHourMoment;
      }
    }

    hoursArray.push({
      from: hourMoment.format(),
      to: nextHourMoment.isAfter(toMoment) ? moment(to).format() : nextHourMoment.format(),
      step
    });
  }
  return hoursArray;
}

/**
 * Resolves the promise after a given timeout.
 * @param {number} timeout - Milliseconds to wait before resolving.
 * @returns {Promise<void>} The promise that resolves after the timeout.
 */
export function delay(timeout: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

//-------------------------------------------------------- numbers

/**
 * Computes the hash value of a string.
 * @param {string} string - The string to hash.
 * @returns {number} The computed hash value.
 */
export function hash(string: string): number {
  let hash = 0, i, chr;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Linear Congruential Generator (LCG) class for pseudo-random number generation.
 * @class LCG
 */
export class LCG {
  private a: number;
  private c: number;
  private m: number;
  private seed: number;

  constructor(seed: number) {
    this.a = 1664525;
    this.c = 1013904223;
    this.m = 2 ** 32;
    this.seed = seed;
  }

  /**
   * Generates a pseudo-random number between 0 and 1.
   * @returns {number} The generated pseudo-random number.
   */
  random(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
}
