import { Link } from 'react-router'

import { Shelf } from '@/components/ui/art'

export default function NotFoundPage() {
	return (
		<div className='wrap narrow'>
			<div className='empty empty--error'>
				<div className='empty__art'>
					<Shelf label='Repisa con un hueco' />
				</div>
				<p className='kicker'>Error 404</p>
				<h1 className='h2'>Ese folio no está en el inventario</h1>
				<p className='muted'>
					Revisa el número de la etiqueta o búscalo por serie desde el
					inventario.
				</p>
				<Link className='btn btn--primary' to='/'>
					Volver al inicio
				</Link>
			</div>
		</div>
	)
}
