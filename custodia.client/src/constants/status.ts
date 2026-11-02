export const ASSET_STATUSES = [
	'stock',
	'assigned',
	'repair',
	'retired',
	'trueque',
	'disposed',
] as const

export const STATUS_LABELS = {
	stock: 'En almacén',
	assigned: 'Asignado',
	repair: 'En reparación',
	retired: 'Dado de baja',
	trueque: 'En El Trueque',
	disposed: 'Salió del inventario',
} as const

export const ROLE_NAMES = {
	member: 'Colaborador',
	it: 'Soporte de IT',
	accounting: 'Contabilidad',
} as const

export const REQUEST_LABELS = {
	pending: ['Pendiente', 'is-pending'],
	rejected: ['Rechazada', 'is-rejected'],
	delivered: ['Entregada', 'is-delivered'],
	cancelled: ['Cancelada', 'is-rejected'],
} as const
