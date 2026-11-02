import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { useConfirmWriteOff } from '@/hooks/retirements/use_retirements'
import type { Asset } from '@/types/asset_type'
import type { Retirement } from '@/types/custody_type'
import { shortDate } from '@/utils/dates'
import { money } from '@/utils/folio'

export function AccountingCard({
	asset,
	retirement,
}: {
	asset: Asset
	retirement?: Retirement
}) {
	const confirm = useConfirmWriteOff()
	return (
		<div className='card stack'>
			<h2 className='h4'>Baja contable</h2>
			<p className='muted'>
				IT ya revisó el equipo. Al confirmar, el activo sale de los libros y IT
				puede postularlo a El Trueque.
			</p>
			<dl className='facts'>
				<div>
					<dt>Valor de compra</dt>
					<dd>{asset.value ? money(asset.value) : '—'}</dd>
				</div>
				<div>
					<dt>Comprado</dt>
					<dd>{asset.purchasedOn ? shortDate(asset.purchasedOn) : '—'}</dd>
				</div>
				{retirement && (
					<div>
						<dt>Motivo de IT</dt>
						<dd>{retirement.reason}</dd>
					</div>
				)}
			</dl>
			<button
				className='btn btn--primary'
				type='button'
				disabled={confirm.isPending}
				onClick={() =>
					confirm.mutate(asset.id, {
						onSuccess: () => toast.success('Baja del activo confirmada'),
						onError: e => toast.error(e.message),
					})
				}>
				{confirm.isPending ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					<Icon name='calc' />
				)}
				Confirmar baja del activo
			</button>
		</div>
	)
}
