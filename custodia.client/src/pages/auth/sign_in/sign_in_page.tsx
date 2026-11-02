import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { ConfirmStep } from '@/components/auth/confirm_step'
import { NumberStep } from '@/components/auth/number_step'
import { Desk, Wordmark } from '@/components/ui/art'
import { HOME } from '@/constants/routes'
import { useSession } from '@/hooks/auth/use_session'
import type { Session } from '@/types/session_type'

export default function SignInPage() {
	const { session, signIn, confirm, signOut } = useSession()
	const navigate = useNavigate()
	const [pending, setPending] = useState<Session | null>(null)
	const [number, setNumber] = useState('')
	const [error, setError] = useState<string | null>(null)

	if (session && !pending) return <Navigate to={HOME[session.role]} replace />

	const lookUp = async (employeeNumber: string) => {
		setNumber(employeeNumber)
		setError(null)
		try {
			setPending(await signIn(employeeNumber))
		} catch (e) {
			setError(e instanceof Error ? e.message : 'No se pudo entrar.')
		}
	}

	const enter = () => {
		if (!pending) return
		confirm(pending)
		navigate(HOME[pending.role], { replace: true })
	}

	const back = async () => {
		await signOut()
		setPending(null)
	}

	return (
		<div className='signin'>
			<section className='signin__story'>
				<span className='signin__brand'>
					<Wordmark />
				</span>
				<h1 className='display'>Cada equipo, con nombre y firma.</h1>
				<p className='lede'>
					Qué tiene la empresa, quién lo tiene, desde cuándo y con qué
					evidencia. Sin hojas sueltas ni fotos perdidas en el chat.
				</p>
			</section>
			<section className='signin__panel'>
				{pending ? (
					<ConfirmStep session={pending} onConfirm={enter} onBack={back} />
				) : (
					<NumberStep
						defaultValue={number}
						serverError={error}
						onSubmit={lookUp}
					/>
				)}
			</section>
			<div className='signin__scene'>
				<Desk />
			</div>
		</div>
	)
}
