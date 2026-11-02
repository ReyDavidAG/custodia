import { Navigate } from 'react-router'

import { HOME } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'

export default function HomeRedirect() {
	const { role } = useRequiredSession()
	return <Navigate to={HOME[role]} replace />
}
