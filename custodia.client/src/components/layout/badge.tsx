import { useBadges } from '@/hooks/ui/use_badges'

import type { NavItem } from './nav_items'

export function Badge({ kind }: { kind: NavItem['badge'] }) {
	const badges = useBadges()
	const n = kind ? badges[kind] : 0
	if (!n) return null
	return (
		<span className='badge-n num' aria-label={`${n} pendientes`}>
			{n}
		</span>
	)
}
