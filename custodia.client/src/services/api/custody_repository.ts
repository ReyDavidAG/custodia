import type { Evidence, Letter } from '@/types/custody_type'
import { fmt, folioNumber } from '@/utils/folio'

import {
	custodia,
	EVIDENCE_BUCKET,
	supabase,
	toMessage,
} from '../supabase/supabase_client'

export interface CustodyRepository {
	letter(folio: string): Promise<Letter | null>
	handover(input: {
		personId: string
		assetIds: string[]
		evidenceId: string
		requestId: string | null
	}): Promise<string>
	receiveReturn(input: {
		assetId: string
		condition: 'good' | 'damaged'
		evidenceId: string
		missing: string[]
	}): Promise<string>
	uploadEvidence(input: {
		file: Blob
		kind: Evidence['kind']
		assetAreaId: string
		personId: string
	}): Promise<string>
	evidenceUrl(path: string): Promise<string | null>
}

interface LetterRow {
	id: string
	folio: number
	person_id: string
	status: Letter['status']
	delivered_on: string
	closed_on: string | null
	delivered_by: string
	terms: string
	items: {
		asset_id: string
		returned_on: string | null
		return_condition: 'good' | 'damaged' | null
		delivery_evidence_id: string
		missing: { part_name: string }[]
		asset: {
			prefix: string
			folio: number
			name: string
			serial: string | null
			type: { name: string } | null
		} | null
	}[]
}

async function sha256(file: Blob) {
	const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
	return [...new Uint8Array(hash)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')
}

const EXT = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'application/pdf': 'pdf',
} as const
const isMime = (v: string): v is keyof typeof EXT => v in EXT

export const custodyRepository: CustodyRepository = {
	async letter(folio) {
		const { data, error } = await custodia
			.from('custodies')
			.select(
				'id, folio, person_id, status, delivered_on, closed_on, delivered_by, terms, items:custody_items(asset_id, returned_on, return_condition, delivery_evidence_id, missing:missing_parts(part_name), asset:assets(prefix, folio, name, serial, type:asset_types(name)))'
			)
			.eq('folio', folioNumber(folio))
			.maybeSingle<LetterRow>()
		if (error) throw new Error(toMessage(error))
		if (!data) return null
		const evidenceId = data.items[0]?.delivery_evidence_id
		const ev = evidenceId
			? await custodia
					.from('evidences')
					.select('id, kind, storage_path, mime')
					.eq('id', evidenceId)
					.maybeSingle<{
						id: string
						kind: Evidence['kind']
						storage_path: string
						mime: string
					}>()
			: null
		return {
			id: data.id,
			folio: fmt('RES', data.folio),
			personId: data.person_id,
			status: data.status,
			deliveredOn: data.delivered_on,
			closedOn: data.closed_on,
			deliveredBy: data.delivered_by,
			terms: data.terms,
			evidence: ev?.data
				? {
						id: ev.data.id,
						kind: ev.data.kind,
						storagePath: ev.data.storage_path,
						mime: ev.data.mime,
					}
				: null,
			items: data.items.map(i => ({
				assetId: i.asset_id,
				folio: i.asset ? fmt(i.asset.prefix, i.asset.folio) : '',
				typeName: i.asset?.type?.name ?? '',
				name: i.asset?.name ?? '',
				serial: i.asset?.serial ?? null,
				returnedOn: i.returned_on,
				returnCondition: i.return_condition,
				missing: i.missing.map(m => m.part_name),
			})),
		}
	},

	async handover({ personId, assetIds, evidenceId, requestId }) {
		const { data, error } = await custodia.rpc('handover', {
			p_person: personId,
			p_assets: assetIds,
			p_evidence: evidenceId,
			p_request: requestId,
		})
		if (error) throw new Error(toMessage(error))
		if (typeof data !== 'string') throw new Error('No se pudo emitir la carta.')
		return data
	},

	async receiveReturn({ assetId, condition, evidenceId, missing }) {
		const { data, error } = await custodia.rpc('receive_return', {
			p_asset: assetId,
			p_condition: condition,
			p_evidence: evidenceId,
			p_missing: missing,
		})
		if (error) throw new Error(toMessage(error))
		return typeof data === 'string' ? data : 'stock'
	},

	async uploadEvidence({ file, kind, assetAreaId, personId }) {
		const mime = file.type
		if (!isMime(mime))
			throw new Error('Sólo se aceptan fotos (PNG, JPG, WebP) o PDF.')
		if (file.size > 10 * 1024 * 1024)
			throw new Error('El archivo pesa más de 10 MB.')
		const path = `${assetAreaId}/${crypto.randomUUID()}.${EXT[mime]}`
		const up = await supabase.storage
			.from(EVIDENCE_BUCKET)
			.upload(path, file, { contentType: mime })
		if (up.error) throw new Error(toMessage(up.error))
		const { data, error } = await custodia
			.from('evidences')
			.insert({
				kind,
				storage_path: path,
				mime,
				size_bytes: file.size,
				sha256: await sha256(file),
				uploaded_by: personId,
			})
			.select('id')
			.single<{ id: string }>()
		if (error) throw new Error(toMessage(error))
		return data.id
	},

	async evidenceUrl(path) {
		const { data, error } = await supabase.storage
			.from(EVIDENCE_BUCKET)
			.createSignedUrl(path, 600)
		if (error) return null
		return data.signedUrl
	},
}
