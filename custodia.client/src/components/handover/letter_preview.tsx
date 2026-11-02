import { memo } from 'react'

import type { Asset, PersonLite } from '@/types/asset_type'
import { shortDate } from '@/utils/dates'

export const TERMS =
	'Me comprometo a cuidar el equipo, usarlo para mi trabajo y devolverlo completo cuando me lo pidan o deje la empresa.'

export const LetterPreview = memo(function LetterPreview({
	person,
	assets,
}: {
	person?: PersonLite
	assets: Asset[]
}) {
	return (
		<aside className='doc doc--draft' aria-label='Vista previa de la carta'>
			<p className='doc__kicker'>Carta de resguardo</p>
			<p className='doc__line'>
				Recibe: <b>{person?.fullName ?? '—'}</b>
				{person && (
					<>
						{' '}
						· No. <span className='num'>{person.employeeNumber}</span>
					</>
				)}
			</p>
			<p className='doc__line'>
				Fecha: <b>{shortDate(new Date().toISOString())}</b>
			</p>
			<ul className='doc__items' role='list'>
				{assets.length ? (
					assets.map(a => (
						<li key={a.id}>
							<span className='num'>{a.folio}</span> {a.typeName}{' '}
							{[a.brand, a.model].filter(Boolean).join(' ')}
						</li>
					))
				) : (
					<li className='muted'>Elige uno o más equipos</li>
				)}
			</ul>
			<p className='doc__terms'>{TERMS}</p>
		</aside>
	)
})
