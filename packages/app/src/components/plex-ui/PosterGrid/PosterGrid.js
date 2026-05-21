// PosterGrid — 7-column 2:3 poster grid. Wraps PosterCard in `poster` variant
// (which itself implements the 2:3 ratio via padding-bottom 150% — the legacy
// WebKit gate forbids `aspect-ratio`).
//
// Pagination/virtualisation is intentionally NOT VirtualGridList in this
// variant — the upstream Library's virtualisation is tightly coupled to its
// own toolbar/sort/filter mosaic and reproducing it would mean a much wider
// change. For Plex-UI's first release we render a plain CSS grid; libraries
// over ~500 items should still scroll smoothly on Q90R because the DOM tree
// per card is shallow and `will-change` is scoped to near-focus only.

import {memo, useCallback, useRef} from 'react';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import PosterCard from '../PosterCard';
import css from './PosterGrid.module.less';

const GridContainer = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'div');

const PosterGrid = ({items = [], onSelect}) => {
	const focusRef = useRef(null);

	// Track focused card + its four spatial-nav neighbours and apply the
	// `data-near-focus` flag. ADR-004 GPU-VRAM scope.
	const handleCardFocus = useCallback((e) => {
		const target = e.target.closest('[role="button"]') || e.currentTarget;
		const grid = target.parentElement;
		if (!grid) return;
		if (focusRef.current) {
			focusRef.current.forEach(el => el?.removeAttribute('data-near-focus'));
		}
		const all = Array.from(grid.children);
		const idx = all.indexOf(target);
		if (idx === -1) return;
		// Spatial-nav neighbours: previous, next, up (idx-7), down (idx+7).
		const cols = 7;
		const near = [all[idx], all[idx - 1], all[idx + 1], all[idx - cols], all[idx + cols]].filter(Boolean);
		near.forEach(el => el.setAttribute('data-near-focus', 'true'));
		focusRef.current = near;
	}, []);

	return (
		<GridContainer
			className={css.grid}
			spotlightId="library-grid"
			onFocus={handleCardFocus}
		>
			{items.map((item, i) => (
				<PosterCard
					key={item.Id}
					item={item}
					variant="poster"
					onSelect={onSelect}
					spotlightId={i === 0 ? 'library-grid-first' : undefined}
				/>
			))}
		</GridContainer>
	);
};

export default memo(PosterGrid);
