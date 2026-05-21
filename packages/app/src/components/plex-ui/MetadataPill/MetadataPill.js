// Generic metadata pill. Reused across facts row and tech badges in the
// Details view, and similar surfaces elsewhere.
//
// Variants:
//   good     — green tint (rating > threshold)
//   warn     — amber tint (HDR badge, warnings)
//   accent   — accent tint (genre pills)
//   neutral  — surface-2 background (defaults / certificate / runtime)

import {memo} from 'react';
import css from './MetadataPill.module.less';

const MetadataPill = ({variant = 'neutral', icon, children, className}) => {
	const cls = `${css.pill} ${css['variant-' + variant]} ${className || ''}`.trim();
	return (
		<span className={cls}>
			{icon ? <span className={css.icon} aria-hidden="true">{icon}</span> : null}
			<span className={css.label}>{children}</span>
		</span>
	);
};

export default memo(MetadataPill);
