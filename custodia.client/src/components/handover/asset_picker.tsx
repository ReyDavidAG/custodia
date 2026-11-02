import { Icon, isIconName } from '@/components/ui/icon'
import type { Asset } from '@/types/asset_type'

interface Props {
	assets: Asset[]
	value: string[]
	onChange: (ids: string[]) => void
}

export function AssetPicker({ assets, value, onChange }: Props) {
	const toggle = (id: string, on: boolean) =>
		onChange(on ? [...value, id] : value.filter(v => v !== id))
	return (
		<fieldset className='card step'>
			<legend className='step__title'>
				<span className='step__n'>2</span>
				Qué se lleva
			</legend>
			{assets.length ? (
				<div className='picks'>
					{assets.map(a => (
						<label key={a.id} className='pick pick--asset'>
							<input
								type='checkbox'
								name='asset'
								checked={value.includes(a.id)}
								onChange={e => toggle(a.id, e.target.checked)}
							/>
							<span className='pick__icon'>
								<Icon name={isIconName(a.icon) ? a.icon : 'box'} />
							</span>
							<span className='pick__text'>
								<b>
									<span className='num'>{a.folio}</span> ·{' '}
									{[a.brand, a.model].filter(Boolean).join(' ') || a.name}
								</b>
								<small>{a.typeName}</small>
							</span>
							<Icon name='check' className='pick__check' />
						</label>
					))}
				</div>
			) : (
				<p className='muted'>No hay equipo en almacén.</p>
			)}
		</fieldset>
	)
}
