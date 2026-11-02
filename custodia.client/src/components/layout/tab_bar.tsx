import { NavLink } from 'react-router'

import { Icon } from '@/components/ui/icon'

import { Badge } from './badge'
import type { NavItem } from './nav_items'

export function TabBar({ items }: { items: NavItem[] }) {
	return (
		<nav className='tabbar' aria-label='Principal'>
			{items.map(i => (
				<NavLink key={i.to} className='tabbar__item' to={i.to}>
					<Icon name={i.icon} />
					<span>{i.label}</span>
					<Badge kind={i.badge} />
				</NavLink>
			))}
		</nav>
	)
}
