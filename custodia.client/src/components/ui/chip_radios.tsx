import type { ReactNode } from 'react'

interface Props<T extends string> {
	name: string
	label: string
	value: T
	options: readonly (readonly [T, string, ReactNode?])[]
	onChange: (value: T) => void
}

export function ChipRadios<T extends string>({
	name,
	label,
	value,
	options,
	onChange,
}: Props<T>) {
	return (
		<div className='chip-row' role='radiogroup' aria-label={label}>
			{options.map(([v, text, icon]) => (
				<label key={v} className='chip-radio'>
					<input
						type='radio'
						name={name}
						value={v}
						checked={v === value}
						onChange={() => onChange(v)}
					/>
					<span>
						{icon}
						{text}
					</span>
				</label>
			))}
		</div>
	)
}
