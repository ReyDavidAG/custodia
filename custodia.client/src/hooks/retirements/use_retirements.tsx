import { useMutation, useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { useRefreshAssets } from '@/hooks/assets/use_assets'
import { services } from '@/services/api/unit_of_services'

export function useRetirements() {
	return useQuery({
		queryKey: QUERY_KEYS.retirements,
		queryFn: () => services.retirements.list(),
	})
}

export function useSuggested(assetId: string | undefined, enabled: boolean) {
	return useQuery({
		queryKey: QUERY_KEYS.suggested(assetId ?? ''),
		queryFn: () => services.retirements.suggested(assetId!),
		enabled: !!assetId && enabled,
	})
}

export function useRetire() {
	const refresh = useRefreshAssets()
	return useMutation({
		mutationFn: services.retirements.retire,
		onSuccess: refresh,
	})
}

export function useConfirmWriteOff() {
	const refresh = useRefreshAssets()
	return useMutation({
		mutationFn: (assetId: string) =>
			services.retirements.confirmWriteOff(assetId),
		onSuccess: refresh,
	})
}

export function useProposeToTrueque() {
	const refresh = useRefreshAssets()
	return useMutation({
		mutationFn: (v: { assetId: string; price: number }) =>
			services.retirements.proposeToTrueque(v.assetId, v.price),
		onSuccess: refresh,
	})
}
