export type AssetStatus =
	| 'stock'
	| 'assigned'
	| 'repair'
	| 'retired'
	| 'trueque'
	| 'disposed'
export type EventKind =
	| 'in'
	| 'handover'
	| 'return'
	| 'repair'
	| 'repaired'
	| 'retire'
	| 'accounting'
	| 'trueque'
	| 'disposed'

export interface Asset {
	id: string
	folio: string
	assetAreaId: string
	typeId: string
	typeCode: string
	typeName: string
	group: 'hardware' | 'license'
	icon: string
	name: string
	brand: string | null
	model: string | null
	serial: string | null
	status: AssetStatus
	condition: string
	value: number | null
	purchasedOn: string | null
	warrantyUntil: string | null
	holderId: string | null
	custodyFolio: string | null
}

export interface AssetType {
	id: string
	assetAreaId: string
	code: string
	name: string
	group: 'hardware' | 'license'
	icon: string
}

export interface AssetEvent {
	id: number
	kind: EventKind
	personId: string | null
	custodyFolio: string | null
	note: string | null
	createdAt: string
}

export interface PersonLite {
	id: string
	employeeNumber: string
	fullName: string
	areaName: string
	departmentName: string | null
}
