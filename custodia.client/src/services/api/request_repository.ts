import type { Request } from '@/types/custody_type'
import { fmt } from '@/utils/folio'

import { custodia, toMessage } from '../supabase/supabase_client'

export interface RequestRepository {
	list(): Promise<Request[]>
	create(input: {
		personId: string
		assetAreaId: string
		typeId: string
		reason: string
	}): Promise<string>
	reject(id: string, note: string): Promise<void>
}

interface Row {
	id: string
	folio: number
	person_id: string
	asset_area_id: string
	type_id: string
	reason: string
	status: Request['status']
	note: string | null
	created_at: string
}

export const requestRepository: RequestRepository = {
	async list() {
		const { data, error } = await custodia
			.from('requests')
			.select('*')
			.order('created_at', { ascending: false })
			.returns<Row[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			id: r.id,
			folio: fmt('SOL', r.folio),
			personId: r.person_id,
			assetAreaId: r.asset_area_id,
			typeId: r.type_id,
			reason: r.reason,
			status: r.status,
			note: r.note,
			createdAt: r.created_at,
		}))
	},

	async create({ personId, assetAreaId, typeId, reason }) {
		const { data, error } = await custodia
			.from('requests')
			.insert({
				person_id: personId,
				asset_area_id: assetAreaId,
				type_id: typeId,
				reason,
			})
			.select('folio')
			.single<{ folio: number }>()
		if (error) throw new Error(toMessage(error))
		return fmt('SOL', data.folio)
	},

	async reject(id, note) {
		const { error } = await custodia.rpc('reject_request', {
			p_request: id,
			p_note: note,
		})
		if (error) throw new Error(toMessage(error))
	},
}
