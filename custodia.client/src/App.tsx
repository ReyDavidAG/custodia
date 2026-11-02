import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { SessionProvider } from '@/context/session/session_context'
import LoadingPage from '@/pages/core/loading/loading_page'
import { queryClient } from '@/services/api/query_client'

import router from './router/app_router'

const App = () => (
	<QueryClientProvider client={queryClient}>
		<SessionProvider>
			<Suspense fallback={<LoadingPage />}>
				<RouterProvider router={router} />
			</Suspense>
			<Toaster position='bottom-center' />
		</SessionProvider>
	</QueryClientProvider>
)

export default App
