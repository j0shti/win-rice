// Set to false to go back to plain numbers.
export const USE_ROMAN_NUMERALS = true;

const ROMAN_TABLE: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRoman(num: number): string {
  let result = "";
  for (const [value, symbol] of ROMAN_TABLE) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

/**
 * Replaces standalone numbers (1-3999) in a workspace label with roman
 * numerals. Anything else (names, icons, mixed text like "web2") is left alone,
 * so "3", "3 " and "3 <icon>" all work.
 */
export function romanizeLabel<T extends string | null | undefined>(label: T): T {
  if (!USE_ROMAN_NUMERALS || !label) {
    return label;
  }

  return label.replace(/(?<!\w)\d+(?!\w)/g, (match) => {
    const n = Number(match);
    return n >= 1 && n <= 3999 ? toRoman(n) : match;
  }) as T;
}
