import { Navigate, Outlet } from 'react-router'

import { HOME } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import type { Role } from '@/types/session_type'

export default function RoleGuard({ roles }: { roles: Role[] }) {
	const { role } = useRequiredSession()
	return roles.includes(role) ? (
		<Outlet />
	) : (
		<Navigate to={HOME[role]} replace />
	)
}
