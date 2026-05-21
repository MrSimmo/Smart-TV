// FeaturedHero — Plex-style hero banner for the home view.
//
// Renders a backdrop image with a left-heavy linear-gradient scrim, the
// clear-logo title (via getLogoUrl) with typographic fallback, the metadata
// strip (rating pill, RT %, certificate, year, runtime, tech flags, genre
// pills), italic tagline, plot capped at 640px, and the primary Play CTA
// with optional resume sub-label.
//
// Gradient is a plain linear-gradient — `backdrop-filter` is forbidden in
// the legacy bundle (ADR-003).

import {memo, useCallback} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import $L from '@enact/i18n/$L';
import {getImageUrl, getBackdropId, getLogoUrl, formatDuration} from '../../../utils/helpers';
import {useAuth} from '../../../context/AuthContext';

import css from './FeaturedHero.module.less';

const HeroContainer = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'section');
const SpottableButton = Spottable('button');

const itemServerUrl = (item, fallback) => item?._serverUrl || fallback;

const formatResume = (item) => {
	const pos = item?.UserData?.PlaybackPositionTicks;
	if (!pos) return null;
	const totalSec = Math.floor(pos / 10000000);
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const pad = (n) => (n < 10 ? '0' + n : '' + n);
	return h > 0 ? `${h}:${pad(m)}` : `0:${pad(m)}`;
};

// Pick a display size for the typographic fallback based on title length.
// Range from ADR-003: @text-display-min..@text-display-max (60..160px).
const computeDisplaySize = (title) => {
	const len = (title || '').length;
	if (len <= 8) return 160;
	if (len <= 14) return 120;
	if (len <= 22) return 88;
	return 60;
};

const FeaturedHero = ({item, onPlay, onSelect}) => {
	const {serverUrl} = useAuth();
	// Hooks must run unconditionally — render-time bail comes after the hook
	// declarations.
	const handlePlay = useCallback(() => onPlay?.(item), [item, onPlay]);
	const handleMoreInfo = useCallback(() => onSelect?.(item), [item, onSelect]);

	if (!item) return <div className={css.heroEmpty} />;

	const url = itemServerUrl(item, serverUrl);

	const backdropId = getBackdropId(item);
	const backdropUrl = backdropId
		? getImageUrl(url, backdropId, 'Backdrop', {maxWidth: 1920, quality: 90})
		: null;

	const logoUrl = item.LogoUrl || getLogoUrl(url, item, {maxWidth: 800, quality: 90});

	const resumeStr = formatResume(item);
	const ctaSub = resumeStr ? `${$L('Resume from')} ${resumeStr}` : formatDuration(item.RunTimeTicks);

	const techFlags = [];
	const mediaSource = item.MediaSources?.[0];
	if (item.Width >= 3800 || mediaSource?.Name?.toLowerCase?.().includes('4k')) techFlags.push({label: '4K', tone: 'neutral'});
	if (item.VideoRangeType && item.VideoRangeType !== 'SDR') techFlags.push({label: item.VideoRangeType, tone: 'warn'});
	if (mediaSource?.MediaStreams?.some(s => s.Type === 'Audio' && /atmos/i.test(s.DisplayTitle || s.Profile || ''))) {
		techFlags.push({label: 'Atmos', tone: 'neutral'});
	}

	const rtScore = item.CriticRating;
	const imdb = item.CommunityRating;

	return (
		<HeroContainer className={css.hero}>
			{backdropUrl ? (
				<img className={css.backdrop} src={backdropUrl} alt="" aria-hidden="true" />
			) : null}
			<div className={css.scrim} />

			<div className={css.content}>
				{logoUrl ? (
					<img className={css.logo} src={logoUrl} alt={item.Name || ''} />
				) : (
					<h1
						className={`${css.title} plex-display`}
						style={{fontSize: computeDisplaySize(item.Name) + 'px'}}
					>{item.Name}</h1>
				)}

				<div className={css.meta}>
					{typeof imdb === 'number' && <span className={`${css.pill} ${css.good}`}>★ {imdb.toFixed(1)}</span>}
					{typeof rtScore === 'number' && <span className={css.pillText}>{Math.round(rtScore)}%</span>}
					{item.OfficialRating && <span className={css.cert}>{item.OfficialRating}</span>}
					{item.ProductionYear && <span className={css.metaText}>{item.ProductionYear}</span>}
					{item.RunTimeTicks && <span className={css.metaText}>{formatDuration(item.RunTimeTicks)}</span>}
					{techFlags.map(f => (
						<span key={f.label} className={`${css.tech} ${css['tech-' + f.tone]}`}>{f.label}</span>
					))}
				</div>

				{Array.isArray(item.Genres) && item.Genres.length > 0 && (
					<div className={css.genres}>
						{item.Genres.slice(0, 4).map(g => (
							<span key={g} className={css.genrePill}>{g}</span>
						))}
					</div>
				)}

				{item.Taglines?.[0] && (
					<p className={css.tagline}>&ldquo;{item.Taglines[0]}&rdquo;</p>
				)}

				{item.Overview && (
					<p className={css.plot}>{item.Overview}</p>
				)}

				<div className={css.ctaRow}>
					<SpottableButton
						className={css.cta}
						onClick={handlePlay}
						spotlightId="featured-hero-cta"
					>
						<span className={css.ctaIcon} aria-hidden="true">
							<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
						</span>
						<span className={css.ctaText}>
							<span className={css.ctaLabel}>{$L('Play')}</span>
							{ctaSub ? <span className={css.ctaSub}>{ctaSub}</span> : null}
						</span>
					</SpottableButton>
					<SpottableButton className={css.secondary} onClick={handleMoreInfo}>
						<span className={css.secondaryIcon} aria-hidden="true">+</span>
						<span>{$L('Add to Watchlist')}</span>
					</SpottableButton>
					<SpottableButton className={css.iconBtn} onClick={handleMoreInfo} aria-label={$L('More info')}>
						<svg viewBox="0 0 24 24" className={css.iconSvg}><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
					</SpottableButton>
				</div>
			</div>
		</HeroContainer>
	);
};

export default memo(FeaturedHero);
