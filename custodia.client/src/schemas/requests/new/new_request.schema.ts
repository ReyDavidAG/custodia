import { z } from 'zod'

export const newRequestSchema = z.object({
	typeId: z.string().min(1, 'Elige qué necesitas.'),
	reason: z
		.string()
		.trim()
		.min(10, 'Escribe para qué lo necesitas (al menos 10 letras).')
		.max(300, 'Máximo 300 letras.'),
})

export type NewRequestForm = z.infer<typeof newRequestSchema>
