import { Link, useParams } from 'react-router'

import { AccountingCard } from '@/components/retirements/accounting_card'
import { ItReviewForm } from '@/components/retirements/it_review_form'
import { Stepper } from '@/components/retirements/stepper'
import { TruequeForm } from '@/components/retirements/trueque_form'
import { Icon, type IconName } from '@/components/ui/icon'
import { TagSkeletons } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useAsset } from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'
import {
	useRetirements,
	useSuggested,
} from '@/hooks/retirements/use_retirements'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { cn } from '@/utils/cn'

function Hint({
	icon,
	tone,
	children,
}: {
	icon: IconName
	tone?: 'warn' | 'ok'
	children: string
}) {
	return (
		<p className={cn('hint', tone && `is-${tone}`)}>
			<Icon name={icon} />
			<span>{children}</span>
		</p>
	)
}

export default function RetirePage() {
	const { folio = '' } = useParams()
	const { role } = useRequiredSession()
	const { asset, isPending } = useAsset(folio)
	const retirements = useRetirements()
	const retirement = retirements.data?.find(r => r.assetId === asset?.id)
	const booked = !!retirement?.accountingAt
	const suggested = useSuggested(
		asset?.id,
		role === 'it' && asset?.status === 'retired' && booked
	)

	if (isPending || retirements.isPending)
		return (
			<div className='wrap narrow'>
				<TagSkeletons count={1} />
			</div>
		)
	if (!asset) return <NotFoundPage />

	const open = asset.status === 'stock' || asset.status === 'repair'
	const done: [boolean, boolean, boolean] = [
		!!retirement,
		booked,
		asset.status === 'trueque' || asset.status === 'disposed',
	]

	const body = open ? (
		role === 'it' ? (
			<ItReviewForm assetId={asset.id} />
		) : (
			<Hint icon='info'>La baja la empieza soporte de IT.</Hint>
		)
	) : asset.status === 'retired' && !booked ? (
		role === 'accounting' ? (
			<AccountingCard asset={asset} retirement={retirement} />
		) : (
			<Hint icon='clock' tone='warn'>
				Esperando a contabilidad para dar la baja del activo.
			</Hint>
		)
	) : asset.status === 'retired' ? (
		role === 'it' ? (
			suggested.data !== undefined ? (
				<TruequeForm asset={asset} suggested={suggested.data} />
			) : (
				<p className='muted'>Calculando el precio sugerido…</p>
			)
		) : (
			<Hint icon='info'>
				Baja completa. IT decide si se postula a El Trueque.
			</Hint>
		)
	) : asset.status === 'trueque' ? (
		<Hint icon='store' tone='ok'>
			Ya está en El Trueque. RH revisa el precio y, cuando alguien lo cambie, IT
			lo entrega con el cupón.
		</Hint>
	) : (
		<Hint icon='info'>Este equipo no está en proceso de baja.</Hint>
	)

	return (
		<div className='wrap narrow'>
			<Link className='back-link' to={ROUTES.asset(asset.folio)}>
				<Icon name='arrowLeft' />
				{asset.folio}
			</Link>
			<header className='page-head'>
				<h1 className='h1'>
					Baja de{' '}
					{[asset.brand, asset.model].filter(Boolean).join(' ') || asset.name}
				</h1>
				<p className='lede'>
					Tres pasos y ninguno se salta: así un equipo no sale de la empresa con
					datos ni sigue cobrando en los libros.
				</p>
			</header>
			<Stepper done={done} />
			{body}
		</div>
	)
}
