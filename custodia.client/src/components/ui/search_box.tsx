import { Icon } from './icon'

interface Props {
	label: string
	placeholder: string
	value: string
	onChange: (value: string) => void
}

export function SearchBox({ label, placeholder, value, onChange }: Props) {
	return (
		<label className='search'>
			<span className='sr-only'>{label}</span>
			<Icon name='search' />
			<input
				type='search'
				className='input'
				placeholder={placeholder}
				value={value}
				onChange={e => onChange(e.target.value)}
			/>
		</label>
	)
}
