export const initials = (name: string) =>
	name
		.split(' ')
		.filter(w => w.length > 2)
		.slice(0, 2)
		.map(w => w[0].toUpperCase())
		.join('') || name.slice(0, 2).toUpperCase()
