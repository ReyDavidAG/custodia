import { type FormEvent, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import {
	EvidenceField,
	type EvidenceHandle,
} from '@/components/handover/evidence_field'
import { ConditionField } from '@/components/returns/condition_field'
import { ReturnPieces } from '@/components/returns/return_pieces'
import { Icon } from '@/components/ui/icon'
import { PersonChip } from '@/components/ui/person_chip'
import { EmptyState, TagSkeletons } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useAsset, useParts, usePersonMap } from '@/hooks/assets/use_assets'
import { useReceiveReturn } from '@/hooks/custody/use_custody'
import NotFoundPage from '@/pages/core/not_found/not_found_page'

export default function ReturnPage() {
	const { folio = '' } = useParams()
	const navigate = useNavigate()
	const { asset, isPending } = useAsset(folio)
	const parts = useParts(asset?.id)
	const people = usePersonMap()
	const receive = useReceiveReturn()
	const evidence = useRef<EvidenceHandle>(null)
	const [missing, setMissing] = useState<string[]>([])
	const [condition, setCondition] = useState<'good' | 'damaged'>('good')

	if (isPending)
		return (
			<div className='wrap narrow'>
				<TagSkeletons count={1} />
			</div>
		)
	if (!asset) return <NotFoundPage />
	if (asset.status !== 'assigned')
		return (
			<div className='wrap narrow'>
				<EmptyState
					title='Este equipo no está asignado'
					body='Sólo se recibe lo que alguien tiene en resguardo.'
					action={
						<Link className='btn' to={ROUTES.asset(asset.folio)}>
							Ver el equipo
						</Link>
					}
				/>
			</div>
		)

	const holder = asset.holderId ? people.get(asset.holderId) : undefined
	const toggle = (name: string, back: boolean) =>
		setMissing(m => (back ? m.filter(x => x !== name) : [...m, name]))

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		const ev = await evidence.current?.value()
		if (!ev)
			return evidence.current?.fail(
				'Falta la firma de quien entrega el equipo.'
			)
		receive.mutate(
			{
				assetId: asset.id,
				assetAreaId: asset.assetAreaId,
				condition,
				missing,
				file: ev.file,
				kind: ev.kind,
			},
			{
				onSuccess: () => {
					toast.success(
						condition === 'damaged'
							? 'Recibido y mandado a reparación'
							: missing.length
								? 'Recibido; quedó anotado lo que falta'
								: 'Recibido completo, de vuelta al almacén'
					)
					navigate(ROUTES.asset(asset.folio))
				},
				onError: err => toast.error(err.message),
			}
		)
	}

	return (
		<div className='wrap narrow'>
			<Link className='back-link' to={ROUTES.asset(asset.folio)}>
				<Icon name='arrowLeft' />
				{asset.folio}
			</Link>
			<header className='page-head'>
				<h1 className='h1'>Recibir devolución</h1>
				<p className='lede'>
					Marca lo que sí regresó. Si falta algo, queda anotado en el historial.
				</p>
			</header>
			<form className='stack' noValidate onSubmit={e => void submit(e)}>
				{holder && (
					<section className='card'>
						<PersonChip person={holder} />
					</section>
				)}
				<ReturnPieces
					main={[asset.typeName, asset.brand, asset.model]
						.filter(Boolean)
						.join(' ')}
					parts={parts.data ?? []}
					missing={missing}
					onToggle={toggle}
				/>
				<ConditionField value={condition} onChange={setCondition} />
				<div className='card'>
					<EvidenceField
						ref={evidence}
						legend='Firma de quien entrega'
						signer={holder?.fullName ?? 'quien entrega'}
					/>
				</div>
				<div className='form-actions'>
					<Link className='btn btn--ghost' to={ROUTES.asset(asset.folio)}>
						Cancelar
					</Link>
					<button
						className='btn btn--primary btn--lg'
						type='submit'
						disabled={receive.isPending}>
						{receive.isPending ? (
							<span className='spinner' aria-hidden='true' />
						) : (
							<Icon name='inbox' />
						)}
						{receive.isPending ? 'Registrando…' : 'Registrar devolución'}
					</button>
				</div>
			</form>
		</div>
	)
}
