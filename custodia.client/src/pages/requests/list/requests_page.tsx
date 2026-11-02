import { useMemo } from 'react'

import { RequestForm } from '@/components/requests/request_form'
import { RequestRow } from '@/components/requests/request_row'
import { ErrorState, TagSkeletons } from '@/components/ui/state_views'
import { usePersonMap, useTypes } from '@/hooks/assets/use_assets'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useRequests } from '@/hooks/requests/use_requests'
import type { Request } from '@/types/custody_type'
import { cn } from '@/utils/cn'

export default function RequestsPage() {
	const { role, person } = useRequiredSession()
	const it = role === 'it'
	const requests = useRequests()
	const types = useTypes()
	const people = usePersonMap()
	const typeMap = useMemo(
		() => new Map((types.data ?? []).map(t => [t.id, t])),
		[types.data]
	)
	const all = useMemo(
		() => (requests.data ?? []).filter(r => it || r.personId === person.id),
		[requests.data, it, person.id]
	)
	const pending = all.filter(r => r.status === 'pending')
	const rest = all.filter(r => r.status !== 'pending')

	const rows = (list: Request[]) => (
		<ul className='reqs' role='list'>
			{list.map((r, i) => (
				<RequestRow
					key={r.id}
					request={r}
					type={typeMap.get(r.typeId)}
					person={people.get(r.personId)}
					index={i}
					canAct={it}
				/>
			))}
		</ul>
	)

	return (
		<div className={cn('wrap', !it && 'narrow')}>
			<header className='page-head'>
				<h1 className='h1'>
					{it ? 'Solicitudes de equipo' : 'Mis solicitudes'}
				</h1>
				<p className='lede'>
					{it
						? 'Lo que la gente pide. Al aprobar, entregas desde el almacén con su carta de resguardo.'
						: 'Pide equipo y sigue en qué va.'}
				</p>
			</header>
			<div className='stack'>
				{!it && types.data && <RequestForm types={types.data} />}
				{requests.isPending ? (
					<TagSkeletons count={2} />
				) : requests.error ? (
					<ErrorState
						message={requests.error.message}
						onRetry={() => void requests.refetch()}
					/>
				) : (
					<>
						<section className='section'>
							<div className='section__head'>
								<h2 className='h3'>Pendientes · {pending.length}</h2>
							</div>
							{pending.length ? (
								rows(pending)
							) : (
								<p className='muted'>Nada pendiente.</p>
							)}
						</section>
						<section className='section'>
							<div className='section__head'>
								<h2 className='h3'>Atendidas</h2>
							</div>
							{rest.length ? (
								rows(rest)
							) : (
								<p className='muted'>Todavía no hay solicitudes atendidas.</p>
							)}
						</section>
					</>
				)}
			</div>
		</div>
	)
}
