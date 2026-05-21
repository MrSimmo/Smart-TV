// CrewStrip — 2-column label/value grid for director, writers, studio, etc.
// Sourced from the item's People array (filtered by Type/Role).

import {memo} from 'react';
import $L from '@enact/i18n/$L';
import css from './CrewStrip.module.less';

const groupCrew = (people = []) => {
	const groups = {};
	people.forEach(p => {
		const role = p.Type || p.Role;
		if (!role || role === 'Actor' || role === 'GuestStar') return;
		if (!groups[role]) groups[role] = [];
		groups[role].push(p.Name);
	});
	return groups;
};

const labels = {
	Director: 'Director',
	Producer: 'Producer',
	Writer: 'Writers'
};

const CrewStrip = ({people = [], studios = [], premiereDate, productionYear}) => {
	const groups = groupCrew(people);
	const directors = groups.Director;
	const writers = groups.Writer;

	const studioName = studios?.[0]?.Name || studios?.[0];
	const released = premiereDate ? new Date(premiereDate).toLocaleDateString() : productionYear;

	return (
		<dl className={css.strip}>
			{directors && (
				<>
					<dt className={css.label}>{$L(labels.Director)}</dt>
					<dd className={css.value}>{directors.join(', ')}</dd>
				</>
			)}
			{writers && (
				<>
					<dt className={css.label}>{$L(labels.Writer)}</dt>
					<dd className={css.value}>{writers.join(', ')}</dd>
				</>
			)}
			{studioName && (
				<>
					<dt className={css.label}>{$L('Studio')}</dt>
					<dd className={css.value}>{studioName}</dd>
				</>
			)}
			{released && (
				<>
					<dt className={css.label}>{$L('Released')}</dt>
					<dd className={css.value}>{released}</dd>
				</>
			)}
		</dl>
	);
};

export default memo(CrewStrip);
