import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'

export function useAssets() {
	return useQuery({
		queryKey: QUERY_KEYS.assets,
		queryFn: () => services.assets.list(),
	})
}

export function useAsset(folio: string) {
	const query = useAssets()
	const asset = useMemo(
		() => query.data?.find(a => a.folio === folio) ?? null,
		[query.data, folio]
	)
	return { ...query, asset }
}

export function useTypes() {
	return useQuery({
		queryKey: QUERY_KEYS.types,
		queryFn: () => services.assets.types(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function usePeople() {
	return useQuery({
		queryKey: QUERY_KEYS.people,
		queryFn: () => services.assets.people(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function usePersonMap() {
	const { data } = usePeople()
	return useMemo(() => new Map((data ?? []).map(p => [p.id, p])), [data])
}

export function useParts(assetId: string | undefined) {
	return useQuery({
		queryKey: QUERY_KEYS.parts(assetId ?? ''),
		queryFn: () => services.assets.parts(assetId!),
		enabled: !!assetId,
	})
}

export function useEvents(assetId: string | undefined) {
	return useQuery({
		queryKey: QUERY_KEYS.events(assetId ?? ''),
		queryFn: () => services.assets.events(assetId!),
		enabled: !!assetId,
	})
}

export function useRefreshAssets() {
	const client = useQueryClient()
	return () => {
		void client.invalidateQueries({ queryKey: QUERY_KEYS.assets })
		void client.invalidateQueries({ queryKey: ['custodies'] })
		void client.invalidateQueries({ queryKey: QUERY_KEYS.requests })
		void client.invalidateQueries({ queryKey: QUERY_KEYS.retirements })
	}
}

export function useSetRepair() {
	const refresh = useRefreshAssets()
	return useMutation({
		mutationFn: (v: {
			assetId: string
			inRepair: boolean
			note: string | null
		}) => services.assets.setRepair(v.assetId, v.inRepair, v.note),
		onSuccess: refresh,
	})
}
