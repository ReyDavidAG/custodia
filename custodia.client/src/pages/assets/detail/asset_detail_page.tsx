import { Link, useParams } from 'react-router'

import { AssetActions } from '@/components/assets/asset_actions'
import { AssetTag } from '@/components/assets/asset_tag'
import { HolderCard } from '@/components/assets/holder_card'
import { Timeline } from '@/components/assets/timeline'
import { Icon } from '@/components/ui/icon'
import { ErrorState, TagSkeletons } from '@/components/ui/state_views'
import { HOME } from '@/constants/routes'
import {
	useAsset,
	useEvents,
	useParts,
	usePersonMap,
} from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useRetirements } from '@/hooks/retirements/use_retirements'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { shortDate } from '@/utils/dates'
import { money } from '@/utils/folio'

export default function AssetDetailPage() {
	const { folio = '' } = useParams()
	const { role } = useRequiredSession()
	const { asset, isPending, error, refetch } = useAsset(folio)
	const parts = useParts(asset?.id)
	const events = useEvents(asset?.id)
	const people = usePersonMap()
	const retirements = useRetirements()

	if (isPending)
		return (
			<div className='wrap'>
				<TagSkeletons count={1} />
			</div>
		)
	if (error)
		return (
			<div className='wrap'>
				<ErrorState message={error.message} onRetry={() => void refetch()} />
			</div>
		)
	if (!asset) return <NotFoundPage />

	const holder = asset.holderId ? people.get(asset.holderId) : undefined
	const waiting = !!retirements.data?.some(
		r => r.assetId === asset.id && !r.accountingAt
	)
	const today = new Date().toISOString().slice(0, 10)
	const facts = [
		[
			'Marca y modelo',
			[asset.brand, asset.model].filter(Boolean).join(' ') || '—',
		],
		['Serie', asset.serial ?? '—'],
		['Compra', asset.purchasedOn ? shortDate(asset.purchasedOn) : '—'],
		[
			'Garantía',
			asset.warrantyUntil && asset.warrantyUntil >= today
				? `Hasta ${shortDate(asset.warrantyUntil)}`
				: 'Sin garantía',
		],
		['Valor de compra', asset.value ? money(asset.value) : '—'],
		['Accesorios', parts.data?.length ? parts.data.join(', ') : 'Ninguno'],
	]

	return (
		<div className='wrap'>
			<Link className='back-link' to={HOME[role]}>
				<Icon name='arrowLeft' />
				{role === 'member'
					? 'Mi equipo'
					: role === 'it'
						? 'Inventario'
						: 'Bajas'}
			</Link>
			<div className='asset'>
				<div className='asset__side'>
					<AssetTag asset={asset} holder={holder} link={false} big />
					<AssetActions asset={asset} role={role} waitingAccounting={waiting} />
				</div>
				<div className='asset__main'>
					<section className='card'>
						<h2 className='h4'>Ficha</h2>
						<dl className='facts'>
							{facts.map(([k, v]) => (
								<div key={k}>
									<dt>{k}</dt>
									<dd>{v}</dd>
								</div>
							))}
						</dl>
					</section>
					{holder && <HolderCard person={holder} folio={asset.custodyFolio} />}
					<section className='card'>
						<h2 className='h4'>Historial de custodia</h2>
						{events.isPending ? (
							<p className='muted'>Cargando…</p>
						) : (
							<Timeline events={events.data ?? []} people={people} />
						)}
					</section>
				</div>
			</div>
		</div>
	)
}
