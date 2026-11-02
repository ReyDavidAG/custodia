import { memo } from 'react'
import { Link } from 'react-router'

import { Barcode } from '@/components/ui/art'
import { Icon, isIconName } from '@/components/ui/icon'
import { StatusPill } from '@/components/ui/status_pill'
import { ROUTES } from '@/constants/routes'
import type { Asset, PersonLite } from '@/types/asset_type'
import { cn } from '@/utils/cn'
import { stagger } from '@/utils/stagger'

interface Props {
	asset: Asset
	holder?: PersonLite
	index?: number
	big?: boolean
	link?: boolean
}

export const AssetTag = memo(function AssetTag({
	asset,
	holder,
	index = 0,
	big = false,
	link = true,
}: Props) {
	const body = (
		<>
			<span className='atag__hole' aria-hidden='true' />
			<span className='atag__head'>
				<span className='atag__type'>
					<Icon name={isIconName(asset.icon) ? asset.icon : 'box'} />
					{asset.typeName}
				</span>
				<StatusPill status={asset.status} />
			</span>
			<span className='atag__folio num'>{asset.folio}</span>
			<span className='atag__model'>
				{[asset.brand, asset.model].filter(Boolean).join(' ') || asset.name}
			</span>
			<Barcode text={asset.folio} className='atag__bars' />
			<span className='atag__foot'>
				{holder ? (
					<>
						<Icon name='user' />
						<span>{holder.fullName}</span>
					</>
				) : (
					<span className='muted'>
						{asset.status === 'stock' ? 'Disponible' : 'Sin persona'}
					</span>
				)}
				<span className='num muted'>{asset.serial ?? '—'}</span>
			</span>
		</>
	)
	const cls = cn('atag animate-tile-in', big && 'atag--big')
	return link ? (
		<Link
			className={cls}
			data-status={asset.status}
			to={ROUTES.asset(asset.folio)}
			style={stagger(index)}>
			{body}
		</Link>
	) : (
		<div className={cls} data-status={asset.status} style={stagger(index)}>
			{body}
		</div>
	)
})
