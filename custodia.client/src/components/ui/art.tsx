import { useMemo } from 'react'

const MARK = `<path class="mark__cord" d="M10 6c4 6 8 8 14 9"/>
    <path class="mark__tag" d="M14 12h24a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H14l-8-8V20z"/>
    <circle class="mark__hole" cx="13" cy="27" r="3"/>
    <path class="mark__bars" d="M21 22h2v14h-2zM25 22h1v14h-1zM28 22h3v14h-3zM33 22h1v14h-1zM36 22h2v14h-2z"/>`
const SHELF = `<path class="ill__line" d="M30 20v140M210 20v140M30 60h180M30 110h180M30 158h180"/>
    <rect class="ill__box" x="44" y="30" width="44" height="30" rx="2"/><path class="ill__line" d="M44 40h44"/>
    <rect class="ill__tag" x="56" y="46" width="20" height="10" rx="1"/>
    <rect class="ill__box" x="98" y="36" width="34" height="24" rx="2"/>
    <rect class="ill__box is-alt" x="150" y="78" width="46" height="32" rx="2"/><rect class="ill__tag" x="162" y="94" width="22" height="10" rx="1"/>
    <path class="ill__dash" d="M48 126h50v32H48zM112 126h50v32h-50z"/>
    <text class="ill__q" x="137" y="149" text-anchor="middle">?</text>`
const DESK = `<path class="ill__line" d="M20 238h380"/>
    <path class="ill__line" d="M40 150h260v88M60 150v88"/>
    <rect class="ill__box" x="80" y="70" width="110" height="74" rx="6"/><rect class="ill__screen" x="90" y="80" width="90" height="54" rx="2"/>
    <path class="ill__line" d="M120 144l-6 6h42l-6-6"/>
    <path class="ill__box" d="M200 120h80l8 24H192z"/><rect class="ill__screen" x="206" y="96" width="68" height="26" rx="2"/>
    <path class="ill__line" d="M330 40v198M390 40v198M330 100h60M330 170h60"/>
    <rect class="ill__box is-alt" x="338" y="66" width="44" height="34" rx="2"/><rect class="ill__tag" x="348" y="82" width="24" height="10" rx="1"/>
    <rect class="ill__box" x="338" y="134" width="44" height="36" rx="2"/><rect class="ill__tag" x="348" y="150" width="24" height="10" rx="1"/>
    <g transform="rotate(-10 250 186)"><path class="ill__tagbig" d="M222 170h52a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4h-52l-10-10v-16z"/><circle class="ill__hole" cx="222" cy="188" r="3.5"/><path class="ill__bars" d="M232 178h3v20h-3zM238 178h2v20h-2zM243 178h4v20h-4zM250 178h2v20h-2zM255 178h3v20h-3zM261 178h2v20h-2zM266 178h3v20h-3z"/></g>`

export function Barcode({
	text,
	className = '',
}: {
	text: string
	className?: string
}) {
	const { d, width } = useMemo(() => {
		let h = 2166136261
		const bars: string[] = []
		let x = 0
		for (let i = 0; i < 34; i++) {
			h = Math.imul(h ^ (text.charCodeAt(i % text.length) + i * 7), 16777619)
			const w = 1 + ((h >>> 5) % 3)
			if (i % 2 === 0) bars.push(`M${x} 0h${w}v24h-${w}z`)
			x += w
		}
		return { d: bars.join(''), width: x }
	}, [text])
	return (
		<svg
			className={`barcode ${className}`}
			viewBox={`0 0 ${width} 24`}
			preserveAspectRatio='none'
			aria-hidden='true'
			focusable='false'>
			<path d={d} />
		</svg>
	)
}

export function Mark({ className = '' }: { className?: string }) {
	return (
		<svg
			className={`mark ${className}`}
			viewBox='0 0 48 48'
			aria-hidden='true'
			focusable='false'
			dangerouslySetInnerHTML={{ __html: MARK }}
		/>
	)
}

export function Wordmark() {
	return (
		<span className='wordmark' role='img' aria-label='Custodia'>
			<Mark />
			<span aria-hidden='true'>Custodia</span>
		</span>
	)
}

export function Shelf({ label = '' }: { label?: string }) {
	return (
		<svg
			className='ill'
			viewBox='0 0 240 170'
			role='img'
			aria-label={label}
			focusable='false'
			dangerouslySetInnerHTML={{ __html: SHELF }}
		/>
	)
}

export function Desk() {
	return (
		<svg
			className='ill ill--scene'
			viewBox='0 0 420 260'
			role='img'
			aria-label='Mesa de soporte con equipos etiquetados'
			focusable='false'
			dangerouslySetInnerHTML={{ __html: DESK }}
		/>
	)
}
