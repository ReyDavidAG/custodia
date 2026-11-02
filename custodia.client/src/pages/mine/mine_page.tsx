import { useMemo } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { AssetTag } from '@/components/assets/asset_tag'
import { Icon } from '@/components/ui/icon'
import {
	EmptyState,
	ErrorState,
	TagSkeletons,
} from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useAssets } from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'

export default function MinePage() {
	const { person } = useRequiredSession()
	const assets = useAssets()
	const mine = useMemo(
		() => (assets.data ?? []).filter(a => a.holderId === person.id),
		[assets.data, person.id]
	)
	const letters = useMemo(
		() => [...new Set(mine.map(a => a.custodyFolio).filter(f => f !== null))],
		[mine]
	)

	return (
		<div className='wrap'>
			<header className='page-head page-head--row'>
				<div>
					<h1 className='h1'>Mi equipo</h1>
					<p className='lede'>
						Lo que tienes a tu nombre. Si algo falla, avísale a IT desde aquí.
					</p>
				</div>
				<Link className='btn btn--primary' to={ROUTES.requests}>
					<Icon name='plus' />
					Pedir equipo
				</Link>
			</header>
			{assets.isPending ? (
				<TagSkeletons count={3} />
			) : assets.error ? (
				<ErrorState
					message={assets.error.message}
					onRetry={() => void assets.refetch()}
				/>
			) : mine.length ? (
				<>
					<div className='atags'>
						{mine.map((a, i) => (
							<AssetTag key={a.id} asset={a} holder={person} index={i} />
						))}
					</div>
					<div className='doc-links'>
						{letters.map(f => (
							<Link key={f} className='doc-link' to={ROUTES.letter(f)}>
								<Icon name='file' />
								<span>
									Tu carta de resguardo <b className='num'>{f}</b>
								</span>
								<Icon name='arrowRight' />
							</Link>
						))}
					</div>
					<button
						className='btn btn--ghost'
						type='button'
						onClick={() =>
							toast(
								'Para reportar una falla, pide equipo de reemplazo en Solicitudes y cuéntale a IT qué pasa'
							)
						}>
						<Icon name='wrench' />
						Reportar una falla
					</button>
				</>
			) : (
				<EmptyState
					title='No tienes equipo a tu nombre'
					body='Si lo necesitas para tu trabajo, pídelo y soporte de IT lo revisa.'
					action={
						<Link className='btn btn--primary' to={ROUTES.requests}>
							Pedir equipo
						</Link>
					}
				/>
			)}
		</div>
	)
}
