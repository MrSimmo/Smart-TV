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

const FilterChip = ({active = false, onClick, children, spotlightId, value, hasMore = false}) => {
	const handle = useCallback(() => onClick?.(value), [onClick, value]);
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
