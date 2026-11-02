import { useMemo } from 'react'

import { useRequiredSession } from '@/hooks/auth/use_session'
import { useRequests } from '@/hooks/requests/use_requests'
import { useRetirements } from '@/hooks/retirements/use_retirements'

export function useBadges() {
	const { role } = useRequiredSession()
	const requests = useRequests()
	const retirements = useRetirements()
	return useMemo(
		() => ({
			requests:
				role === 'it'
					? (requests.data ?? []).filter(r => r.status === 'pending').length
					: 0,
			retirements:
				role === 'accounting'
					? (retirements.data ?? []).filter(r => !r.accountingAt).length
					: 0,
		}),
		[role, requests.data, retirements.data]
	)
}
