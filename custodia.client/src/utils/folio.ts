export const fmt = (prefix: string, n: number) =>
	`${prefix}-${String(n).padStart(4, '0')}`
export const folioNumber = (folio: string) => Number(folio.replace(/\D/g, ''))
export const money = (n: number) => `$${n.toLocaleString('es-MX')}`
