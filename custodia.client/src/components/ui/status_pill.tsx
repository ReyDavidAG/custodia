import { STATUS_LABELS } from '@/constants/status'
import type { AssetStatus } from '@/types/asset_type'

export function StatusPill({ status }: { status: AssetStatus }) {
	return (
		<span className='status' data-status={status}>
			<i aria-hidden='true' />
			{STATUS_LABELS[status]}
		</span>
	)
}
