// BrowsePlex — Plex-inspired home view.
//
// Renders the FeaturedHero on top and a Continue Watching row beneath. Data
// fetching reuses the same endpoints as the upstream Browse view:
//   - api.getRandomItems() for the featured selection
//   - api.getResumeItems() for the Continue Watching row
// (services/jellyfinApi.js:249 and :174 respectively).
//
// The upstream Browse view's full pipeline (theme music, multi-server unified
// mode, plugin-driven media bar) is not duplicated here — those are upstream
// concerns and remain available via the original Browse when uiTheme is
// 'original'. The Plex variant focuses on the visual treatment.

import {memo, useCallback, useEffect, useState, useRef} from 'react';
import $L from '@enact/i18n/$L';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import {useAuth} from '../../../context/AuthContext';
import {useSettings} from '../../../context/SettingsContext';
import {getLogoUrl} from '../../../utils/helpers';
import FeaturedHero from '../../../components/plex-ui/FeaturedHero';
import PosterCard from '../../../components/plex-ui/PosterCard';

import css from './BrowsePlex.module.less';

const RowContainer = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'div');
const TopBarContainer = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'div');
const SpottableButton = Spottable('button');

const BrowsePlex = ({
	onSelectItem,
	onPlay,
	onOpenSearch,
	onOpenSettings,
	isVisible = true
}) => {
	const {api, serverUrl} = useAuth();
	const {settings} = useSettings();

	const [featured, setFeatured] = useState(null);
	const [resumeItems, setResumeItems] = useState([]);
	const fetchedRef = useRef(false);

	useEffect(() => {
		if (!isVisible || !api || fetchedRef.current) return;
		fetchedRef.current = true;

		let cancelled = false;
		const limit = settings.featuredItemCount || 1;
		const contentType = settings.featuredContentType || 'both';
		Promise.all([
			api.getRandomItems(contentType, Math.max(1, limit)).catch(() => null),
			api.getResumeItems(12).catch(() => null)
		]).then(([rand, resume]) => {
			if (cancelled) return;
			const items = (rand?.Items || []).filter(i => i.Type !== 'BoxSet');
			if (items.length > 0) {
				const pick = items[0];
				setFeatured({...pick, LogoUrl: getLogoUrl(serverUrl, pick, {maxWidth: 800, quality: 90})});
			}
			setResumeItems(resume?.Items || []);
		}).catch(() => {});

		return () => { cancelled = true; };
	}, [api, serverUrl, isVisible, settings.featuredItemCount, settings.featuredContentType]);

	// FeaturedHero Play CTA → fire the upstream play pipeline (Player panel).
	const handlePlay = useCallback((item) => onPlay?.(item), [onPlay]);
	// FeaturedHero "more info" + general card-tap → open Details.
	const handleSelect = useCallback((item) => onSelectItem?.(item), [onSelectItem]);
	// Continue Watching cards resume directly into the Player.
	const handleResumePlay = useCallback((item) => onPlay?.(item, true), [onPlay]);

	return (
		<div className={css.view}>
			<TopBarContainer className={css.topBar}>
				<SpottableButton
					className={css.searchBtn}
					onClick={onOpenSearch}
					spotlightId="browseplex-search"
				>
					<svg viewBox="0 0 24 24" className={css.searchIcon}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
					<span>{$L('Search films, shows, music')}</span>
				</SpottableButton>
				<SpottableButton className={css.iconBtn} onClick={onOpenSettings} aria-label={$L('Settings')}>
					<svg viewBox="0 0 24 24" className={css.iconSvg}><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
				</SpottableButton>
			</TopBarContainer>

			<FeaturedHero item={featured} onPlay={handlePlay} onSelect={handleSelect} />

			{resumeItems.length > 0 && (
				<section className={css.section}>
					<header className={css.sectionHeader}>
						<h2 className={css.sectionTitle}>{$L('Continue Watching')}</h2>
						<SpottableButton className={css.seeAll}>{$L('See all')}</SpottableButton>
					</header>
					<RowContainer className={css.row}>
						{resumeItems.map((item, i) => (
							<PosterCard
								key={item.Id}
								item={item}
								variant="continue"
								onSelect={handleResumePlay}
								spotlightId={i === 0 ? 'row-0' : undefined}
							/>
						))}
					</RowContainer>
				</section>
			)}
		</div>
	);
};

export default memo(BrowsePlex);
