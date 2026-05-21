// LibraryPlex — Plex-styled library/collection view.
//
// Layout (per design/mockups/moonfin_03_library.png):
//   - SidebarPlex at the full 280px expanded width (not collapsed).
//   - Header: library title (36px / 700) + item count + 320px search button.
//   - FilterChip row: All Genres, Unwatched, 4K/HDR, Year, Rating, Sort.
//     Three distinct states (default / active / focused) per ADR-004.
//   - ViewToggle (grid / list) at top-right of the filter row.
//   - 7-column 2:3 poster grid (PosterGrid -> PosterCard 'poster' variant).
//
// Filter & sort state is local to this view for the first release. Filters
// applied client-side over the fetched items; full server-side filter shape
// matching upstream is out of scope for TKT-05.

import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import $L from '@enact/i18n/$L';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import {useAuth} from '../../../context/AuthContext';
import FilterChip from '../../../components/plex-ui/FilterChip';
import PosterGrid from '../../../components/plex-ui/PosterGrid';
import ViewToggle from '../../../components/plex-ui/ViewToggle';

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
		default: return 'Movie,Series';
	}
};

const isUnwatched = (it) => it?.UserData && it.UserData.Played === false && it.UserData.PlayCount === 0 && !it.UserData.PlaybackPositionTicks;
const is4kOrHdr = (it) => {
	const v = it?.MediaSources?.[0]?.MediaStreams?.find(s => s.Type === 'Video');
	if (!v) return !!(it?.Width && it.Width >= 3800);
	return v.Width >= 3800 || (v.VideoRangeType && v.VideoRangeType !== 'SDR');
};

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
	const [viewMode, setViewMode] = useState('grid');

	useEffect(() => {
		if (!api || !library) {
			setItems([]);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		api.getItems({
			ParentId: library.Id,
			IncludeItemTypes: itemTypeForLibrary(library),
			Genres: genreFilter || undefined,
			Recursive: true,
			Fields: 'UserData,MediaSources,ProductionYear,Width',
			SortBy: sortKey,
			SortOrder: 'Ascending',
			Limit: 200,
			ImageTypeLimit: 1
		}).then(res => {
			if (cancelled) return;
			let result = res?.Items || [];
			// Defence-in-depth: server-side Genres filter is the primary path;
			// the client-side pass below also catches unified-mode results that
			// may bypass the server param.
			if (genreFilter) {
				result = result.filter(it => Array.isArray(it.Genres) && it.Genres.includes(genreFilter));
			}
			setItems(result);
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
		return out;
	}, [items, unwatchedOnly, uhdOnly]);

	const toggleUnwatched = useCallback(() => setUnwatchedOnly(v => !v), []);
	const toggleUhd = useCallback(() => setUhdOnly(v => !v), []);
	const cycleSort = useCallback(() => {
		setSortKey(prev => prev === 'SortName' ? 'PremiereDate' : prev === 'PremiereDate' ? 'CommunityRating' : prev === 'CommunityRating' ? 'DateCreated' : 'SortName');
	}, []);

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
						<h1 className={css.title}>{library?.Name || $L('Library')}</h1>
						<span className={css.count}>{filtered.length.toLocaleString()} {$L('items')}</span>
					</div>
					<SpottableButton className={css.searchBtn} onClick={onOpenSearch}>
						<svg viewBox="0 0 24 24" className={css.searchIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
						<span>{$L('Search')} {library?.Name || ''}</span>
					</SpottableButton>
				</header>

				<FilterRow className={css.filters}>
					<FilterChip value="genres" hasMore>{$L('All Genres')}</FilterChip>
					<FilterChip value="unwatched" active={unwatchedOnly} onClick={toggleUnwatched}>{$L('Unwatched')}</FilterChip>
					<FilterChip value="uhd" active={uhdOnly} onClick={toggleUhd}>{$L('4K / HDR')}</FilterChip>
					<FilterChip value="year" hasMore>{$L('Year')}</FilterChip>
					<FilterChip value="rating" hasMore>{$L('Rating')}</FilterChip>
					<FilterChip value="sort" active onClick={cycleSort}>{sortLabel}</FilterChip>
					<span className={css.viewToggleWrap}>
						<ViewToggle mode={viewMode} onChange={setViewMode} />
					</span>
				</FilterRow>

				{loading ? (
					<div className={css.empty}>{$L('Loading…')}</div>
				) : filtered.length === 0 ? (
					<div className={css.empty}>{$L('No items found')}</div>
				) : viewMode === 'list' ? (
					// List view deferred — toggle remains focusable per TKT-05 spec.
					<div className={css.empty}>{$L('List view — coming soon')}</div>
				) : (
					<PosterGrid items={filtered} onSelect={handleSelect} />
				)}
			</div>
		</div>
	);
};

export default memo(LibraryPlex);
