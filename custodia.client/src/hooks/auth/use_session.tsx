import { useContext } from 'react'

import { SessionContext } from '@/context/session/session_store'

export function useSession() {
	const ctx = useContext(SessionContext)
	if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
	return ctx
}

export function useRequiredSession() {
	const { session } = useSession()
	if (!session) throw new Error('No hay sesión')
	return session
}
