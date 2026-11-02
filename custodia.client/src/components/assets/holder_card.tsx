import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { PersonChip } from '@/components/ui/person_chip'
import { ROUTES } from '@/constants/routes'
import type { PersonLite } from '@/types/asset_type'

export function HolderCard({
	person,
	folio,
}: {
	person: PersonLite
	folio: string | null
}) {
	return (
		<section className='card'>
			<h2 className='h4'>En custodia de</h2>
			<PersonChip person={person} />
			{folio && (
				<Link className='doc-link' to={ROUTES.letter(folio)}>
					<Icon name='file' />
					<span>
						Carta de resguardo <b className='num'>{folio}</b>
					</span>
					<Icon name='arrowRight' />
				</Link>
			)}
		</section>
	)
}
