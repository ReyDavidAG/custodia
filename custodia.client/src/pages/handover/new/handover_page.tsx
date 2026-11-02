import { type FormEvent, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { AssetPicker } from '@/components/handover/asset_picker'
import {
	EvidenceField,
	type EvidenceHandle,
} from '@/components/handover/evidence_field'
import { LetterPreview } from '@/components/handover/letter_preview'
import { PersonPicker } from '@/components/handover/person_picker'
import { Icon } from '@/components/ui/icon'
import { TagSkeletons } from '@/components/ui/state_views'
import { ROUTES } from '@/constants/routes'
import { useAssets, usePeople, usePersonMap } from '@/hooks/assets/use_assets'
import { useHandover } from '@/hooks/custody/use_custody'
import { useRequests } from '@/hooks/requests/use_requests'

export default function HandoverPage() {
	const [params] = useSearchParams()
	const navigate = useNavigate()
	const assets = useAssets()
	const people = usePeople()
	const personMap = usePersonMap()
	const requests = useRequests()
	const handover = useHandover()
	const evidence = useRef<EvidenceHandle>(null)
	const [personId, setPersonId] = useState<string | null>(null)
	const [picked, setPicked] = useState<string[] | null>(null)

	const request = requests.data?.find(
		r => r.folio === params.get('request') && r.status === 'pending'
	)
	const available = useMemo(
		() => (assets.data ?? []).filter(a => a.status === 'stock'),
		[assets.data]
	)
	const defaults = useMemo(() => {
		const byFolio = available.find(a => a.folio === params.get('asset'))
		const byType = request
			? available.find(a => a.typeId === request.typeId)
			: undefined
		return [byFolio ?? byType].filter(a => !!a).map(a => a.id)
	}, [available, params, request])

	const who = personId ?? request?.personId ?? null
	const ids = picked ?? defaults
	const chosen = useMemo(
		() => available.filter(a => ids.includes(a.id)),
		[available, ids]
	)

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		if (!who) return toast.error('Elige quién recibe el equipo')
		if (!chosen.length) return toast.error('Elige al menos un equipo')
		const ev = await evidence.current?.value()
		if (!ev)
			return evidence.current?.fail(
				'Falta la firma o la foto de la hoja firmada.'
			)
		handover.mutate(
			{
				personId: who,
				assetIds: chosen.map(a => a.id),
				assetAreaId: chosen[0].assetAreaId,
				file: ev.file,
				kind: ev.kind,
				requestId: request?.id ?? null,
			},
			{
				onSuccess: folio => navigate(`${ROUTES.letter(folio)}?new=1`),
				onError: err => toast.error(err.message),
			}
		)
	}

	if (assets.isPending || people.isPending)
		return (
			<div className='wrap'>
				<TagSkeletons count={3} />
			</div>
		)

	return (
		<div className='wrap'>
			<Link className='back-link' to={ROUTES.inventory}>
				<Icon name='arrowLeft' />
				Inventario
			</Link>
			<header className='page-head'>
				<h1 className='h1'>Nueva entrega</h1>
				<p className='lede'>
					Quién recibe, qué se lleva y su firma. Con eso sale la carta de
					resguardo.
				</p>
			</header>
			{request && (
				<p className='hint is-info'>
					<Icon name='inbox' />
					<span>
						Atiende la solicitud <b className='num'>{request.folio}</b>:{' '}
						{request.reason}
					</span>
				</p>
			)}
			<form className='handover' noValidate onSubmit={e => void submit(e)}>
				<div className='handover__steps'>
					<PersonPicker
						people={people.data ?? []}
						value={who}
						onChange={setPersonId}
					/>
					<AssetPicker assets={available} value={ids} onChange={setPicked} />
					<div className='card step'>
						<p className='step__title'>
							<span className='step__n'>3</span>
							Firma de quien recibe
						</p>
						<EvidenceField
							ref={evidence}
							legend='Evidencia de entrega'
							signer={
								who
									? (personMap.get(who)?.fullName ?? 'quien recibe')
									: 'quien recibe'
							}
						/>
					</div>
					<div className='form-actions'>
						<Link className='btn btn--ghost' to={ROUTES.inventory}>
							Cancelar
						</Link>
						<button
							className='btn btn--primary btn--lg'
							type='submit'
							disabled={handover.isPending}>
							{handover.isPending ? (
								<span className='spinner' aria-hidden='true' />
							) : (
								<Icon name='file' />
							)}
							{handover.isPending ? 'Emitiendo…' : 'Emitir carta de resguardo'}
						</button>
					</div>
				</div>
				<LetterPreview
					person={who ? personMap.get(who) : undefined}
					assets={chosen}
				/>
			</form>
		</div>
	)
}
