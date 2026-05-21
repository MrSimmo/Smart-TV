// LibraryPlex — Plex-styled library/collection view.
//
// Layout (per design/mockups/moonfin_03_library.png; v0.1.1 ADR-006):
//   - Outer SidebarPlex (App.js-level) sits to the left of .content.
//   - Header: library title (36px / 700) + item count + 320px search button.
//   - FilterChip row: All Genres, Unwatched, 4K/HDR, Year, Rating, Sort.
//     Three distinct states (default / active / focused) per ADR-004.
//   - 7-column 2:3 poster grid (PosterGrid -> PosterCard 'poster' variant).
//   - v0.1.1: ViewToggle removed (list view never shipped); grid is the only
//     view.
//
// Filter & sort state is local to this view for the first release. Filters
// applied client-side over the fetched items; full server-side filter shape
// matching upstream is out of scope for TKT-05.

import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import $L from '@enact/i18n/$L';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import Spotlight from '@enact/spotlight';
import {useAuth} from '../../../context/AuthContext';
import FilterChip from '../../../components/plex-ui/FilterChip';
import FilterMenu from '../../../components/plex-ui/FilterMenu';
import PosterGrid from '../../../components/plex-ui/PosterGrid';

import css from './LibraryPlex.module.less';

const FilterRow = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'div');
const SpottableButton = Spottable('button');

const itemTypeForLibrary = (lib) => {
	const t = lib?.CollectionType?.toLowerCase();
	switch (t) {
		case 'movies': return 'Movie';
		case 'tvshows': return 'Series';
		case 'boxsets': return 'BoxSet';
		case 'music': return 'MusicAlbum,MusicArtist';
		case 'homevideos': return 'Video,Photo,PhotoAlbum';
		// Folders collections are heterogenous (movies + shows + videos mixed).
		// Returning '' makes the helper below omit IncludeItemTypes entirely so
		// the server returns whatever the folder contains.
		case 'folders': return '';
		default: return 'Movie,Series';
	}
};

const isUnwatched = (it) => it?.UserData && it.UserData.Played === false && it.UserData.PlayCount === 0 && !it.UserData.PlaybackPositionTicks;
const is4kOrHdr = (it) => {
	const v = it?.MediaSources?.[0]?.MediaStreams?.find(s => s.Type === 'Video');
	if (!v) return !!(it?.Width && it.Width >= 3800);
	return v.Width >= 3800 || (v.VideoRangeType && v.VideoRangeType !== 'SDR');
};

// v0.1.1 bug #5: rating buckets reflect Plex's standard ladder + "Any".
const RATING_BUCKETS = [
	{value: 9, label: '★ 9+'},
	{value: 8, label: '★ 8+'},
	{value: 7, label: '★ 7+'},
	{value: 6, label: '★ 6+'},
	{value: null, label: 'Any rating'}
];

