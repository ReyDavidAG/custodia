import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Icon } from '@/components/ui/icon'
import {
	type EmployeeNumberForm,
	employeeNumberSchema,
} from '@/schemas/auth/sign_in/employee_number.schema'
import { cn } from '@/utils/cn'

interface Props {
	defaultValue: string
	serverError: string | null
	onSubmit: (employeeNumber: string) => Promise<void>
}

export function NumberStep({ defaultValue, serverError, onSubmit }: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<EmployeeNumberForm>({
		resolver: zodResolver(employeeNumberSchema),
		defaultValues: { employeeNumber: defaultValue },
	})
	const error = errors.employeeNumber?.message ?? serverError

	return (
		<form
			className='signin__card animate-page-in'
			noValidate
			onSubmit={handleSubmit(v => onSubmit(v.employeeNumber))}>
			<h2 className='h2'>Entra con tu número</h2>
			<p className='muted'>El mismo de tu gafete.</p>
			<div className='field'>
				<label htmlFor='employee-number'>Número de trabajador</label>
				<input
					id='employee-number'
					className={cn('input input--number num', error && 'animate-nudge')}
					inputMode='numeric'
					autoComplete='off'
					maxLength={10}
					placeholder='00000'
					autoFocus
					aria-invalid={Boolean(error)}
					aria-describedby='number-help'
					{...register('employeeNumber', {
						onChange: e => (e.target.value = e.target.value.replace(/\D/g, '')),
					})}
				/>
				<p className={cn('field__help', error && 'is-error')} id='number-help'>
					{error ?? 'Mínimo 5 dígitos, sólo números.'}
				</p>
			</div>
			<button
				className='btn btn--primary btn--lg btn--block'
				type='submit'
				disabled={isSubmitting}>
				{isSubmitting ? <span className='spinner' aria-hidden='true' /> : null}
				{isSubmitting ? 'Buscando…' : 'Continuar'}
				{!isSubmitting && <Icon name='arrowRight' />}
			</button>
			<p className='signin__demo'>
				<Icon name='info' />
				<span>
					Versión de demostración: entras sólo con tu número, el mismo de
					Chispa.
				</span>
			</p>
		</form>
	)
}
