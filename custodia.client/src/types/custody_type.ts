export interface Evidence {
	id: string
	kind: 'signature' | 'photo' | 'pdf'
	storagePath: string
	mime: string
}

export interface CustodyItem {
	assetId: string
	folio: string
	typeName: string
	name: string
	serial: string | null
	returnedOn: string | null
	returnCondition: 'good' | 'damaged' | null
	missing: string[]
}

export interface Letter {
	id: string
	folio: string
	personId: string
	status: 'active' | 'closed'
	deliveredOn: string
	closedOn: string | null
	deliveredBy: string
	terms: string
	items: CustodyItem[]
	evidence: Evidence | null
}

export interface Request {
	id: string
	folio: string
	personId: string
	assetAreaId: string
	typeId: string
	reason: string
	status: 'pending' | 'rejected' | 'delivered' | 'cancelled'
	note: string | null
	createdAt: string
}

export interface Retirement {
	assetId: string
	reason: string
	itAt: string
	accountingAt: string | null
	outcome: 'pending' | 'trueque' | 'disposal' | 'donation'
}
