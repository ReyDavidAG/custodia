import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'

export function useRequests() {
	return useQuery({
		queryKey: QUERY_KEYS.requests,
		queryFn: () => services.requests.list(),
	})
}

export function useCreateRequest() {
	const { person } = useRequiredSession()
	const client = useQueryClient()
	return useMutation({
		mutationFn: (v: { assetAreaId: string; typeId: string; reason: string }) =>
			services.requests.create({ ...v, personId: person.id }),
		onSuccess: () =>
			void client.invalidateQueries({ queryKey: QUERY_KEYS.requests }),
	})
}

export function useRejectRequest() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (v: { id: string; note: string }) =>
			services.requests.reject(v.id, v.note),
		onSuccess: () =>
			void client.invalidateQueries({ queryKey: QUERY_KEYS.requests }),
	})
}
