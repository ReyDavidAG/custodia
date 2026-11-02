import { useEffect, useRef, useState } from 'react'

import { ROLE_NAMES } from '@/constants/status'
import type { Session } from '@/types/session_type'
import { initials } from '@/utils/initials'

interface Props {
	session: Session
	onConfirm: () => void
	onBack: () => void
}

export function ConfirmStep({ session, onConfirm, onBack }: Props) {
	const { person } = session
	const ref = useRef<HTMLButtonElement>(null)
	const [entering, setEntering] = useState(false)
	useEffect(() => ref.current?.focus(), [])

	return (
		<div className='signin__card animate-page-in'>
			<h2 className='h2'>¿Eres tú?</h2>
			<div className='who'>
				<span className='avatar is-lg' aria-hidden='true'>
					{initials(person.fullName)}
				</span>
				<span className='who__text'>
					<strong>{person.fullName}</strong>
					<span>{ROLE_NAMES[session.role]}</span>
					<span className='muted'>
						{person.departmentName ?? person.areaName} · No.{' '}
						<span className='num'>{person.employeeNumber}</span>
					</span>
				</span>
			</div>
			<button
				ref={ref}
				className='btn btn--primary btn--lg btn--block'
				type='button'
				disabled={entering}
				onClick={() => {
					setEntering(true)
					onConfirm()
				}}>
				{entering ? <span className='spinner' aria-hidden='true' /> : null}
				{entering ? 'Entrando…' : 'Sí, entrar'}
			</button>
			<button
				className='btn btn--ghost btn--block'
				type='button'
				onClick={onBack}>
				No soy yo
			</button>
		</div>
	)
}
