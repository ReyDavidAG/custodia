import { Link } from 'react-router'

import { Icon, type IconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import type { AssetEvent, EventKind, PersonLite } from '@/types/asset_type'
import { shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

const KIND: Record<EventKind, [string, IconName]> = {
	in: ['Entró al almacén', 'box'],
	handover: ['Entregado', 'send'],
	return: ['Devuelto', 'inbox'],
	repair: ['A reparación', 'wrench'],
	repaired: ['Salió de reparación', 'check'],
	retire: ['IT lo dio de baja', 'archive'],
	accounting: ['Contabilidad dio la baja del activo', 'calc'],
	trueque: ['Postulado a El Trueque', 'store'],
	disposed: ['Salió del inventario', 'x'],
}

export function Timeline({
	events,
	people,
}: {
	events: AssetEvent[]
	people: Map<string, PersonLite>
}) {
	if (!events.length) return <p className='muted'>Sin movimientos todavía.</p>
	return (
		<ol className='timeline' role='list'>
			{events.map((e, i) => {
				const [label, icon] = KIND[e.kind]
				const who = e.personId ? people.get(e.personId) : undefined
				return (
					<li
						key={e.id}
						className='timeline__item animate-row-in'
						data-kind={e.kind}
						style={stagger(i)}>
						<span className='timeline__dot'>
							<Icon name={icon} />
						</span>
						<span className='timeline__body'>
							<b>
								{label}
								{who ? ` · ${who.fullName}` : ''}
							</b>
							<small>
								{shortDate(e.createdAt)}
								{e.custodyFolio && (
									<>
										{' · '}
										<Link className='num' to={ROUTES.letter(e.custodyFolio)}>
											{e.custodyFolio}
										</Link>
									</>
								)}
								{e.note ? ` · ${e.note}` : ''}
							</small>
						</span>
					</li>
				)
			})}
		</ol>
	)
}
