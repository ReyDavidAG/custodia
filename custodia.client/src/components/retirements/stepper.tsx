import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'

const STEPS = [
	['IT lo revisa', 'Borra los datos y confirma si todavía sirve.'],
	['Contabilidad da la baja', 'Saca el activo fijo de los libros.'],
	[
		'Se postula a El Trueque',
		'Si sirve, pasa a la tienda con existencias = 1.',
	],
] as const

export function Stepper({ done }: { done: [boolean, boolean, boolean] }) {
	return (
		<ol className='stepper' role='list'>
			{STEPS.map(([title, body], i) => (
				<li
					key={title}
					className={cn(
						'stepper__item',
						done[i] && 'is-done',
						!done[i] && (i === 0 || done[i - 1]) && 'is-current'
					)}>
					<span className='stepper__n'>
						{done[i] ? <Icon name='check' /> : i + 1}
					</span>
					<span>
						<b>{title}</b>
						<small>{body}</small>
					</span>
				</li>
			))}
		</ol>
	)
}
