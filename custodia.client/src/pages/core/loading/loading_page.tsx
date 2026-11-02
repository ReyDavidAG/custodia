import { Mark } from '@/components/ui/art'

export default function LoadingPage() {
	return (
		<div className='boot' role='status' aria-live='polite'>
			<Mark className='boot__mark' />
			<p className='boot__text'>Abriendo la bitácora…</p>
		</div>
	)
}
