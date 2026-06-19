export function lek(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")} L`;
}

export function lekLong(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")} Lek`;
}
