// Generic poster card. Two variants:
//   - continue: 296×168 landscape, used by the Continue Watching row.
//                Resume progress bar at the bottom.
//   - poster:   2:3 portrait, used by the library grid (TKT-05). Implemented
//                via the padding-bottom: 150% trick — the legacy WebKit gate
//                forbids the `aspect-ratio` CSS property (ADR-003).
//
// Focus model per ADR-004: solid --accent ring + scale on :focus. Active is
// not applicable here (cards don't have a current-route concept).

import {memo, useCallback} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import {getImageUrl, getBackdropId, getPrimaryImageId} from '../../../utils/helpers';
import {useAuth} from '../../../context/AuthContext';

import css from './PosterCard.module.less';

const SpottableDiv = Spottable('div');

const itemServerUrl = (item, fallback) => item?._serverUrl || fallback;

const getResumePercent = (item) => {
	const played = item?.UserData?.PlayedPercentage;
	if (typeof played === 'number' && played > 0 && played < 100) return played;
	const pos = item?.UserData?.PlaybackPositionTicks;
	const total = item?.RunTimeTicks;
	if (pos && total) return Math.min(99, Math.max(0, (pos / total) * 100));
	return 0;
};

const PosterCard = ({item, variant = 'poster', onSelect, spotlightId, badge}) => {
	const {serverUrl} = useAuth();
	const url = itemServerUrl(item, serverUrl);

	let imageUrl = null;
	if (variant === 'continue') {
		// Continue Watching prefers backdrop (16:9). Fall back to primary if
		// no backdrop exists.
		const backId = getBackdropId(item);
		if (backId) {
			imageUrl = getImageUrl(url, backId, 'Backdrop', {maxWidth: 600, quality: 85});
		} else {
			const primaryId = getPrimaryImageId(item);
			if (primaryId) imageUrl = getImageUrl(url, primaryId, 'Primary', {maxWidth: 600, quality: 85});
		}
	} else {
		const primaryId = getPrimaryImageId(item);
		if (primaryId) imageUrl = getImageUrl(url, primaryId, 'Primary', {maxWidth: 400, quality: 85});
	}

	const handleClick = useCallback(() => {
		onSelect?.(item);
	}, [item, onSelect]);

	const resumePct = getResumePercent(item);
	const unwatched = item?.UserData && item.UserData.Played === false && item.UserData.PlayCount === 0 && !resumePct;

	const title = item?.Name || '';
	const subtitle = variant === 'continue'
		? (item?.Type === 'Episode'
			? `${item.SeriesName || ''} · S${item.ParentIndexNumber || ''}E${item.IndexNumber || ''}`
			: (item?.ProductionYear || ''))
		: (item?.ProductionYear || '');

	return (
		<SpottableDiv
			className={`${css.card} ${css['variant-' + variant]}`}
			onClick={handleClick}
			spotlightId={spotlightId}
			role="button"
		>
			<div className={css.frame}>
				<div className={css.fill}>
					{imageUrl ? (
						<img className={css.image} src={imageUrl} alt={title} />
					) : (
						<div className={css.placeholder}>{title.charAt(0) || '?'}</div>
					)}
					{badge ? <div className={css.badge}>{badge}</div> : null}
					{unwatched ? <div className={css.unwatchedDot} aria-hidden="true" /> : null}
					{resumePct > 0 ? (
						<div className={css.progressTrack}>
							<div className={css.progressFill} style={{width: resumePct + '%'}} />
						</div>
					) : null}
				</div>
			</div>
			<div className={css.meta}>
				<div className={css.title}>{title}</div>
				{subtitle ? <div className={css.subtitle}>{subtitle}</div> : null}
			</div>
		</SpottableDiv>
	);
};

export default memo(PosterCard);
