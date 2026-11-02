import { Icon } from '@/components/ui/icon'

type Condition = 'good' | 'damaged'

export function ConditionField({
	value,
	onChange,
}: {
	value: Condition
	onChange: (v: Condition) => void
}) {
	return (
		<fieldset className='card stack'>
			<legend className='step__title'>En qué estado</legend>
			<div className='seg seg--wide' role='radiogroup' aria-label='Estado'>
				<label>
					<input
						type='radio'
						name='condition'
						checked={value === 'good'}
						onChange={() => onChange('good')}
					/>
					<span>
						<Icon name='check' />
						Buen estado
					</span>
				</label>
				<label>
					<input
						type='radio'
						name='condition'
						checked={value === 'damaged'}
						onChange={() => onChange('damaged')}
					/>
					<span>
						<Icon name='wrench' />
						Con daños
					</span>
				</label>
			</div>
			<p className='field__help'>
				Con daños pasa directo a reparación en lugar de volver al almacén.
			</p>
		</fieldset>
	)
}
