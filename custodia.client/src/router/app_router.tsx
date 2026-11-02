import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import AuthGuard from '@/layouts/auth/auth_guard'
import HomeRedirect from '@/layouts/auth/home_redirect'
import RoleGuard from '@/layouts/auth/role_guard'
import NotFoundPage from '@/pages/core/not_found/not_found_page'

const SignInPage = lazy(() => import('@/pages/auth/sign_in/sign_in_page'))
const ProtectedLayout = lazy(
	() => import('@/layouts/protected/protected_layout')
)
const InventoryPage = lazy(
	() => import('@/pages/inventory/list/inventory_page')
)
const AssetDetailPage = lazy(
	() => import('@/pages/assets/detail/asset_detail_page')
)
const ReturnPage = lazy(() => import('@/pages/assets/return/return_page'))
const RetirePage = lazy(() => import('@/pages/assets/retire/retire_page'))
const HandoverPage = lazy(() => import('@/pages/handover/new/handover_page'))
const LetterPage = lazy(() => import('@/pages/letters/detail/letter_page'))
const RequestsPage = lazy(() => import('@/pages/requests/list/requests_page'))
const MinePage = lazy(() => import('@/pages/mine/mine_page'))
const RetirementsPage = lazy(
	() => import('@/pages/retirements/retirements_page')
)

const router = createBrowserRouter([
	{ path: '/sign-in', element: <SignInPage /> },
	{
		element: <AuthGuard />,
		children: [
			{
				element: <ProtectedLayout />,
				children: [
					{ index: true, element: <HomeRedirect /> },
					{ path: '/mine', element: <MinePage /> },
					{ path: '/assets/:folio', element: <AssetDetailPage /> },
					{ path: '/letters/:folio', element: <LetterPage /> },
					{
						element: <RoleGuard roles={['it', 'accounting']} />,
						children: [
							{ path: '/inventory', element: <InventoryPage /> },
							{ path: '/assets/:folio/retire', element: <RetirePage /> },
						],
					},
					{
						element: <RoleGuard roles={['it', 'member']} />,
						children: [{ path: '/requests', element: <RequestsPage /> }],
					},
					{
						element: <RoleGuard roles={['it']} />,
						children: [
							{ path: '/handover', element: <HandoverPage /> },
							{ path: '/assets/:folio/return', element: <ReturnPage /> },
						],
					},
					{
						element: <RoleGuard roles={['accounting']} />,
						children: [{ path: '/retirements', element: <RetirementsPage /> }],
					},
					{ path: '*', element: <NotFoundPage /> },
				],
			},
		],
	},
])

export default router
