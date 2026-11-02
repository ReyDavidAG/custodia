import type { CSSProperties } from 'react'

export const stagger = (index: number): CSSProperties => ({
	'--i': Math.min(index, 12),
})
