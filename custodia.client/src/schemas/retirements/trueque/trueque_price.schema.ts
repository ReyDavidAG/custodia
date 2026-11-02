import { z } from 'zod'

export const truequePriceSchema = z.object({
	price: z
		.string()
		.trim()
		.regex(/^\d+$/, 'Sólo números enteros.')
		.refine(v => Number(v) > 0, 'Pon un precio mayor a cero.')
		.refine(v => Number(v) <= 5000, 'Máximo 5000 cacaos.'),
})

export type TruequePriceForm = z.infer<typeof truequePriceSchema>
