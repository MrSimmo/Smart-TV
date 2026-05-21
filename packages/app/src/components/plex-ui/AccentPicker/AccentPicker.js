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

// Hex → rgba string. Returns `null` if the input is not a 6-digit hex —
// callers fall back to the LESS-defined defaults from tokens.less in that
// case. Tizen 2.4 / WebKit r152340 does not support 8-digit hex (#RRGGBBAA),
// so all runtime alpha tints are written as rgba() (v0.1.1 bug #3).
const hexToRgba = (hex, alpha) => {
	if (typeof hex !== 'string') return null;
	const cleaned = hex.replace('#', '');
	if (cleaned.length !== 6) return null;
	const r = parseInt(cleaned.substring(0, 2), 16);
	const g = parseInt(cleaned.substring(2, 4), 16);
	const b = parseInt(cleaned.substring(4, 6), 16);
	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
	return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
};

// Apply preset accent/accent-2 on :root. Caller is responsible for persisting
// the preset id (uiThemePreset) and the hex (focusColor) to settings.
export const applyAccentPreset = (preset, focusColorOverride) => {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	const accent = preset?.accent || focusColorOverride;
	const accent2 = preset?.accent2 || focusColorOverride;
	if (accent) {
		root.style.setProperty('--accent', accent);
		// v0.1.1 bug #3: all derived alpha tints are runtime-computed via
		// hexToRgba (rgba()), never 8-digit hex.
		const pillBg = hexToRgba(accent, 0.18);
		const glow = hexToRgba(accent, 0.4);
		const glowStrong = hexToRgba(accent, 0.6);
		if (pillBg) root.style.setProperty('--pill-bg', pillBg);
		if (glow) root.style.setProperty('--accent-glow', glow);
		if (glowStrong) root.style.setProperty('--accent-glow-strong', glowStrong);
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
