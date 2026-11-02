import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import * as Popover from '@radix-ui/react-popover'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { HOME, ROUTES } from '@/constants/routes'
import { ROLE_NAMES } from '@/constants/status'
import { useRequiredSession, useSession } from '@/hooks/auth/use_session'
import { initials } from '@/utils/initials'

export function UserMenu() {
	const session = useRequiredSession()
	const { signOut } = useSession()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const { person, role } = session

	const leave = async () => {
		setOpen(false)
		await signOut()
		toast('Saliste de Custodia')
		navigate(ROUTES.signIn, { replace: true })
	}

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<button
					className='role-chip'
					type='button'
					aria-label={`Menú de ${person.fullName}`}>
					<span className='avatar is-xs' aria-hidden='true'>
						{initials(person.fullName)}
					</span>
					<span className='role-chip__label'>{ROLE_NAMES[role]}</span>
					<Icon name='chevronDown' />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className='menu'
					align='end'
					sideOffset={10}
					collisionPadding={12}>
					<div className='menu__head'>
						<span className='avatar' aria-hidden='true'>
							{initials(person.fullName)}
						</span>
						<span>
							<strong>{person.fullName}</strong>
							<small>
								{person.departmentName ?? person.areaName} · No.{' '}
								<span className='num'>{person.employeeNumber}</span>
							</small>
						</span>
					</div>
					<Link
						className='menu-item'
						to={HOME[role]}
						onClick={() => setOpen(false)}>
						<Icon
							name={
								role === 'member' ? 'laptop' : role === 'it' ? 'box' : 'calc'
							}
						/>
						{role === 'member'
							? 'Mi equipo'
							: role === 'it'
								? 'Inventario'
								: 'Bajas por confirmar'}
					</Link>
					<button className='menu-item' type='button' onClick={leave}>
						<Icon name='logout' />
						Salir
					</button>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
