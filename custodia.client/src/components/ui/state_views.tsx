import type { ReactNode } from 'react'

import { Shelf } from './art'
import { Icon } from './icon'

export function EmptyState({
	title,
	body,
	action,
}: {
	title: string
	body: string
	action?: ReactNode
}) {
	return (
		<div className='empty'>
			<div className='empty__art'>
				<Shelf label='Repisa vacía' />
			</div>
			<p className='h3'>{title}</p>
			<p className='muted'>{body}</p>
			{action}
		</div>
	)
}

export function ErrorState({
	message,
	onRetry,
}: {
	message: string
	onRetry: () => void
}) {
	return (
		<div className='empty empty--error' role='alert'>
			<div className='empty__art'>
				<Shelf label='Repisa sin datos' />
			</div>
			<p className='h3'>No pudimos cargar la bitácora</p>
			<p className='muted'>{message} No se perdió nada: vuelve a intentar.</p>
			<button className='btn btn--primary' type='button' onClick={onRetry}>
				<Icon name='refresh' />
				Reintentar
			</button>
		</div>
	)
}

export function TagSkeletons({ count = 6 }: { count?: number }) {
	return (
		<div className='atags' aria-busy='true' aria-label='Cargando'>
			{Array.from({ length: count }, (_, i) => (
				<div key={i} className='atag atag--ghost' style={{ '--i': i }}>
					<span className='ghost' />
					<span className='ghost is-big' />
					<span className='ghost is-short' />
				</div>
			))}
		</div>
	)
}

export function DemoNote({ children }: { children: ReactNode }) {
	return (
		<p className='demo-note'>
			<Icon name='info' />
			<span>{children}</span>
		</p>
	)
}
