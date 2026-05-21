// FilterChip — three explicitly distinct visual states (ADR-004):
//   default — surface-2 background, text-dim label.
//   active  — pill-bg background, accent-2 label, no scale (current value).
//   focused — solid accent, white label, scale 1.04, accent drop shadow.
//
// `active` and `focused` may both apply at the same time when the user is
// hovering their currently-applied filter. Focused wins visually via cascade
// order (`:focus` is defined after `.active` in the stylesheet).

import {memo, useCallback} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import css from './FilterChip.module.less';

const SpottableButton = Spottable('button');

// v0.1.1 bug #5: `onActivate` is the preferred handler (it receives both the
// chip value and the DOM element so the caller can anchor a FilterMenu).
// `onClick` is kept for chips that just toggle a boolean (Unwatched, 4K/HDR,
// Sort) — onActivate, if provided, wins.
const FilterChip = ({active = false, onClick, onActivate, children, spotlightId, value, hasMore = false}) => {
	const handle = useCallback((e) => {
		const fn = onActivate || onClick;
		fn?.(value, e?.currentTarget);
	}, [onActivate, onClick, value]);
	return (
		<SpottableButton
			className={`${css.chip} ${active ? css.active : ''}`}
			onClick={handle}
			spotlightId={spotlightId}
		>
			<span>{children}</span>
			{hasMore ? <span className={css.chevron} aria-hidden="true">▾</span> : null}
		</SpottableButton>
	);
};

export default memo(FilterChip);
