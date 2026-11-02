import { memo } from 'react'

import type { Asset } from '@/types/asset_type'

export const Kpis = memo(function Kpis({ assets }: { assets: Asset[] }) {
	const n = (...s: Asset['status'][]) =>
		assets.filter(a => s.includes(a.status)).length
	const items = [
		['Asignados', n('assigned'), 'assigned'],
		['En almacén', n('stock'), 'stock'],
		['En reparación', n('repair'), 'repair'],
		['Dados de baja', n('retired', 'trueque'), 'retired'],
	] as const
	return (
		<dl className='kpis'>
			{items.map(([label, value, status]) => (
				<div key={status} className='kpi' data-status={status}>
					<dt>{label}</dt>
					<dd className='num'>{value}</dd>
				</div>
			))}
		</dl>
	)
})
