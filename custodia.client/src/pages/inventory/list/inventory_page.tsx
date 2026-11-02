import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { AssetTag } from '@/components/assets/asset_tag'
import { Kpis } from '@/components/inventory/kpis'
import { ChipRadios } from '@/components/ui/chip_radios'
import { Icon } from '@/components/ui/icon'
import { SearchBox } from '@/components/ui/search_box'
import {
	DemoNote,
	EmptyState,
	ErrorState,
	TagSkeletons,
} from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { ASSET_STATUSES, STATUS_LABELS } from '@/constants/status'
import { useAssets, usePersonMap, useTypes } from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useDebounced } from '@/hooks/ui/use_debounced'
import type { AssetStatus } from '@/types/asset_type'
import { matches, words } from '@/utils/text'

const STATUS_OPTIONS = [
	['all', 'Cualquier estado'] as const,
	...ASSET_STATUSES.map(s => [s, STATUS_LABELS[s]] as const),
]

export default function InventoryPage() {
	const { role } = useRequiredSession()
	const assets = useAssets()
	const types = useTypes()
	const people = usePersonMap()
	const [q, setQ] = useState('')
	const [type, setType] = useState('all')
	const [status, setStatus] = useState<'all' | AssetStatus>('all')
	const query = useDebounced(q)

	const typeOptions = useMemo(
		() => [
			['all', 'Todos'] as const,
			...(types.data ?? []).map(t => [t.id, t.name] as const),
		],
		[types.data]
	)

	const list = useMemo(() => {
		const terms = words(query)
		return (assets.data ?? []).filter(a => {
			if (type !== 'all' && a.typeId !== type) return false
			if (status !== 'all' && a.status !== status) return false
			if (!terms.length) return true
			const holder = a.holderId ? (people.get(a.holderId)?.fullName ?? '') : ''
			return matches(
				`${a.folio} ${a.name} ${a.brand ?? ''} ${a.model ?? ''} ${a.serial ?? ''} ${holder} ${a.typeName}`,
				terms
			)
		})
	}, [assets.data, people, query, type, status])

	return (
		<div className='wrap'>
			<header className='page-head page-head--row'>
				<div>
					<p className='kicker'>Equipo y licencias</p>
					<h1 className='h1'>Inventario</h1>
				</div>
				{role === 'it' && (
					<Link className='btn btn--primary' to={ROUTES.handover}>
						<Icon name='plus' />
						Nueva entrega
					</Link>
				)}
			</header>
			{assets.data && <Kpis assets={assets.data} />}
			<div className='tools'>
				<SearchBox
					label='Buscar'
					placeholder='Folio, serie o persona'
					value={q}
					onChange={setQ}
				/>
				<ChipRadios
					name='type'
					label='Tipo'
					value={type}
					options={typeOptions}
					onChange={setType}
				/>
				<ChipRadios
					name='status'
					label='Estado'
					value={status}
					options={STATUS_OPTIONS}
					onChange={setStatus}
				/>
			</div>
			{assets.isPending ? (
				<TagSkeletons />
			) : assets.error ? (
				<ErrorState
					message={assets.error.message}
					onRetry={() => void assets.refetch()}
				/>
			) : list.length ? (
				<>
					<p className='count muted small' aria-live='polite'>
						{list.length} de {assets.data.length} equipos
					</p>
					<div className='atags'>
						{list.map((a, i) => (
							<AssetTag
								key={a.id}
								asset={a}
								holder={a.holderId ? people.get(a.holderId) : undefined}
								index={i}
							/>
						))}
					</div>
				</>
			) : (
				<EmptyState
					title='Nada coincide'
					body='Prueba con el folio, la serie o el nombre de quien lo tiene.'
				/>
			)}
			<DemoNote>Equipos y personas de prueba.</DemoNote>
		</div>
	)
}
