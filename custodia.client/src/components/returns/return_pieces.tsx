import { Icon } from '@/components/ui/icon'

interface Props {
	main: string
	parts: string[]
	missing: string[]
	onToggle: (part: string, back: boolean) => void
}

export function ReturnPieces({ main, parts, missing, onToggle }: Props) {
	return (
		<fieldset className='card stack'>
			<legend className='step__title'>Qué regresó</legend>
			<div className='picks'>
				<label className='pick'>
					<input type='checkbox' checked disabled />
					<span className='pick__text'>
						<b>{main}</b>
						<small>El equipo principal</small>
					</span>
					<Icon name='check' className='pick__check' />
				</label>
				{parts.map(p => (
					<label key={p} className='pick'>
						<input
							type='checkbox'
							checked={!missing.includes(p)}
							onChange={e => onToggle(p, e.target.checked)}
						/>
						<span className='pick__text'>
							<b>{p}</b>
						</span>
						<Icon name='check' className='pick__check' />
					</label>
				))}
			</div>
		</fieldset>
	)
}
