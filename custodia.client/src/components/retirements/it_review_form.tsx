import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { useRetire } from '@/hooks/retirements/use_retirements'
import {
	type RetireForm,
	retireSchema,
} from '@/schemas/retirements/retire/retire.schema'
import { cn } from '@/utils/cn'

const CHECKS = [
	['dataWiped', 'Los datos están borrados (formateo seguro)'],
	['accountsRemoved', 'Se retiraron cuentas y licencias del equipo'],
	['partsSeparated', 'Se separaron los accesorios que siguen sirviendo'],
] as const

export function ItReviewForm({ assetId }: { assetId: string }) {
	const retire = useRetire()
	const { register, handleSubmit, formState } = useForm<RetireForm>({
		resolver: zodResolver(retireSchema),
		defaultValues: {
			dataWiped: false,
			accountsRemoved: false,
			partsSeparated: false,
			reason: '',
		},
	})
	const firstError = CHECKS.map(([k]) => formState.errors[k]?.message).find(
		Boolean
	)

	const submit = handleSubmit(v =>
		retire.mutate(
			{ assetId, ...v, reason: v.reason || 'Fin de vida útil' },
			{
				onSuccess: () =>
					toast.success('Dado de baja por IT; avisamos a contabilidad'),
				onError: e => toast.error(e.message),
			}
		)
	)

	return (
		<form className='card stack' noValidate onSubmit={submit}>
			<h2 className='h4'>Revisión de IT</h2>
			<div className={cn('picks', firstError && 'animate-nudge')}>
				{CHECKS.map(([k, label]) => (
					<label key={k} className='pick'>
						<input type='checkbox' {...register(k)} />
						<span className='pick__text'>
							<b>{label}</b>
						</span>
						<Icon name='check' className='pick__check' />
					</label>
				))}
			</div>
			{firstError && <p className='field__help is-error'>{firstError}</p>}
			<div className='field'>
				<label htmlFor='retire-reason'>Motivo</label>
				<input
					id='retire-reason'
					className='input'
					maxLength={120}
					placeholder='Ej. batería que ya no carga, pantalla con pixeles muertos'
					{...register('reason')}
				/>
			</div>
			<button
				className='btn btn--primary'
				type='submit'
				disabled={retire.isPending}>
				{retire.isPending ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					<Icon name='archive' />
				)}
				Dar de baja
			</button>
		</form>
	)
}
