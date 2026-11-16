// accepts "59,80" as well as "59.80", because iPhones set to a European
// region type a comma on the decimal keyboard
export function parseDecimal(value: string) {
  return Number(value.trim().replace(",", "."));
}

// for decimal text inputs: digits, with an optional comma or dot part
export const DECIMAL_PATTERN = "[0-9]+([.,][0-9]+)?";
