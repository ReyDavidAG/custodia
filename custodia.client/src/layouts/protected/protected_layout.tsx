import { Suspense, useMemo } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { navItems } from '@/components/layout/nav_items'
import { TabBar } from '@/components/layout/tab_bar'
import { TopBar } from '@/components/layout/top_bar'
import { Icon } from '@/components/ui/icon'
import { ROLE_NAMES } from '@/constants/status'
import { useRequiredSession } from '@/hooks/auth/use_session'
import LoadingPage from '@/pages/core/loading/loading_page'

export default function ProtectedLayout() {
	const { role } = useRequiredSession()
	const { pathname } = useLocation()
	const items = useMemo(() => navItems(role), [role])

	return (
		<>
			<a className='skip-link' href='#main'>
				Saltar al contenido
			</a>
			<TopBar items={items} />
			<div className='demo-ribbon' role='note'>
				<Icon name='info' />
				<span>
					Demo con equipos de prueba · entraste como{' '}
					<strong>{ROLE_NAMES[role]}</strong>
				</span>
			</div>
			<main id='main' className='page' tabIndex={-1}>
				<Suspense fallback={<LoadingPage />}>
					<div key={pathname} className='animate-page-in'>
						<Outlet />
					</div>
				</Suspense>
			</main>
			<TabBar items={items} />
			<ScrollRestoration />
		</>
	)
}
