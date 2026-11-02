import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'
import type { Session } from '@/types/session_type'

import { SessionContext, type SessionContextValue } from './session_store'

export function SessionProvider({ children }: { children: ReactNode }) {
	const client = useQueryClient()
	const [signedOut, setSignedOut] = useState(false)
	const query = useQuery({
		queryKey: QUERY_KEYS.session,
		queryFn: () => services.session.current(),
		staleTime: Infinity,
		retry: false,
	})

	const signIn = useCallback(
		(employeeNumber: string) => services.session.claim(employeeNumber),
		[]
	)

	const confirm = useCallback(
		(session: Session) => {
			client.removeQueries({
				predicate: q => q.queryKey[0] !== QUERY_KEYS.session[0],
			})
			setSignedOut(false)
			client.setQueryData(QUERY_KEYS.session, session)
		},
		[client]
	)

	const signOut = useCallback(async () => {
		setSignedOut(true)
		await services.session.signOut()
		client.setQueryData(QUERY_KEYS.session, null)
		client.removeQueries({
			predicate: q => q.queryKey[0] !== QUERY_KEYS.session[0],
		})
	}, [client])

	const value = useMemo<SessionContextValue>(
		() => ({
			session: query.data ?? null,
			isLoading: query.isLoading,
			signedOut,
			error: query.error,
			signIn,
			confirm,
			signOut,
			refresh: () => void query.refetch(),
		}),
		[query, signedOut, signIn, confirm, signOut]
	)

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	)
}
