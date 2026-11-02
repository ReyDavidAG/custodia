import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ChipRadios } from '@/components/ui/chip_radios'
import { Icon, isIconName } from '@/components/ui/icon'
import { useCreateRequest } from '@/hooks/requests/use_requests'
import {
	type NewRequestForm,
	newRequestSchema,
} from '@/schemas/requests/new/new_request.schema'
import type { AssetType } from '@/types/asset_type'
import { cn } from '@/utils/cn'

export function RequestForm({ types }: { types: AssetType[] }) {
	const create = useCreateRequest()
	const options = useMemo(
		() =>
			types.map(
				t =>
					[
						t.id,
						t.name,
						<Icon key={t.id} name={isIconName(t.icon) ? t.icon : 'box'} />,
					] as const
			),
		[types]
	)
	const { register, control, handleSubmit, reset, formState } =
		useForm<NewRequestForm>({
			resolver: zodResolver(newRequestSchema),
			defaultValues: { typeId: types[0]?.id ?? '', reason: '' },
		})
	const e = formState.errors

	const submit = handleSubmit(v => {
		const type = types.find(t => t.id === v.typeId)
		if (!type) return
		create.mutate(
			{ typeId: type.id, assetAreaId: type.assetAreaId, reason: v.reason },
			{
				onSuccess: folio => {
					toast.success(`Solicitud ${folio} enviada a soporte de IT`)
					reset({ typeId: v.typeId, reason: '' })
				},
				onError: err => toast.error(err.message),
			}
		)
	})

	return (
		<form className='card stack' noValidate onSubmit={submit}>
			<h2 className='h4'>Pedir equipo</h2>
			<fieldset className='field'>
				<legend>Qué necesitas</legend>
				<Controller
					control={control}
					name='typeId'
					render={({ field }) => (
						<ChipRadios
							name='type'
							label='Qué necesitas'
							value={field.value}
							options={options}
							onChange={field.onChange}
						/>
					)}
				/>
			</fieldset>
			<div className='field'>
				<label htmlFor='request-reason'>Para qué</label>
				<textarea
					id='request-reason'
					className={cn('input input--area', e.reason && 'animate-nudge')}
					rows={3}
					maxLength={300}
					placeholder='Cuéntale a IT para qué lo necesitas'
					aria-invalid={!!e.reason}
					aria-describedby='request-help'
					{...register('reason')}
				/>
				<p
					className={cn('field__help', e.reason && 'is-error')}
					id='request-help'>
					{e.reason?.message ??
						e.typeId?.message ??
						'Con una razón clara se aprueba más rápido.'}
				</p>
			</div>
			<button
				className='btn btn--primary'
				type='submit'
				disabled={create.isPending}>
				{create.isPending ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					<Icon name='send' />
				)}
				Mandar solicitud
			</button>
		</form>
	)
}
