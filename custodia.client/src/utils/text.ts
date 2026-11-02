export const norm = (s: string) =>
	s
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()

export const words = (q: string) => norm(q).split(/\s+/).filter(Boolean)

export const matches = (text: string, terms: string[]) => {
	const n = norm(text)
	return terms.every(w => n.includes(w))
}
