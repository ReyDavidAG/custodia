import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
if (!process.env.VITE_SITE_URL && vercelUrl)
	process.env.VITE_SITE_URL = `https://${vercelUrl}`

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: { alias: { '@': path.resolve(__dirname, './src') } },
	server: { host: true, port: 5176, strictPort: true },
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom', 'react-router'],
					query: ['@tanstack/react-query'],
					supabase: ['@supabase/supabase-js'],
					forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
				},
			},
		},
	},
})
