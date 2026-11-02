import { Link, useParams, useSearchParams } from 'react-router'

import { LetterSign } from '@/components/letters/letter_sign'
import { Mark } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import { ErrorState } from '@/components/ui/state_views'
import { HOME, ROUTES } from '@/constants/routes'
import { usePersonMap } from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useLetter } from '@/hooks/custody/use_custody'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import { cn } from '@/utils/cn'
import { shortDate } from '@/utils/dates'

export default function LetterPage() {
	const { folio = '' } = useParams()
	const [params] = useSearchParams()
	const { role } = useRequiredSession()
	const letter = useLetter(folio)
	const people = usePersonMap()

	if (letter.isPending)
		return (
			<div className='wrap narrow'>
				<div className='doc doc--final ghost-doc' aria-busy='true' />
			</div>
		)
	if (letter.error)
		return (
			<div className='wrap narrow'>
				<ErrorState
					message={letter.error.message}
					onRetry={() => void letter.refetch()}
				/>
			</div>
		)
	if (!letter.data) return <NotFoundPage />

	const l = letter.data
	const person = people.get(l.personId)
	const by = people.get(l.deliveredBy)
	const closed = l.status === 'closed'
	const name = person?.fullName ?? 'quien recibe'

	return (
		<div className='wrap narrow'>
			{params.get('new') ? (
				<div className='done-head animate-page-in'>
					<span className='done-head__mark'>
						<Icon name='check' />
					</span>
					<h1 className='h2'>Entrega registrada</h1>
					<p className='lede'>
						La carta quedó firmada y el equipo ya aparece a nombre de {name}.
					</p>
				</div>
			) : (
				<Link className='back-link' to={HOME[role]}>
					<Icon name='arrowLeft' />
					{role === 'member' ? 'Mi equipo' : 'Inventario'}
				</Link>
			)}
			<article className='doc doc--final'>
				<header className='doc__head'>
					<Mark className='doc__mark' />
					<div>
						<p className='doc__kicker'>Carta de resguardo</p>
						<p className='doc__folio num'>{l.folio}</p>
					</div>
					<span className={cn('stamp', closed && 'is-closed')}>
						{closed ? 'Devuelto' : 'Vigente'}
					</span>
				</header>
				<p className='doc__line'>
					Recibe: <b>{name}</b>
					{person && (
						<>
							{' '}
							· {person.departmentName ?? person.areaName} · No.{' '}
							<span className='num'>{person.employeeNumber}</span>
						</>
					)}
				</p>
				<p className='doc__line'>
					Entrega: <b>{by?.fullName ?? 'Soporte de IT'}</b> ·{' '}
					{shortDate(l.deliveredOn)}
				</p>
				<table className='doc__table'>
					<thead>
						<tr>
							<th>Folio</th>
							<th>Equipo</th>
							<th>Serie</th>
						</tr>
					</thead>
					<tbody>
						{l.items.map(i => (
							<tr key={i.assetId} className={cn(i.returnedOn && 'is-back')}>
								<td className='num'>{i.folio}</td>
								<td>
									{i.name}
									{i.returnedOn && (
										<small>
											Devuelto el {shortDate(i.returnedOn)}
											{i.missing.length
												? ` · faltó ${i.missing.join(', ')}`
												: ''}
										</small>
									)}
								</td>
								<td className='num'>{i.serial ?? '—'}</td>
							</tr>
						))}
					</tbody>
				</table>
				<p className='doc__terms'>{l.terms}</p>
				<LetterSign evidence={l.evidence} signer={name} />
			</article>
			<div className='btn-row'>
				<button
					className='btn btn--ghost'
					type='button'
					onClick={() => window.print()}>
					<Icon name='file' />
					Imprimir o guardar PDF
				</button>
				{l.items[0] && (
					<Link
						className='btn btn--primary'
						to={ROUTES.asset(l.items[0].folio)}>
						Ver el equipo
					</Link>
				)}
			</div>
		</div>
	)
}
