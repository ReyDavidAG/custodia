import { z } from 'zod'

export const employeeNumberSchema = z.object({
	employeeNumber: z
		.string()
		.trim()
		.min(1, 'Escribe tu número de trabajador.')
		.regex(/^\d+$/, 'Sólo números.')
		.min(5, 'El número tiene al menos 5 dígitos.')
		.max(10, 'El número tiene máximo 10 dígitos.'),
})

export type EmployeeNumberForm = z.infer<typeof employeeNumberSchema>
