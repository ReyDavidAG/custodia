import { Link, NavLink } from 'react-router'

import { Wordmark } from '@/components/ui/art'
import { HOME } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'

import { Badge } from './badge'
import type { NavItem } from './nav_items'
import { UserMenu } from './user_menu'

export function TopBar({ items }: { items: NavItem[] }) {
	const { role } = useRequiredSession()
	return (
		<header className='topbar'>
			<div className='topbar__inner'>
				<Link
					className='topbar__brand'
					to={HOME[role]}
					aria-label='Custodia, inicio'>
					<Wordmark />
				</Link>
				<nav className='topnav' aria-label='Principal'>
					{items.map(i => (
						<NavLink key={i.to} className='topnav__link' to={i.to}>
							<span>{i.label}</span>
							<Badge kind={i.badge} />
						</NavLink>
					))}
				</nav>
				<div className='topbar__actions'>
					<UserMenu />
				</div>
			</div>
		</header>
	)
}
