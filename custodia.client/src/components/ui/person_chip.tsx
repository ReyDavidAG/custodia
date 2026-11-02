import type { PersonLite } from '@/types/asset_type'
import { initials } from '@/utils/initials'

export function PersonChip({ person }: { person: PersonLite }) {
	return (
		<span className='person'>
			<span className='avatar' aria-hidden='true'>
				{initials(person.fullName)}
			</span>
			<span className='person__text'>
				<strong>{person.fullName}</strong>
				<small>
					{person.departmentName ?? person.areaName} · No.{' '}
					<span className='num'>{person.employeeNumber}</span>
				</small>
			</span>
		</span>
	)
}
