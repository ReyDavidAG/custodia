import { useMutation, useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { useRefreshAssets } from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'
import type { Evidence } from '@/types/custody_type'

export function useLetter(folio: string) {
	return useQuery({
		queryKey: QUERY_KEYS.letter(folio),
		queryFn: () => services.custody.letter(folio),
	})
}

export function useEvidenceUrl(path: string | undefined) {
	return useQuery({
		queryKey: QUERY_KEYS.evidenceUrl(path ?? ''),
		queryFn: () => services.custody.evidenceUrl(path!),
		enabled: !!path,
		staleTime: 5 * 60_000,
	})
}

async function upload(
	file: Blob,
	kind: Evidence['kind'],
	assetAreaId: string,
	personId: string
) {
	return services.custody.uploadEvidence({ file, kind, assetAreaId, personId })
}

export function useHandover() {
	const { person } = useRequiredSession()
	const refresh = useRefreshAssets()
	return useMutation({
		mutationFn: async (v: {
			personId: string
			assetIds: string[]
			assetAreaId: string
			file: Blob
			kind: Evidence['kind']
			requestId: string | null
		}) => {
			const evidenceId = await upload(v.file, v.kind, v.assetAreaId, person.id)
			return services.custody.handover({
				personId: v.personId,
				assetIds: v.assetIds,
				evidenceId,
				requestId: v.requestId,
			})
		},
		onSuccess: refresh,
	})
}

export function useReceiveReturn() {
	const { person } = useRequiredSession()
	const refresh = useRefreshAssets()
	return useMutation({
		mutationFn: async (v: {
			assetId: string
			assetAreaId: string
			condition: 'good' | 'damaged'
			missing: string[]
			file: Blob
			kind: Evidence['kind']
		}) => {
			const evidenceId = await upload(v.file, v.kind, v.assetAreaId, person.id)
			return services.custody.receiveReturn({
				assetId: v.assetId,
				condition: v.condition,
				evidenceId,
				missing: v.missing,
			})
		},
		onSuccess: refresh,
	})
}
