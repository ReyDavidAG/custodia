import { Navigate, Outlet, useLocation } from 'react-router'

import { ROUTES } from '@/constants/routes'
import { useSession } from '@/hooks/auth/use_session'
import LoadingPage from '@/pages/core/loading/loading_page'

export default function AuthGuard() {
	const { session, isLoading, error, refresh, signedOut } = useSession()
	const location = useLocation()

	if (isLoading) return <LoadingPage />
	if (error)
		return (
			<div className='wrap narrow'>
				<div className='empty'>
					<h1 className='h2'>No se pudo cargar tu sesión</h1>
					<p>{error.message}</p>
					<button type='button' className='btn' onClick={refresh}>
						Reintentar
					</button>
				</div>
			</div>
		)
	if (!session)
		return (
			<Navigate
				to={ROUTES.signIn}
				replace
				state={signedOut ? null : { from: location.pathname }}
			/>
		)
	return <Outlet />
}
