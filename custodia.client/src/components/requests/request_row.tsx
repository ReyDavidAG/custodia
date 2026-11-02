import { memo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { Icon, isIconName } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { REQUEST_LABELS } from '@/constants/status'
import { useRejectRequest } from '@/hooks/requests/use_requests'
import type { AssetType, PersonLite } from '@/types/asset_type'
import type { Request } from '@/types/custody_type'
import { shortDate } from '@/utils/dates'
import { initials } from '@/utils/initials'
import { stagger } from '@/utils/stagger'

interface Props {
	request: Request
	type?: AssetType
	person?: PersonLite
	index: number
	canAct: boolean
}

export const RequestRow = memo(function RequestRow({
	request: r,
	type,
	person,
	index,
	canAct,
}: Props) {
	const reject = useRejectRequest()
	const [rejecting, setRejecting] = useState(false)
	const [note, setNote] = useState('')
	const [label, cls] = REQUEST_LABELS[r.status]

	const send = () => {
		if (note.trim().length < 5)
			return toast.error('Escribe el motivo del rechazo (al menos 5 letras).')
		reject.mutate(
			{ id: r.id, note: note.trim() },
			{
				onSuccess: () => toast('Solicitud rechazada; la persona ve el motivo'),
				onError: e => toast.error(e.message),
			}
		)
	}

	return (
		<li className='req animate-row-in' style={stagger(index)}>
			<div className='req__head'>
				<span className='num folio'>{r.folio}</span>
				<span className={`pill ${cls}`}>{label}</span>
				<span className='muted small'>{shortDate(r.createdAt)}</span>
			</div>
			<p className='req__what'>
				<Icon name={type && isIconName(type.icon) ? type.icon : 'box'} />
				<b>{type?.name ?? 'Equipo'}</b>
				{canAct && person && (
					<>
						{' · '}
						<span className='avatar is-xs' aria-hidden='true'>
							{initials(person.fullName)}
						</span>
						{person.fullName}{' '}
						<span className='muted'>
							({person.departmentName ?? person.areaName})
						</span>
					</>
				)}
			</p>
			<p className='req__why'>{r.reason}</p>
			{r.note && <p className='muted small'>Respuesta de IT: {r.note}</p>}
			{canAct && r.status === 'pending' && !rejecting && (
				<div className='req__actions'>
					<Link
						className='btn btn--primary btn--sm'
						to={`${ROUTES.handover}?request=${r.folio}`}>
						<Icon name='send' />
						Aprobar y entregar
					</Link>
					<button
						className='btn btn--ghost btn--sm'
						type='button'
						onClick={() => setRejecting(true)}>
						Rechazar
					</button>
				</div>
			)}
			{rejecting && (
				<div className='req__reject'>
					<label className='sr-only' htmlFor={`reject-${r.id}`}>
						Motivo del rechazo
					</label>
					<input
						id={`reject-${r.id}`}
						className='input'
						autoFocus
						maxLength={200}
						placeholder='Motivo del rechazo'
						value={note}
						onChange={e => setNote(e.target.value)}
					/>
					<div className='req__actions'>
						<button
							className='btn btn--danger btn--sm'
							type='button'
							disabled={reject.isPending}
							onClick={send}>
							Rechazar solicitud
						</button>
						<button
							className='btn btn--ghost btn--sm'
							type='button'
							onClick={() => setRejecting(false)}>
							Cancelar
						</button>
					</div>
				</div>
			)}
		</li>
	)
})
