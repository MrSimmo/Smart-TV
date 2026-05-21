// DetailsPlex — Plex-styled item details view.
//
// Layout (per design/mockups/moonfin_02_details.png):
//   - SidebarPlex with collapsed={true} (88px rail) on the left.
//   - Breadcrumb at top (Library › Genre › Title).
//   - Clear-logo title block with typographic fallback.
//   - Facts row (rating, RT%, certificate, year, runtime, "In Library").
//   - Genre pills, tech badges.
//   - Tagline + plot capped at 640px.
//   - Primary Play CTA + 4 circular icon buttons.
//   - CrewStrip 2-column grid.
//   - CastRow circular portraits.
//
// Item data is fetched via the same api.getItem endpoint upstream Details
// consumes. The People array drives both the cast row and the crew strip;
// crew = non-actor roles, cast = Actor/GuestStar.

import {memo, useCallback, useEffect, useState} from 'react';
import $L from '@enact/i18n/$L';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import {useAuth} from '../../../context/AuthContext';
import {formatDuration, getImageUrl, getBackdropId, getLogoUrl} from '../../../utils/helpers';
import SidebarPlex from '../../../components/plex-ui/SidebarPlex';
import MetadataPill from '../../../components/plex-ui/MetadataPill';
import CrewStrip from '../../../components/plex-ui/CrewStrip';
import CastRow from '../../../components/plex-ui/CastRow';

import css from './DetailsPlex.module.less';

const ActionRow = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'div');
const SpottableButton = Spottable('button');

