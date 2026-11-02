import { useMemo, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { SearchBox } from '@/components/ui/search_box'
import { useDebounced } from '@/hooks/ui/use_debounced'
import type { PersonLite } from '@/types/asset_type'
import { initials } from '@/utils/initials'
import { matches, words } from '@/utils/text'

const LIMIT = 30

interface Props {
	people: PersonLite[]
	value: string | null
	onChange: (id: string) => void
}

export function PersonPicker({ people, value, onChange }: Props) {
	const [q, setQ] = useState('')
	const query = useDebounced(q)
	const list = useMemo(() => {
		const terms = words(query)
		const found = people.filter(p =>
			matches(
				`${p.fullName} ${p.employeeNumber} ${p.areaName} ${p.departmentName ?? ''}`,
				terms
			)
		)
		const picked =
			found.find(p => p.id === value) ?? people.find(p => p.id === value)
		const top = found.slice(0, LIMIT)
		return picked && !top.includes(picked) ? [picked, ...top] : top
	}, [people, query, value])

	return (
		<fieldset className='card step'>
			<legend className='step__title'>
				<span className='step__n'>1</span>
				Quién recibe
			</legend>
			<SearchBox
				label='Buscar persona'
				placeholder='Nombre o número'
				value={q}
				onChange={setQ}
			/>
			<div className='picks' role='radiogroup' aria-label='Persona'>
				{list.length ? (
					list.map(p => (
						<label key={p.id} className='pick'>
							<input
								type='radio'
								name='person'
								checked={p.id === value}
								onChange={() => onChange(p.id)}
							/>
							<span className='avatar' aria-hidden='true'>
								{initials(p.fullName)}
							</span>
							<span className='pick__text'>
								<b>{p.fullName}</b>
								<small>
									{p.departmentName ?? p.areaName} · No.{' '}
									<span className='num'>{p.employeeNumber}</span>
								</small>
							</span>
							<Icon name='check' className='pick__check' />
						</label>
					))
				) : (
					<p className='muted small pick__empty'>
						Nadie con ese nombre o número.
					</p>
				)}
			</div>
		</fieldset>
	)
}
