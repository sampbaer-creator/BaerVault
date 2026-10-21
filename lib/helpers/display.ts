export function displayMerchantName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "Unnamed";
  if (/^(uvu|utah valley univ|utah valley university)$/i.test(normalized)) return "Utah Valley Univ";
  return normalized.toLocaleLowerCase().replace(/(^|[\s&-])([a-z])/g, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

export function displayOwnerName(value: string) {
  return value.trim().toLowerCase() === "household" ? "Shared" : value;
}

export function displayShortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
