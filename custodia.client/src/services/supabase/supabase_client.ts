import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			storageKey: 'custodia.auth',
		},
	}
)

export const custodia = supabase.schema('custodia')

export const EVIDENCE_BUCKET = 'custodia-evidence'

export function toMessage(error: { message?: string } | null | undefined) {
	const msg = error?.message ?? ''
	if (/anonymous sign-ins are disabled/i.test(msg))
		return 'Falta activar los inicios anónimos en Supabase (Authentication → Sign In / Providers).'
	if (/failed to fetch|network/i.test(msg))
		return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'
	if (/invalid schema|schema must be one of/i.test(msg))
		return 'Falta exponer el esquema custodia en Supabase (Settings → API → Exposed schemas).'
	if (/bucket not found/i.test(msg))
		return 'Falta crear el bucket de evidencias en Supabase.'
	if (/permission denied|row-level security/i.test(msg))
		return 'No tienes permiso para hacer esto.'
	if (/duplicate key/i.test(msg)) return 'Eso ya estaba registrado.'
	if (/could not find the function|schema cache/i.test(msg))
		return 'La base de datos necesita una actualización pendiente. Avisa a quien administra la demo.'
	return msg || 'Algo salió mal. Inténtalo de nuevo.'
}
