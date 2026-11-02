import { createContext } from 'react'

import type { Session } from '@/types/session_type'

export interface SessionContextValue {
	session: Session | null
	isLoading: boolean
	signedOut: boolean
	error: Error | null
	signIn: (employeeNumber: string) => Promise<Session>
	confirm: (session: Session) => void
	signOut: () => Promise<void>
	refresh: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
