import type { Retirement } from '@/types/custody_type'

import { custodia, toMessage } from '../supabase/supabase_client'

export interface RetirementRepository {
	list(): Promise<Retirement[]>
	retire(input: {
		assetId: string
		reason: string
		dataWiped: boolean
		accountsRemoved: boolean
		partsSeparated: boolean
	}): Promise<void>
	confirmWriteOff(assetId: string): Promise<void>
	suggested(assetId: string): Promise<number>
	proposeToTrueque(assetId: string, price: number): Promise<void>
}

export const retirementRepository: RetirementRepository = {
	async list() {
		const { data, error } = await custodia
			.from('retirements')
			.select('asset_id, reason, it_at, accounting_at, outcome')
			.order('it_at', { ascending: false })
			.returns<
				{
					asset_id: string
					reason: string
					it_at: string
					accounting_at: string | null
					outcome: Retirement['outcome']
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			assetId: r.asset_id,
			reason: r.reason,
			itAt: r.it_at,
			accountingAt: r.accounting_at,
			outcome: r.outcome,
		}))
	},

	async retire({
		assetId,
		reason,
		dataWiped,
		accountsRemoved,
		partsSeparated,
	}) {
		const { error } = await custodia.rpc('retire', {
			p_asset: assetId,
			p_reason: reason,
			p_data_wiped: dataWiped,
			p_accounts_removed: accountsRemoved,
			p_parts_separated: partsSeparated,
		})
		if (error) throw new Error(toMessage(error))
	},

	async confirmWriteOff(assetId) {
		const { error } = await custodia.rpc('confirm_write_off', {
			p_asset: assetId,
		})
		if (error) throw new Error(toMessage(error))
	},

	async suggested(assetId) {
		const { data, error } = await custodia.rpc('suggested_cacaos', {
			p_asset: assetId,
		})
		if (error) throw new Error(toMessage(error))
		return typeof data === 'number' ? data : 60
	},

	async proposeToTrueque(assetId, price) {
		const { error } = await custodia.rpc('propose_to_trueque', {
			p_asset: assetId,
			p_price: price,
		})
		if (error) throw new Error(toMessage(error))
	},
}