const formatResume = (item) => {
	const pos = item?.UserData?.PlaybackPositionTicks;
	if (!pos) return null;
	const totalSec = Math.floor(pos / 10000000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	const pad = (n) => (n < 10 ? '0' + n : '' + n);
	const remaining = (item.RunTimeTicks || 0) - pos;
	const remHours = Math.floor(remaining / 36000000000);
	const remMin = Math.floor((remaining % 36000000000) / 600000000);
	const stamp = `${h}:${pad(m)}:${pad(s)}`;
	const left = remHours > 0 ? `${remHours}h ${remMin}m left` : `${remMin}m left`;
	return {stamp, left};
};

const computeDisplaySize = (title) => {
	const len = (title || '').length;
	if (len <= 8) return 160;
	if (len <= 14) return 120;
	if (len <= 22) return 88;
	return 60;
};

const DetailsPlex = ({
	itemId,
	initialItem,
	onPlay,
	onSelectItem, // eslint-disable-line no-unused-vars
	onSelectPerson,
	libraries = [],
	activeView = '',
	onHome,
	onSearch,
	onShuffle,
	onGenres,
	onFavorites,
	onDiscover,
	onSettings,
	onSelectLibrary,
	onUserMenu,
	onSyncPlay
}) => {
	const {api, serverUrl} = useAuth();
	const [item, setItem] = useState(initialItem || null);

	useEffect(() => {
		if (!api || !itemId) return;
		let cancelled = false;
		api.getItem(itemId).then(data => {
			if (cancelled || !data) return;
			setItem(data);
		}).catch(() => {});
		return () => { cancelled = true; };
	}, [api, itemId]);

	const handlePlay = useCallback(() => {
		if (item) onPlay?.(item);
	}, [item, onPlay]);

	const handleSelectPerson = useCallback((person) => {
		if (onSelectPerson) onSelectPerson(person);
	}, [onSelectPerson]);

	if (!item) {
		return (
			<div className={css.view}>
				<SidebarPlex collapsed libraries={libraries} activeView={activeView}
					onHome={onHome} onSearch={onSearch} onShuffle={onShuffle}
					onGenres={onGenres} onFavorites={onFavorites} onDiscover={onDiscover}
					onSettings={onSettings} onSelectLibrary={onSelectLibrary}
					onUserMenu={onUserMenu} onSyncPlay={onSyncPlay} />
				<div className={css.content}>
					<div className={css.loadingDot} />
				</div>
			</div>
		);
	}

	const url = item._serverUrl || serverUrl;
	const backdropId = getBackdropId(item);
	const backdropUrl = backdropId
		? getImageUrl(url, backdropId, 'Backdrop', {maxWidth: 1920, quality: 90})
		: null;
	const logoUrl = getLogoUrl(url, item, {maxWidth: 800, quality: 90});

	const resume = formatResume(item);
	const ctaSub = resume
		? `${$L('Resume from')} ${resume.stamp} · ${resume.left}`
		: formatDuration(item.RunTimeTicks);

	const mediaSource = item.MediaSources?.[0];
	const video = mediaSource?.MediaStreams?.find(s => s.Type === 'Video');
	const techFlags = [];
	if (video?.Width >= 3800) techFlags.push({label: '4K UHD', variant: 'neutral'});
	if (video?.VideoRangeType && video.VideoRangeType !== 'SDR') techFlags.push({label: video.VideoRangeType, variant: 'warn'});
	if (mediaSource?.MediaStreams?.some(s => s.Type === 'Audio' && /atmos/i.test(s.DisplayTitle || s.Profile || ''))) {
		techFlags.push({label: 'Atmos', variant: 'neutral'});
	}

	return (
		<div className={css.view}>
			<SidebarPlex
				collapsed
				libraries={libraries}
				activeView={activeView}
				onHome={onHome}
				onSearch={onSearch}
				onShuffle={onShuffle}
				onGenres={onGenres}
				onFavorites={onFavorites}
				onDiscover={onDiscover}
				onSettings={onSettings}
				onSelectLibrary={onSelectLibrary}
				onUserMenu={onUserMenu}
				onSyncPlay={onSyncPlay}
			/>

			<div className={css.content}>
				{backdropUrl ? (
					<div className={css.backdropWrap}>
						<img className={css.backdrop} src={backdropUrl} alt="" aria-hidden="true" />
						<div className={css.scrim} />
					</div>
				) : null}

				<div className={css.body}>
					<nav className={css.breadcrumb}>
						<span className={css.crumb}>{item.Type === 'Series' ? $L('TV Shows') : $L('Movies')}</span>
						<span className={css.sep}>›</span>
						{item.Genres?.[0] ? <><span className={css.crumb}>{item.Genres[0]}</span><span className={css.sep}>›</span></> : null}
						<span className={`${css.crumb} ${css.crumbCurrent}`}>{item.Name}</span>
					</nav>

					{logoUrl ? (
						<img className={css.logo} src={logoUrl} alt={item.Name} />
					) : (
						<h1
							className={`${css.title} plex-display`}
							style={{fontSize: computeDisplaySize(item.Name) + 'px'}}
						>{item.Name}</h1>
					)}

					<div className={css.facts}>
						{typeof item.CommunityRating === 'number' && (
							<MetadataPill variant="good" icon="★">{item.CommunityRating.toFixed(1)}</MetadataPill>
						)}
						{typeof item.CriticRating === 'number' && (
							<MetadataPill variant="neutral">{Math.round(item.CriticRating)}%</MetadataPill>
						)}
						{item.OfficialRating && <MetadataPill variant="neutral">{item.OfficialRating}</MetadataPill>}
						{item.ProductionYear && <MetadataPill variant="neutral">{item.ProductionYear}</MetadataPill>}
						{item.RunTimeTicks && <MetadataPill variant="neutral">{formatDuration(item.RunTimeTicks)}</MetadataPill>}
						{/* "In Library" is informational; the user is browsing items already in the library. */}
						<MetadataPill variant="neutral">{$L('In Library')}</MetadataPill>
					</div>

					{Array.isArray(item.Genres) && item.Genres.length > 0 && (
						<div className={css.genres}>
							{item.Genres.slice(0, 6).map(g => (
								<MetadataPill key={g} variant="accent">{g}</MetadataPill>
							))}
						</div>
					)}

					{techFlags.length > 0 && (
						<div className={css.tech}>
							{techFlags.map(t => (
								<MetadataPill key={t.label} variant={t.variant}>{t.label}</MetadataPill>
							))}
						</div>
					)}

					{item.Taglines?.[0] && <p className={css.tagline}>&ldquo;{item.Taglines[0]}&rdquo;</p>}
					{item.Overview && <p className={css.plot}>{item.Overview}</p>}

					<ActionRow className={css.actions}>
						<SpottableButton
							className={css.primaryCta}
							onClick={handlePlay}
							spotlightId="details-primary-btn"
						>
							<span className={css.ctaIcon} aria-hidden="true">
								<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
							</span>
							<span className={css.ctaText}>
								<span className={css.ctaLabel}>{$L('Play')}</span>
								<span className={css.ctaSub}>{ctaSub}</span>
							</span>
						</SpottableButton>
						<SpottableButton className={css.circle} aria-label={$L('Mark watched')}>
							<svg viewBox="0 0 24 24" className={css.circleIcon}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
						</SpottableButton>
						<SpottableButton className={css.circle} aria-label={$L('Favourite')} spotlightId="details-favorite-btn">
							<svg viewBox="0 0 24 24" className={css.circleIcon}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
						</SpottableButton>
						<SpottableButton className={css.circle} aria-label={$L('Add to playlist')}>
							<svg viewBox="0 0 24 24" className={css.circleIcon}><path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zM3 16h7v-2H3v2zm11.41-2.83L13 14.59 16.17 17 13 19.41l1.41 1.42L18 17.83l-3.59-3.66z" /></svg>
						</SpottableButton>
						<SpottableButton className={css.circle} aria-label={$L('More')}>
							<svg viewBox="0 0 24 24" className={css.circleIcon}><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
						</SpottableButton>
					</ActionRow>

					<CrewStrip
						people={item.People || []}
						studios={item.Studios || []}
						premiereDate={item.PremiereDate}
						productionYear={item.ProductionYear}
					/>

					{(item.People || []).some(p => p?.Type === 'Actor' || p?.Type === 'GuestStar') && (
						<section className={css.castSection}>
							<header className={css.castHeader}>
								<h2 className={css.castTitle}>{$L('Cast & Crew')}</h2>
							</header>
							<CastRow people={item.People || []} onSelectPerson={handleSelectPerson} />
						</section>
					)}
				</div>
			</div>
		</div>
	);
};

// onSelectItem is forwarded by parent for completeness even though this view
// currently routes only via Play / Person selection.
export default memo(DetailsPlex);