// ADR-006: SidebarPlex is rendered once at the App level; LibraryPlex no
// longer renders an inline sidebar or accepts navigation handlers. The
// library header keeps its own search button — wired via the explicit
// onOpenSearch prop (same pattern as BrowsePlex).
const LibraryPlex = ({
	library,
	genreFilter,
	onSelectItem,
	onOpenSearch
}) => {
	const {api} = useAuth();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sortKey, setSortKey] = useState('SortName');
	const [unwatchedOnly, setUnwatchedOnly] = useState(false);
	const [uhdOnly, setUhdOnly] = useState(false);
	// v0.1.1 bug #5: FilterMenu-driven filters. genresLocal is distinct from
	// the App-level genreFilter (which arrives via prop from the Genres view).
	const [genresLocal, setGenresLocal] = useState(null);
	const [yearFilter, setYearFilter] = useState(null);
	const [ratingFilter, setRatingFilter] = useState(null);
	// Open-menu descriptor: {type, anchorEl, items, selectedValue, anchorId}.
	const [menuState, setMenuState] = useState(null);

	useEffect(() => {
		// v0.1.1 hotfix during QA: when a user picks a genre from the global
		// Genres view, App.js may pass a synthetic library with Id === null (or
		// no library at all). Either way, as long as we have a genre filter we
		// should still fetch across the whole server. Skip only when nothing
		// can constrain the query.
		if (!api || (!library && !genreFilter)) {
			setItems([]);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		const includeItemTypes = library ? itemTypeForLibrary(library) : 'Movie,Series';
		api.getItems({
			// ParentId is dropped entirely when null/missing — the server treats
			// the omission as "across the user's libraries", which is what the
			// global-genre flow needs.
			ParentId: library?.Id || undefined,
			IncludeItemTypes: includeItemTypes || undefined,
			Genres: genreFilter || undefined,
			Recursive: true,
			// `Genres` must be in Fields so the FilterMenu can populate its
			// distinct-genre list AND so any defensive client-side filter has
			// data to check; v0.1.0 omitted it which caused the genre flow to
			// drop every item (v0.1.1 QA bug).
			Fields: 'UserData,MediaSources,ProductionYear,Width,Genres',
			SortBy: sortKey,
			SortOrder: 'Ascending',
			Limit: 200,
			ImageTypeLimit: 1
		}).then(res => {
			if (cancelled) return;
			// The server-side Genres filter is authoritative — no client-side
			// re-filter. The v0.1.0 defence-in-depth pass was speculative
			// (unified-mode unknown) and turned into a footgun when items
			// arrived without a Genres array.
			setItems(res?.Items || []);
			setLoading(false);
		}).catch(() => {
			if (!cancelled) {
				setItems([]);
				setLoading(false);
			}
		});
		return () => { cancelled = true; };
	}, [api, library, sortKey, genreFilter]);

	const filtered = useMemo(() => {
		let out = items;
		if (unwatchedOnly) out = out.filter(isUnwatched);
		if (uhdOnly) out = out.filter(is4kOrHdr);
		if (genresLocal) out = out.filter(it => Array.isArray(it.Genres) && it.Genres.includes(genresLocal));
		if (yearFilter != null) out = out.filter(it => it.ProductionYear === yearFilter);
		if (ratingFilter != null) {
			out = out.filter(it => typeof it.CommunityRating === 'number' && it.CommunityRating >= ratingFilter);
		}
		return out;
	}, [items, unwatchedOnly, uhdOnly, genresLocal, yearFilter, ratingFilter]);

	// Distinct genres and years from the fetched items, for the filter menus.
	const distinctGenres = useMemo(() => {
		const seen = new Set();
		items.forEach(it => (it.Genres || []).forEach(g => { if (g) seen.add(g); }));
		return Array.from(seen).sort();
	}, [items]);

	const distinctYears = useMemo(() => {
		const seen = new Set();
		items.forEach(it => { if (typeof it.ProductionYear === 'number') seen.add(it.ProductionYear); });
		return Array.from(seen).sort((a, b) => b - a);
	}, [items]);

	const toggleUnwatched = useCallback(() => setUnwatchedOnly(v => !v), []);
	const toggleUhd = useCallback(() => setUhdOnly(v => !v), []);
	const cycleSort = useCallback(() => {
		setSortKey(prev => prev === 'SortName' ? 'PremiereDate' : prev === 'PremiereDate' ? 'CommunityRating' : prev === 'CommunityRating' ? 'DateCreated' : 'SortName');
	}, []);

	// v0.1.1 bug #5: filter-menu open/close + selection plumbing.
	const closeMenu = useCallback(() => {
		setMenuState(prev => {
			if (prev?.anchorId) {
				setTimeout(() => Spotlight.focus(prev.anchorId), 30);
			}
			return null;
		});
	}, []);

	// Snapshot the anchor chip's bounding rect at click-time so the menu can
	// position itself purely from props (SpotlightContainerDecorator does not
	// forward React refs to its DOM node).
	const rectOf = (el) => {
		if (!el || !el.getBoundingClientRect) return null;
		const r = el.getBoundingClientRect();
		return {top: r.top, left: r.left, bottom: r.bottom, right: r.right, width: r.width, height: r.height};
	};

	const openGenresMenu = useCallback((_v, anchor) => {
		const menuItems = [{value: null, label: $L('All Genres')}].concat(
			distinctGenres.map(g => ({value: g, label: g}))
		);
		setMenuState({type: 'genres', anchorRect: rectOf(anchor), anchorId: 'libplex-chip-genres', items: menuItems, selectedValue: genresLocal});
	}, [distinctGenres, genresLocal]);

	const openYearMenu = useCallback((_v, anchor) => {
		const menuItems = [{value: null, label: $L('Any year')}].concat(
			distinctYears.map(y => ({value: y, label: String(y)}))
		);
		setMenuState({type: 'year', anchorRect: rectOf(anchor), anchorId: 'libplex-chip-year', items: menuItems, selectedValue: yearFilter});
	}, [distinctYears, yearFilter]);

	const openRatingMenu = useCallback((_v, anchor) => {
		setMenuState({type: 'rating', anchorRect: rectOf(anchor), anchorId: 'libplex-chip-rating', items: RATING_BUCKETS, selectedValue: ratingFilter});
	}, [ratingFilter]);

	const handleMenuSelect = useCallback((value) => {
		setMenuState(prev => {
			if (!prev) return null;
			if (prev.type === 'genres') setGenresLocal(value);
			else if (prev.type === 'year') setYearFilter(value);
			else if (prev.type === 'rating') setRatingFilter(value);
			if (prev.anchorId) {
				setTimeout(() => Spotlight.focus(prev.anchorId), 30);
			}
			return null;
		});
	}, []);

	const genresChipLabel = genresLocal || $L('All Genres');
	const yearChipLabel = yearFilter != null ? String(yearFilter) : $L('Year');
	const ratingChipLabel = ratingFilter != null ? '★ ' + ratingFilter + '+' : $L('Rating');

	const sortLabel = sortKey === 'SortName' ? $L('Sort: Name')
		: sortKey === 'PremiereDate' ? $L('Sort: Year')
		: sortKey === 'CommunityRating' ? $L('Sort: Rating')
		: $L('Sort: Recently Added');

	const handleSelect = useCallback((item) => onSelectItem?.(item), [onSelectItem]);

	return (
		<div className={css.view}>
			<div className={css.content}>
				<header className={css.header}>
					<div className={css.titleRow}>
						<h1 className={css.title}>{library?.Name || genreFilter || $L('Library')}</h1>
						<span className={css.count}>{filtered.length.toLocaleString()} {$L('items')}</span>
					</div>
					<SpottableButton className={css.searchBtn} onClick={onOpenSearch}>
						<svg viewBox="0 0 24 24" className={css.searchIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
						<span>{$L('Search')}</span>
					</SpottableButton>
				</header>

				<FilterRow className={css.filters}>
					<FilterChip
						value="genres"
						hasMore
						active={!!genresLocal}
						spotlightId="libplex-chip-genres"
						onActivate={openGenresMenu}
					>{genresChipLabel}</FilterChip>
					<FilterChip value="unwatched" active={unwatchedOnly} onClick={toggleUnwatched}>{$L('Unwatched')}</FilterChip>
					<FilterChip value="uhd" active={uhdOnly} onClick={toggleUhd}>{$L('4K / HDR')}</FilterChip>
					<FilterChip
						value="year"
						hasMore
						active={yearFilter != null}
						spotlightId="libplex-chip-year"
						onActivate={openYearMenu}
					>{yearChipLabel}</FilterChip>
					<FilterChip
						value="rating"
						hasMore
						active={ratingFilter != null}
						spotlightId="libplex-chip-rating"
						onActivate={openRatingMenu}
					>{ratingChipLabel}</FilterChip>
					<FilterChip value="sort" active onClick={cycleSort}>{sortLabel}</FilterChip>
				</FilterRow>

				{menuState ? (
					<FilterMenu
						anchorRect={menuState.anchorRect}
						items={menuState.items}
						selectedValue={menuState.selectedValue}
						onSelect={handleMenuSelect}
						onClose={closeMenu}
					/>
				) : null}

				{loading ? (
					<div className={css.empty}>{$L('Loading…')}</div>
				) : filtered.length === 0 ? (
					<div className={css.empty}>{$L('No items found')}</div>
				) : (
					<PosterGrid items={filtered} onSelect={handleSelect} />
				)}
			</div>
		</div>
	);
};

export default memo(LibraryPlex);
