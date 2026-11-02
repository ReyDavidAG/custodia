import { Link } from 'react-router'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useSetRepair } from '@/hooks/assets/use_assets'
import type { Asset } from '@/types/asset_type'
import type { Role } from '@/types/session_type'
import { cn } from '@/utils/cn'

export function AssetActions({
	asset,
	role,
	waitingAccounting,
}: {
	asset: Asset
	role: Role
	waitingAccounting: boolean
}) {
	const repair = useSetRepair()
	const it = role === 'it'
	const toggleRepair = () =>
		repair.mutate(
			{ assetId: asset.id, inRepair: asset.status !== 'repair', note: null },
			{
				onSuccess: () =>
					toast(
						asset.status === 'repair'
							? 'De vuelta en el almacén'
							: 'Mandado a reparación'
					),
				onError: e => toast.error(e.message),
			}
		)

	return (
		<div className='asset__actions'>
			{it && asset.status === 'stock' && (
				<Link
					className='btn btn--primary btn--block'
					to={`${ROUTES.handover}?asset=${asset.folio}`}>
					<Icon name='send' />
					Entregar a alguien
				</Link>
			)}
			{it && asset.status === 'assigned' && (
				<Link
					className='btn btn--primary btn--block'
					to={ROUTES.assetReturn(asset.folio)}>
					<Icon name='inbox' />
					Recibir devolución
				</Link>
			)}
			{it && (asset.status === 'stock' || asset.status === 'repair') && (
				<>
					<button
						className='btn btn--block'
						type='button'
						disabled={repair.isPending}
						onClick={toggleRepair}>
						<Icon name={asset.status === 'repair' ? 'check' : 'wrench'} />
						{asset.status === 'repair'
							? 'Ya quedó: al almacén'
							: 'Mandar a reparación'}
					</button>
					<Link className='btn btn--block' to={ROUTES.assetRetire(asset.folio)}>
						<Icon name='archive' />
						Dar de baja
					</Link>
				</>
			)}
			{asset.status === 'retired' && role !== 'member' && (
				<Link
					className={cn(
						'btn btn--block',
						role === 'accounting' && waitingAccounting && 'btn--primary'
					)}
					to={ROUTES.assetRetire(asset.folio)}>
					<Icon name='archive' />
					Ver la baja
				</Link>
			)}
			{asset.status === 'trueque' && (
				<p className='hint'>
					<Icon name='store' />
					<span>
						Postulado a El Trueque. Cuando alguien lo cambie, IT lo entrega con
						el cupón.
					</span>
				</p>
			)}
		</div>
	)
}
