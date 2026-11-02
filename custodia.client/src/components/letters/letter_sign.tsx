import { Icon } from '@/components/ui/icon'
import { useEvidenceUrl } from '@/hooks/custody/use_custody'
import type { Evidence } from '@/types/custody_type'

export function LetterSign({
	evidence,
	signer,
}: {
	evidence: Evidence | null
	signer: string
}) {
	const url = useEvidenceUrl(evidence?.storagePath)
	return (
		<div className='doc__sign'>
			{!evidence ? (
				<span className='doc__file muted'>Sin evidencia</span>
			) : url.isPending ? (
				<span className='doc__file muted'>Cargando la firma…</span>
			) : !url.data ? (
				<span className='doc__file muted'>La evidencia no está disponible</span>
			) : evidence.kind === 'pdf' ? (
				<a
					className='doc__file'
					href={url.data}
					target='_blank'
					rel='noreferrer'>
					<Icon name='file' />
					Hoja firmada (PDF)
				</a>
			) : (
				<img
					src={url.data}
					alt={
						evidence.kind === 'signature'
							? `Firma de ${signer}`
							: `Foto de la hoja firmada por ${signer}`
					}
				/>
			)}
			<span className='doc__signline'>Firma de quien recibe</span>
		</div>
	)
}
