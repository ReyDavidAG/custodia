import type {
	Asset,
	AssetEvent,
	AssetStatus,
	AssetType,
	EventKind,
	PersonLite,
} from '@/types/asset_type'
import { fmt } from '@/utils/folio'

import { custodia, supabase, toMessage } from '../supabase/supabase_client'

export interface AssetRepository {
	list(): Promise<Asset[]>
	types(): Promise<AssetType[]>
	parts(assetId: string): Promise<string[]>
	events(assetId: string): Promise<AssetEvent[]>
	people(): Promise<PersonLite[]>
	setRepair(
		assetId: string,
		inRepair: boolean,
		note: string | null
	): Promise<void>
}

interface CardRow {
	id: string
	folio: string
	asset_area_id: string
	type_id: string
	type_code: string
	type_name: string
	group_code: 'hardware' | 'license'
	name: string
	brand: string | null
	model: string | null
	serial: string | null
	status: AssetStatus
	condition: string
	value: number | null
	purchased_on: string | null
	warranty_until: string | null
	holder_id: string | null
	custody_folio: string | null
}

const ICONS: Record<string, string> = {
	laptop: 'laptop',
	desktop: 'monitor',
	monitor: 'monitor',
	phone: 'phone',
	tablet: 'phone',
	printer: 'printer',
	accessory: 'plug',
}
export const iconFor = (code: string, group: string) =>
	ICONS[code] ?? (group === 'license' ? 'key' : 'box')

export const assetRepository: AssetRepository = {
	async list() {
		const { data, error } = await custodia
			.from('asset_cards')
			.select('*')
			.order('folio')
			.returns<CardRow[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			id: r.id,
			folio: r.folio,
			assetAreaId: r.asset_area_id,
			typeId: r.type_id,
			typeCode: r.type_code,
			typeName: r.type_name,
			group: r.group_code,
			icon: iconFor(r.type_code, r.group_code),
			name: r.name,
			brand: r.brand,
			model: r.model,
			serial: r.serial,
			status: r.status,
			condition: r.condition,
			value: r.value,
			purchasedOn: r.purchased_on,
			warrantyUntil: r.warranty_until,
			holderId: r.holder_id,
			custodyFolio: r.custody_folio,
		}))
	},

	async types() {
		const { data, error } = await custodia
			.from('asset_types')
			.select('id, asset_area_id, code, name, group_code')
			.order('position')
			.returns<
				{
					id: string
					asset_area_id: string
					code: string
					name: string
					group_code: 'hardware' | 'license'
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(t => ({
			id: t.id,
			assetAreaId: t.asset_area_id,
			code: t.code,
			name: t.name,
			group: t.group_code,
			icon: iconFor(t.code, t.group_code),
		}))
	},

	async parts(assetId) {
		const { data, error } = await custodia
			.from('asset_parts')
			.select('name')
			.eq('asset_id', assetId)
			.order('position')
			.returns<{ name: string }[]>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(p => p.name)
	},

	async events(assetId) {
		const { data, error } = await custodia
			.from('asset_events')
			.select('id, kind, person_id, note, created_at, custody:custodies(folio)')
			.eq('asset_id', assetId)
			.order('created_at', { ascending: false })
			.order('id', { ascending: false })
			.returns<
				{
					id: number
					kind: EventKind
					person_id: string | null
					note: string | null
					created_at: string
					custody: { folio: number } | null
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(e => ({
			id: e.id,
			kind: e.kind,
			personId: e.person_id,
			note: e.note,
			createdAt: e.created_at,
			custodyFolio: e.custody ? fmt('RES', e.custody.folio) : null,
		}))
	},

	async people() {
		const { data, error } = await supabase
			.from('people')
			.select(
				'id, employee_number, full_name, area:areas!people_area_id_fkey(name), department:departments!people_department_id_area_id_fkey(name)'
			)
			.order('full_name')
			.returns<
				{
					id: string
					employee_number: string
					full_name: string
					area: { name: string } | null
					department: { name: string } | null
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(p => ({
			id: p.id,
			employeeNumber: p.employee_number,
			fullName: p.full_name,
			areaName: p.area?.name ?? '',
			departmentName: p.department?.name ?? null,
		}))
	},

	async setRepair(assetId, inRepair, note) {
		const { error } = await custodia.rpc('set_repair', {
			p_asset: assetId,
			p_in_repair: inRepair,
			p_note: note,
		})
		if (error) throw new Error(toMessage(error))
	},
}
