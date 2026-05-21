// Plex-inspired left navigation. ADR-001: net-new file (sibling to upstream
// Sidebar, not a wrapper). ADR-004: two distinct focus states — `active` for
// the current route, `:focus` for the Spotlight cursor. Focused trumps active
// visually because the d-pad cursor is the user's primary attention anchor.
//
// Props mirror the upstream Sidebar so the App.js routing branch is a
// straightforward swap. Additions:
//   - activeView: the upstream getActiveView() result used to highlight the
//     current route. App.js already computes this for NavBar; we reuse.
//   - collapsed: 88px icon-only rail used by DetailsPlex (TKT-04).

import {memo, useCallback, useState, useEffect, useRef} from 'react';
import $L from '@enact/i18n/$L';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import Spotlight from '@enact/spotlight';
import {useAuth} from '../../../context/AuthContext';
import {useSettings} from '../../../context/SettingsContext';
import {useJellyseerr} from '../../../context/JellyseerrContext';
import {useSyncPlay} from '../../../context/SyncPlayContext';
import JellyseerrIcon from '../../icons/JellyseerrIcon';
import SyncPlayIcon from '../../icons/SyncPlayIcon';
import SeerrIcon from '../../icons/SeerrIcon';
import {KEYS} from '../../../utils/keys';

import css from './SidebarPlex.module.less';

const SidebarContainer = SpotlightContainerDecorator({
	enterTo: 'last-focused',
	preserveId: true
}, 'nav');

const SpottableButton = Spottable('button');

