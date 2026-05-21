// FilterMenu — popover menu for LibraryPlex filter chips (v0.1.1 bug #5).
//
// Props:
//   anchorEl     — DOM element of the chip that opened the menu. Used to
//                  position the menu beneath the chip's bounding box and to
//                  return Spotlight focus when the menu closes.
//   items        — array of {value, label}. `value === null` is allowed and
//                  means "clear this filter".
//   selectedValue — currently-applied filter value (or null).
//   onSelect     — called with the chosen value.
//   onClose      — called when the user dismisses without selecting (ESC,
//                  d-pad LEFT, or Back).
//
// Spotlight is trapped inside the menu via SpotlightContainerDecorator with
// restrict: 'self-only'. The menu obeys the legacy WebKit envelope (ADR-003)
// — no backdrop-filter, no flex/grid `gap`, transitions limited to transform
// and background/color.

import {memo, useCallback, useEffect, useRef} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import Spotlight from '@enact/spotlight';
import {isBackKey, KEYS} from '../../../utils/keys';

import css from './FilterMenu.module.less';

const MenuContainer = SpotlightContainerDecorator(
	{enterTo: 'last-focused', restrict: 'self-only'},
	'div'
);
const SpottableButton = Spottable('button');

const itemKey = (it, i) => {
	if (it.value === null || typeof it.value === 'undefined') return '__any__';
	return String(it.value) + '_' + i;
};

const FilterMenu = ({anchorEl, items = [], selectedValue, onSelect, onClose}) => {
	const ref = useRef(null);
	const closeRef = useRef(onClose);
	useEffect(() => { closeRef.current = onClose; }, [onClose]);

	// Position beneath the anchor's bounding box. Re-runs on anchor change.
	useEffect(() => {
		if (!anchorEl || !ref.current) return;
		const rect = anchorEl.getBoundingClientRect();
		const el = ref.current;
		el.style.top = (rect.bottom + 6) + 'px';
		el.style.left = rect.left + 'px';
	}, [anchorEl]);

	// Move Spotlight into the menu when it opens — onto the currently-selected
	// item if present, otherwise the first.
	useEffect(() => {
		const t = setTimeout(() => {
			const sel = items.findIndex(it => it.value === selectedValue);
			const idx = sel >= 0 ? sel : 0;
			Spotlight.focus('filtermenu-item-' + idx);
		}, 30);
		return () => clearTimeout(t);
	}, [items, selectedValue]);

	// ESC / Back / d-pad LEFT close the menu (per bug #5 spec).
	const handleKey = useCallback((e) => {
		if (isBackKey(e) || (e.keyCode || e.which) === KEYS.LEFT) {
			e.preventDefault();
			e.stopPropagation();
			closeRef.current?.();
		}
	}, []);

	const handleSelect = useCallback((value) => () => onSelect?.(value), [onSelect]);

	return (
		<MenuContainer
			className={css.menu}
			ref={ref}
			onKeyDown={handleKey}
			spotlightId="filtermenu"
		>
			{items.map((it, i) => (
				<SpottableButton
					key={itemKey(it, i)}
					className={`${css.item} ${selectedValue === it.value ? css.selected : ''}`}
					onClick={handleSelect(it.value)}
					spotlightId={'filtermenu-item-' + i}
				>
					{it.label}
				</SpottableButton>
			))}
		</MenuContainer>
	);
};

export default memo(FilterMenu);
