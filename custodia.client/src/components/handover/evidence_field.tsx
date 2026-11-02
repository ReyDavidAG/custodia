import {
	type PointerEvent,
	type Ref,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'

import { Icon } from '@/components/ui/icon'
import type { Evidence } from '@/types/custody_type'
import { cn } from '@/utils/cn'

export interface EvidenceValue {
	file: Blob
	kind: Evidence['kind']
}

export interface EvidenceHandle {
	value(): Promise<EvidenceValue | null>
	fail(message: string): void
}

interface Props {
	legend: string
	signer: string
	ref: Ref<EvidenceHandle>
}

export function EvidenceField({ legend, signer, ref }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [mode, setMode] = useState<'sign' | 'file'>('sign')
	const [strokes, setStrokes] = useState(0)
	const [file, setFile] = useState<File | null>(null)
	const [error, setError] = useState<string | null>(null)
	const drawing = useRef(false)

	useEffect(() => {
		const ctx = canvasRef.current?.getContext('2d')
		if (!ctx) return
		ctx.lineWidth = 3.2
		ctx.lineCap = 'round'
		ctx.lineJoin = 'round'
		ctx.strokeStyle =
			getComputedStyle(document.documentElement)
				.getPropertyValue('--color-ink')
				.trim() || 'black'
	}, [mode])

	useImperativeHandle(ref, () => ({
		async value() {
			if (mode === 'file')
				return file
					? { file, kind: file.type === 'application/pdf' ? 'pdf' : 'photo' }
					: null
			if (!strokes || !canvasRef.current) return null
			const blob = await new Promise<Blob | null>(r =>
				canvasRef.current!.toBlob(r, 'image/png')
			)
			return blob ? { file: blob, kind: 'signature' } : null
		},
		fail(message) {
			setError(message)
		},
	}))

	const at = (e: PointerEvent<HTMLCanvasElement>) => {
		const c = e.currentTarget
		const r = c.getBoundingClientRect()
		return [
			((e.clientX - r.left) / r.width) * c.width,
			((e.clientY - r.top) / r.height) * c.height,
		] as const
	}

	const clear = () => {
		const c = canvasRef.current
		c?.getContext('2d')?.clearRect(0, 0, c.width, c.height)
		setStrokes(0)
	}

	return (
		<fieldset className={cn('field evidence', error && 'animate-nudge')}>
			<legend>{legend}</legend>
			<div className='seg' role='radiogroup' aria-label='Tipo de evidencia'>
				<label>
					<input
						type='radio'
						name='evidence-mode'
						checked={mode === 'sign'}
						onChange={() => setMode('sign')}
					/>
					<span>
						<Icon name='pen' />
						Firma en pantalla
					</span>
				</label>
				<label>
					<input
						type='radio'
						name='evidence-mode'
						checked={mode === 'file'}
						onChange={() => setMode('file')}
					/>
					<span>
						<Icon name='camera' />
						Foto o PDF
					</span>
				</label>
			</div>
			{mode === 'sign' ? (
				<div className='evidence__sign'>
					<canvas
						ref={canvasRef}
						className='pad'
						width={600}
						height={200}
						aria-label={`Recuadro para la firma de ${signer}`}
						onPointerDown={e => {
							drawing.current = true
							e.currentTarget.setPointerCapture(e.pointerId)
							const ctx = e.currentTarget.getContext('2d')
							ctx?.beginPath()
							ctx?.moveTo(...at(e))
						}}
						onPointerMove={e => {
							if (!drawing.current) return
							const ctx = e.currentTarget.getContext('2d')
							ctx?.lineTo(...at(e))
							ctx?.stroke()
						}}
						onPointerUp={() => {
							if (drawing.current) setStrokes(n => n + 1)
							drawing.current = false
							setError(null)
						}}
					/>
					<div className='pad__foot'>
						<span className='muted small'>Firma de {signer}</span>
						<button className='link-btn' type='button' onClick={clear}>
							Borrar firma
						</button>
					</div>
				</div>
			) : (
				<label className={cn('drop', file && 'is-ready')}>
					<input
						type='file'
						accept='image/png,image/jpeg,image/webp,application/pdf'
						capture='environment'
						onChange={e => {
							setFile(e.target.files?.[0] ?? null)
							setError(null)
						}}
					/>
					<span className='drop__icon'>
						<Icon name='upload' />
					</span>
					<span className='drop__text'>
						<b>{file ? file.name : 'Toma una foto o sube el PDF'}</b>
						<small>
							{file
								? `${Math.ceil(file.size / 1024)} KB · listo`
								: 'De la hoja firmada. Hasta 10 MB.'}
						</small>
					</span>
				</label>
			)}
			<p className={cn('field__help', error && 'is-error')}>
				{error ?? 'Sin evidencia no se puede cerrar.'}
			</p>
		</fieldset>
	)
}
