import { z } from 'zod'

const checked = (message: string) => z.boolean().refine(v => v, message)

export const retireSchema = z.object({
	dataWiped: checked('Confirma que los datos están borrados.'),
	accountsRemoved: checked('Confirma que se retiraron cuentas y licencias.'),
	partsSeparated: checked('Confirma que separaste los accesorios.'),
	reason: z.string().trim().max(120, 'Máximo 120 letras.'),
})

export type RetireForm = z.infer<typeof retireSchema>
