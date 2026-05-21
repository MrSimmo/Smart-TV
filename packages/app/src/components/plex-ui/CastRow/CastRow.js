// CastRow — circular portraits at the bottom of DetailsPlex. Sourced from
// the item's People array filtered to actor roles.

import {memo, useCallback} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';
import {getImageUrl} from '../../../utils/helpers';
import {useAuth} from '../../../context/AuthContext';

import css from './CastRow.module.less';

const SpottableButton = Spottable('button');
const RowContainer = SpotlightContainerDecorator({enterTo: 'last-focused'}, 'div');

const isActor = (p) => {
	const t = p?.Type;
	return t === 'Actor' || t === 'GuestStar';
};

const CastRow = ({people = [], onSelectPerson, limit = 12}) => {
	const {serverUrl} = useAuth();
	const cast = people.filter(isActor).slice(0, limit);

	const handleClick = useCallback((e) => {
		const id = e.currentTarget.dataset.personId;
		const person = people.find(p => p.Id === id);
		if (person) onSelectPerson?.(person);
	}, [people, onSelectPerson]);

	if (cast.length === 0) return null;

	return (
		<RowContainer className={css.row}>
			{cast.map(person => {
				const url = person.PrimaryImageTag
					? getImageUrl(serverUrl, person.Id, 'Primary', {maxHeight: 220, quality: 90, tag: person.PrimaryImageTag})
					: null;
				return (
					<SpottableButton
						key={person.Id}
						className={css.cell}
						onClick={handleClick}
						data-person-id={person.Id}
					>
						<span className={css.portrait}>
							{url ? <img src={url} alt={person.Name} /> : <span className={css.initial}>{(person.Name || '?').charAt(0)}</span>}
						</span>
						<span className={css.name}>{person.Name}</span>
						{person.Role ? <span className={css.role}>{person.Role}</span> : null}
					</SpottableButton>
				);
			})}
		</RowContainer>
	);
};

export default memo(CastRow);
