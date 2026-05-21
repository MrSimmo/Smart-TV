// AccentPicker — row of accent-preset chips (ADR-005).
//
// Presets:
//   moonfin-purple  — #7C5CFC / #B89AFF (default; matches Moonfin brand)
//   plex-gamboge    — #E5A00D / #F2C66B (mockup-shown alternative)
//   jellyfin-indigo — #00A4DC / #4DC3F0 (upstream legacy default)
//   custom          — reuses settings.focusColor hex input — no duplicate UI
//
// Picking a preset updates settings.uiThemePreset AND keeps
// settings.focusColor in sync so the upstream UI (rendered when
// settings.uiTheme === 'original') continues to match.

import {memo, useCallback} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import $L from '@enact/i18n/$L';
import {useSettings} from '../../../context/SettingsContext';
import css from './AccentPicker.module.less';

const SpottableButton = Spottable('button');

export const ACCENT_PRESETS = [
	{id: 'moonfin-purple', label: 'Moonfin Purple', accent: '#7C5CFC', accent2: '#B89AFF'},
	{id: 'plex-gamboge', label: 'Plex Gamboge', accent: '#E5A00D', accent2: '#F2C66B'},
	{id: 'jellyfin-indigo', label: 'Jellyfin Indigo', accent: '#00A4DC', accent2: '#4DC3F0'},
	{id: 'custom', label: 'Custom', accent: null, accent2: null}
];

// Apply preset accent/accent-2 on :root. Caller is responsible for persisting
// the preset id (uiThemePreset) and the hex (focusColor) to settings.
export const applyAccentPreset = (preset, focusColorOverride) => {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	const accent = preset?.accent || focusColorOverride;
	const accent2 = preset?.accent2 || focusColorOverride;
	if (accent) {
		root.style.setProperty('--accent', accent);
		root.style.setProperty('--pill-bg', accent + '2E');
	}
	if (accent2) {
		root.style.setProperty('--accent-2', accent2);
	}
};

const AccentPicker = () => {
	const {settings, updateSettings} = useSettings();
	const current = settings.uiThemePreset || 'moonfin-purple';

	const handlePick = useCallback((presetId) => () => {
		const preset = ACCENT_PRESETS.find(p => p.id === presetId);
		if (!preset) return;
		// Persist both keys atomically. Custom preset keeps the existing
		// focusColor; named presets overwrite it so the upstream UI follows.
		const update = {uiThemePreset: presetId};
		if (preset.accent) update.focusColor = preset.accent;
		updateSettings(update);
		applyAccentPreset(preset, settings.focusColor);
	}, [updateSettings, settings.focusColor]);

	return (
		<div className={css.picker} role="radiogroup" aria-label={$L('Accent preset')}>
			{ACCENT_PRESETS.map(preset => {
				const isCurrent = current === preset.id;
				const swatchStyle = preset.accent ? {background: preset.accent} : undefined;
				return (
					<SpottableButton
						key={preset.id}
						className={`${css.chip} ${isCurrent ? css.active : ''}`}
						onClick={handlePick(preset.id)}
						role="radio"
						aria-checked={isCurrent}
					>
						<span className={css.swatch} style={swatchStyle} aria-hidden="true">
							{!preset.accent ? <span className={css.swatchHash}>#</span> : null}
						</span>
						<span className={css.label}>{$L(preset.label)}</span>
					</SpottableButton>
				);
			})}
		</div>
	);
};

export default memo(AccentPicker);
