import type { IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/types/session_type'

export interface NavItem {
	to: string
	label: string
	icon: IconName
	badge?: 'requests' | 'retirements'
}

export const navItems = (role: Role): NavItem[] =>
	role === 'it'
		? [
				{ to: ROUTES.inventory, label: 'Inventario', icon: 'box' },
				{
					to: ROUTES.requests,
					label: 'Solicitudes',
					icon: 'inbox',
					badge: 'requests',
				},
				{ to: ROUTES.handover, label: 'Entregar', icon: 'send' },
			]
		: role === 'accounting'
			? [
					{
						to: ROUTES.retirements,
						label: 'Bajas',
						icon: 'calc',
						badge: 'retirements',
					},
					{ to: ROUTES.inventory, label: 'Inventario', icon: 'box' },
				]
			: [
					{ to: ROUTES.mine, label: 'Mi equipo', icon: 'laptop' },
					{ to: ROUTES.requests, label: 'Solicitudes', icon: 'inbox' },
				]
