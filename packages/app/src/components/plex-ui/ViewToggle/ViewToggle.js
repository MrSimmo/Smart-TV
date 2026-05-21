// ViewToggle — grid vs list. List mode is a "Coming soon" placeholder this
// phase; the toggle itself is fully focusable per TKT-05 acceptance.

import {memo, useCallback} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import css from './ViewToggle.module.less';

const SpottableButton = Spottable('button');

const GridIcon = (
	<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>
);
const ListIcon = (
	<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" /></svg>
);

const ViewToggle = ({mode = 'grid', onChange}) => {
	const choose = useCallback((m) => () => onChange?.(m), [onChange]);
	return (
		<div className={css.group} role="group">
			<SpottableButton
				className={`${css.btn} ${mode === 'grid' ? css.active : ''}`}
				onClick={choose('grid')}
				aria-label="Grid view"
			>
				<span className={css.icon}>{GridIcon}</span>
			</SpottableButton>
			<SpottableButton
				className={`${css.btn} ${mode === 'list' ? css.active : ''}`}
				onClick={choose('list')}
				aria-label="List view"
			>
				<span className={css.icon}>{ListIcon}</span>
			</SpottableButton>
		</div>
	);
};

export default memo(ViewToggle);