// Hostname-only display for the server footer. Strips protocol + path so a
// long Jellyfin URL like https://media.example.co.uk/jellyfin becomes
// "media.example.co.uk".
const serverHostname = (url) => {
	if (!url || typeof url !== 'string') return '';
	try {
		return new URL(url).hostname;
	} catch (_e) {
		return url.replace(/^https?:\/\//, '').split('/')[0];
	}
};

const SidebarPlex = ({
	libraries = [],
	activeView = '',
	collapsed = false,
	onHome,
	onSearch,
	onShuffle, // eslint-disable-line no-unused-vars
	onGenres,
	onFavorites,
	onDiscover,
	onSettings,
	onSelectLibrary,
	onUserMenu,
	onSyncPlay
}) => {
	const {user, serverUrl} = useAuth();
	const {settings} = useSettings();
	const {isEnabled: jellyseerrEnabled, isMoonfin, variant, displayName} = useJellyseerr();
	const {isInGroup} = useSyncPlay();
	const [avatarError, setAvatarError] = useState(false);
	const nearFocusRef = useRef(null);

	const userAvatarUrl = user?.PrimaryImageTag
		? `${serverUrl}/Users/${user.Id}/Images/Primary?tag=${user.PrimaryImageTag}&quality=90&maxHeight=120`
		: null;

	const handleAvatarError = useCallback(() => setAvatarError(true), []);

	const handleLibraryClick = useCallback((e) => {
		const libId = e.currentTarget.dataset.libraryId;
		const lib = libraries.find(l => l.Id === libId);
		if (lib) onSelectLibrary?.(lib);
	}, [libraries, onSelectLibrary]);

	// ADR-004: track near-focus so `will-change: transform` applies only to
	// the focused row and its immediate siblings, never the whole list.
	const handleRowFocus = useCallback((e) => {
		const row = e.currentTarget;
		const list = row.parentElement;
		if (!list) return;
		// Clear previous near-focus markers.
		if (nearFocusRef.current) {
			const prevSiblings = nearFocusRef.current;
			prevSiblings.forEach(el => el.removeAttribute('data-near-focus'));
		}
		const siblings = Array.from(list.children).filter(c => c.classList && c.classList.contains(css.row));
		const idx = siblings.indexOf(row);
		const near = [siblings[idx], siblings[idx - 1], siblings[idx + 1]].filter(Boolean);
		near.forEach(el => el.setAttribute('data-near-focus', 'true'));
		nearFocusRef.current = near;
	}, []);

	// Route d-pad RIGHT out of the sidebar into the main content area, matching
	// the upstream Sidebar's behaviour.
	const handleKeyDown = useCallback((e) => {
		if (e.keyCode === KEYS.RIGHT) {
			e.preventDefault();
			e.stopPropagation();
			const targets = [
				'featured-hero-cta',
				'featured-banner',
				'row-0',
				'details-primary-btn',
				'library-grid',
				'search-input'
			];
			for (const t of targets) {
				if (Spotlight.focus(t)) return;
			}
			Spotlight.setPointerMode(false);
			Spotlight.move('right');
		}
	}, []);

	useEffect(() => () => {
		if (nearFocusRef.current) {
			nearFocusRef.current.forEach(el => el?.removeAttribute('data-near-focus'));
		}
	}, []);

	const isActive = (route) => activeView === route;
	const isActiveLibrary = (id) => activeView === id;

	const renderRow = (key, icon, label, onClick, opts = {}) => {
		const {active, badge, spotlightId} = opts;
		return (
			<SpottableButton
				key={key}
				className={`${css.row} ${active ? css.active : ''}`}
				onClick={onClick}
				onFocus={handleRowFocus}
				spotlightId={spotlightId}
			>
				<span className={css.iconCol} aria-hidden="true">{icon}</span>
				<span className={css.label}>{label}</span>
				{badge ? <span className={css.badge}>{badge}</span> : null}
			</SpottableButton>
		);
	};

	const HomeIcon = (
		<svg className={css.icon} viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
	);
	const SearchIcon = (
		<svg className={css.icon} viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
	);
	const GenresIcon = (
		<svg className={css.icon} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
	);
	const FavoritesIcon = (
		<svg className={css.icon} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
	);
	const SettingsIcon = (
		<svg className={css.icon} viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
	);
	const LibraryIcon = (
		<svg className={css.icon} viewBox="0 0 24 24"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" /></svg>
	);
	const ChevronIcon = (
		<svg className={css.chevron} viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
	);

	return (
		<SidebarContainer
			className={`${css.sidebar} ${collapsed ? css.collapsed : ''}`}
			onKeyDown={handleKeyDown}
			spotlightId="navbar"
		>
			<div className={css.brand}>
				{/* v0.1.1 bug #16: typographic "SP" mark replaces the diamond + */}
				{/* "Moonfin" wordmark. Same span renders in both expanded and    */}
				{/* collapsed states; .brand styles handle the size and centring. */}
				<span className={css.brandText} aria-hidden="true">SP</span>
			</div>

			<div className={css.section}>
				{!collapsed ? <div className={css.sectionLabel}>{$L('Discover')}</div> : null}
				{renderRow('home', HomeIcon, $L('Home'), onHome, {active: isActive('home'), spotlightId: 'navbar-home'})}
				{renderRow('search', SearchIcon, $L('Search'), onSearch, {active: isActive('search')})}
				{settings.showGenresButton !== false && renderRow('genres', GenresIcon, $L('Genres'), onGenres, {active: isActive('genres')})}
				{settings.showFavoritesButton !== false && renderRow('favorites', FavoritesIcon, $L('Favorites'), onFavorites, {active: isActive('favorites')})}
			</div>

			{libraries.length > 0 && (
				<div className={css.section}>
					{!collapsed ? <div className={css.sectionLabel}>{$L('Libraries')}</div> : null}
					{libraries.map(lib => (
						<SpottableButton
							key={lib.Id}
							className={`${css.row} ${isActiveLibrary(lib.Id) ? css.active : ''}`}
							onClick={handleLibraryClick}
							onFocus={handleRowFocus}
							data-library-id={lib.Id}
						>
							<span className={css.iconCol} aria-hidden="true">{LibraryIcon}</span>
							<span className={css.label}>{lib.Name}</span>
						</SpottableButton>
					))}
				</div>
			)}

			<div className={css.section}>
				{!collapsed ? <div className={css.sectionLabel}>{$L('More')}</div> : null}
				{jellyseerrEnabled && renderRow(
					'discover',
					isMoonfin && variant === 'seerr' ? <SeerrIcon className={css.icon} /> : <JellyseerrIcon className={css.icon} />,
					displayName,
					onDiscover,
					{active: isActive('discover')}
				)}
				{settings.showSyncPlayButton !== false && renderRow(
					'syncplay',
					<SyncPlayIcon className={css.icon} />,
					'SyncPlay',
					onSyncPlay,
					{active: isInGroup}
				)}
				{renderRow('settings', SettingsIcon, $L('Settings'), onSettings, {active: isActive('settings'), spotlightId: 'navbar-settings'})}
			</div>

			<div className={css.footer}>
				<SpottableButton
					className={css.userBtn}
					onClick={onUserMenu}
					onFocus={handleRowFocus}
				>
					{userAvatarUrl && !avatarError ? (
						<img className={css.avatarImg} src={userAvatarUrl} alt={user?.Name || ''} onError={handleAvatarError} />
					) : (
						<div className={css.avatarFallback}>{user?.Name?.[0] || 'U'}</div>
					)}
					{!collapsed ? (
						<span className={css.userMeta}>
							<span className={css.userName}>{user?.Name || $L('User')}</span>
							<span className={css.userServer}>{serverHostname(serverUrl)}</span>
						</span>
					) : null}
					{!collapsed ? ChevronIcon : null}
				</SpottableButton>
			</div>
		</SidebarContainer>
	);
};

export default memo(SidebarPlex);
