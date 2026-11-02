export const QUERY_KEYS = {
	session: ['session'] as const,
	assets: ['assets'] as const,
	types: ['catalog', 'types'] as const,
	people: ['catalog', 'people'] as const,
	parts: (assetId: string) => ['assets', assetId, 'parts'] as const,
	events: (assetId: string) => ['assets', assetId, 'events'] as const,
	letter: (folio: string) => ['custodies', folio] as const,
	evidenceUrl: (path: string) => ['evidence', path] as const,
	requests: ['requests'] as const,
	retirements: ['retirements'] as const,
	retirement: (assetId: string) => ['retirements', assetId] as const,
	suggested: (assetId: string) =>
		['retirements', assetId, 'suggested'] as const,
}

export const CATALOG_STALE_TIME = 5 * 60_000
