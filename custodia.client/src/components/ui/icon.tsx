const PATHS = {
	laptop:
		'<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
	monitor:
		'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
	phone:
		'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
	printer:
		'<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z"/>',
	plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
	key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
	box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
	search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
	check: '<path d="M20 6L9 17l-5-5"/>',
	x: '<path d="M18 6L6 18M6 6l12 12"/>',
	clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
	arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
	arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4"/>',
	camera:
		'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
	pen: '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
	refresh:
		'<path d="M20 11a8 8 0 0 0-14.6-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.6 4.5L21 15M21 20v-5h-5"/>',
	info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
	logout:
		'<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H10"/>',
	wifiOff:
		'<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 4.2-2.5M12 20h.01M15.5 10.6A10 10 0 0 1 19 12.9M2 9a15 15 0 0 1 4.4-2.7M10.6 5.1A15 15 0 0 1 22 9"/>',
	eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
	inbox: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5"/>',
	wrench:
		'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
	archive: '<path d="M3 4h18v4H3zM5 8v12h14V8M10 12h4"/>',
	store:
		'<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 3 3s3-1 3-3"/>',
	upload:
		'<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
	chevronDown: '<path d="M6 9l6 6 6-6"/>',
	send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
	calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2"/>',
	chevronRight: '<path d="M9 6l6 6-6 6"/>',
	user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
} as const

export type IconName = keyof typeof PATHS

export const isIconName = (v: string): v is IconName => v in PATHS

export function Icon({
	name,
	className = '',
}: {
	name: IconName
	className?: string
}) {
	return (
		<svg
			className={`icon ${className}`}
			viewBox='0 0 24 24'
			aria-hidden='true'
			focusable='false'
			dangerouslySetInnerHTML={{ __html: PATHS[name] }}
		/>
	)
}
