export const ROUTES = {
	signIn: '/sign-in',
	inventory: '/inventory',
	asset: (folio: string) => `/assets/${folio}`,
	assetReturn: (folio: string) => `/assets/${folio}/return`,
	assetRetire: (folio: string) => `/assets/${folio}/retire`,
	handover: '/handover',
	letter: (folio: string) => `/letters/${folio}`,
	requests: '/requests',
	mine: '/mine',
	retirements: '/retirements',
} as const

export const HOME = {
	member: ROUTES.mine,
	it: ROUTES.inventory,
	accounting: ROUTES.retirements,
} as const
