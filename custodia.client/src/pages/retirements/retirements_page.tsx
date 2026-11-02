import { useMemo } from 'react'
import { Link } from 'react-router'

import { Icon, isIconName } from '@/components/ui/icon'
import { DemoNote, ErrorState, TagSkeletons } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useAssets } from '@/hooks/assets/use_assets'
import { useRetirements } from '@/hooks/retirements/use_retirements'
import type { Asset } from '@/types/asset_type'
import type { Retirement } from '@/types/custody_type'
import { shortDate } from '@/utils/dates'
import { money } from '@/utils/folio'
import { stagger } from '@/utils/stagger'

type Row = { asset: Asset; retirement: Retirement }

function Rows({ rows, act }: { rows: Row[]; act: boolean }) {
	return (
		<ul className='reqs' role='list'>
			{rows.map(({ asset: a, retirement: r }, i) => (
				<li key={a.id} className='req animate-row-in' style={stagger(i)}>
					<div className='req__head'>
						<span className='num folio'>{a.folio}</span>
						<span className='muted small'>
							{shortDate(r.accountingAt ?? r.itAt)}
						</span>
					</div>
					<p className='req__what'>
						<Icon name={isIconName(a.icon) ? a.icon : 'box'} />
						<b>
							{[a.brand, a.model].filter(Boolean).join(' ') || a.name}
						</b> · {a.value ? money(a.value) : 'sin valor'} · comprado{' '}
						{a.purchasedOn ? shortDate(a.purchasedOn) : '—'}
					</p>
					<p className='req__why'>{r.reason}</p>
					{act && (
						<div className='req__actions'>
							<Link
								className='btn btn--primary btn--sm'
								to={ROUTES.assetRetire(a.folio)}>
								<Icon name='calc' />
								Revisar y confirmar
							</Link>
						</div>
					)}
				</li>
			))}
		</ul>
	)
}

export default function RetirementsPage() {
	const assets = useAssets()
	const retirements = useRetirements()
	const rows = useMemo(() => {
		const byId = new Map((assets.data ?? []).map(a => [a.id, a]))
		return (retirements.data ?? []).flatMap(r => {
			const asset = byId.get(r.assetId)
			return asset ? [{ asset, retirement: r }] : []
		})
	}, [assets.data, retirements.data])
	const queue = rows.filter(r => !r.retirement.accountingAt)
	const done = rows.filter(r => r.retirement.accountingAt)
	const error = assets.error ?? retirements.error

	return (
		<div className='wrap narrow'>
			<header className='page-head'>
				<p className='kicker'>Contabilidad</p>
				<h1 className='h1'>Bajas por confirmar</h1>
				<p className='lede'>
					IT ya revisó estos equipos. Falta sacarlos de los libros.
				</p>
			</header>
			{assets.isPending || retirements.isPending ? (
				<TagSkeletons count={2} />
			) : error ? (
				<ErrorState
					message={error.message}
					onRetry={() =>
						void Promise.all([assets.refetch(), retirements.refetch()])
					}
				/>
			) : (
				<>
					<section className='section'>
						<div className='section__head'>
							<h2 className='h3'>Pendientes · {queue.length}</h2>
						</div>
						{queue.length ? (
							<Rows rows={queue} act />
						) : (
							<p className='muted'>Todo al día.</p>
						)}
					</section>
					<section className='section'>
						<div className='section__head'>
							<h2 className='h3'>Ya confirmadas</h2>
						</div>
						{done.length ? (
							<Rows rows={done} act={false} />
						) : (
							<p className='muted'>Ninguna todavía.</p>
						)}
					</section>
				</>
			)}
			<DemoNote>Valores de prueba.</DemoNote>
		</div>
	)
}
