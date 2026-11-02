import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { useProposeToTrueque } from '@/hooks/retirements/use_retirements'
import {
	type TruequePriceForm,
	truequePriceSchema,
} from '@/schemas/retirements/trueque/trueque_price.schema'
import type { Asset } from '@/types/asset_type'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'
import { money } from '@/utils/folio'

export function TruequeForm({
	asset,
	suggested,
}: {
	asset: Asset
	suggested: number
}) {
	const propose = useProposeToTrueque()
	const { register, handleSubmit, control, formState } =
		useForm<TruequePriceForm>({
			resolver: zodResolver(truequePriceSchema),
			defaultValues: { price: String(suggested) },
		})
	const price = useWatch({ control, name: 'price' })
	const error = formState.errors.price?.message

	const submit = handleSubmit(v =>
		propose.mutate(
			{ assetId: asset.id, price: Number(v.price) },
			{
				onSuccess: () =>
					toast.success('Mandado a El Trueque: RH revisa el precio'),
				onError: e => toast.error(e.message),
			}
		)
	)

	return (
		<form className='card stack trueque' noValidate onSubmit={submit}>
			<h2 className='h4'>
				<Icon name='store' />
				Postular a El Trueque
			</h2>
			<p className='muted small'>
				Precio sugerido según valor de compra (
				{asset.value ? money(asset.value) : '—'}) y antigüedad (
				{asset.purchasedOn ? shortDate(asset.purchasedOn) : '—'}). RH lo revisa
				antes de publicarlo.
			</p>
			<div className='field'>
				<label htmlFor='trueque-price'>Precio en cacaos</label>
				<input
					id='trueque-price'
					className={cn('input num', error && 'animate-nudge')}
					inputMode='numeric'
					aria-invalid={!!error}
					aria-describedby='trueque-help'
					{...register('price', {
						onChange: e => (e.target.value = e.target.value.replace(/\D/g, '')),
					})}
				/>
				<p className={cn('field__help', error && 'is-error')} id='trueque-help'>
					{error ?? 'Sugerido por Custodia; puedes ajustarlo.'}
				</p>
			</div>
			<button
				className='btn btn--cacao'
				type='submit'
				disabled={propose.isPending}>
				{propose.isPending && <span className='spinner' aria-hidden='true' />}
				<span>Postular por {price || '0'} cacaos</span>
			</button>
		</form>
	)
}
