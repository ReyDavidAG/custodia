const MONTHS = [
	'ene',
	'feb',
	'mar',
	'abr',
	'may',
	'jun',
	'jul',
	'ago',
	'sep',
	'oct',
	'nov',
	'dic',
]

const toDate = (iso: string) =>
	new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)

export function shortDate(iso: string) {
	const d = toDate(iso)
	return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function daysUntil(iso: string, now = new Date()) {
	const end = new Date(`${iso.slice(0, 10)}T23:59:59`)
	return Math.ceil((end.getTime() - now.getTime()) / 86_400_000)
}
