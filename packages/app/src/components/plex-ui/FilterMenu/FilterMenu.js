// FilterMenu — popover menu for LibraryPlex filter chips (v0.1.1 bug #5).
//
// Props:
//   anchorRect   — DOMRect-like {top, left, bottom, right, width, height}
//                  describing the chip that opened the menu. Used to position
//                  the menu beneath the chip without touching the DOM.
//                  Callers compute the rect once via
//                  `event.currentTarget.getBoundingClientRect()` so this
//                  component stays pure-render.
//   items        — array of {value, label}. `value === null` is allowed and
//                  means "clear this filter".
//   selectedValue — currently-applied filter value (or null).
//   onSelect     — called with the chosen value.
//   onClose      — called when the user dismisses without selecting (ESC,
//                  d-pad LEFT, or Back).
//
// Spotlight is trapped inside the menu via SpotlightContainerDecorator with
// restrict: 'self-only'. SpotlightContainerDecorator does not forward refs to
// its DOM node, so positioning is done via inline style from `anchorRect`
// rather than imperative ref.current.style mutation (v0.1.1 QA fix).
//
// The menu obeys the legacy WebKit envelope (ADR-003) — no backdrop-filter,
// no flex/grid `gap`, transitions limited to transform and background/color.

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

const FilterMenu = ({anchorRect, items = [], selectedValue, onSelect, onClose}) => {
	const closeRef = useRef(onClose);
	useEffect(() => { closeRef.current = onClose; }, [onClose]);

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

	const positionStyle = anchorRect
		? {top: (anchorRect.bottom + 6) + 'px', left: anchorRect.left + 'px'}
		: undefined;

	return (
		<MenuContainer
			className={css.menu}
			style={positionStyle}
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
