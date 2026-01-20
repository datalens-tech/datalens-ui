import type {
    BackgroundSettings,
    ColorByTheme,
    ColorSettings,
    OldBackgroundSettings,
    TitleTextSettings,
} from '../types/dash';

export function isOldBackgroundSettings(value: unknown): value is OldBackgroundSettings {
    return (
        typeof value === 'object' &&
        value !== null &&
        'color' in value &&
        typeof value.color === 'string' &&
        ('enabled' in value
            ? typeof value.enabled === 'boolean' || value.enabled === undefined
            : true)
    );
}

export function isColorByTheme(value: unknown): value is ColorByTheme {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.entries(value).every(
            ([key, val]) =>
                ['light', 'dark'].includes(key) && ['string', 'undefined'].includes(typeof val),
        )
    );
}

export function isColorSettings(value: unknown): value is ColorSettings {
    return typeof value === 'string' || isColorByTheme(value);
}
function isSettingsWithColor(value: unknown): value is {color?: ColorSettings} {
    return (
        typeof value === 'object' &&
        value !== null &&
        'color' in value &&
        (value.color === undefined ||
            typeof value.color === 'string' ||
            isColorSettings(value.color))
    );
}

export function isBackgroundSettings(value: unknown): value is BackgroundSettings {
    return isSettingsWithColor(value);
}

export function isTextSettings(value: unknown): value is TitleTextSettings {
    return isSettingsWithColor(value);
}

export const getAllTabItems = <T>(tab?: {items: T[]; globalItems?: T[]} | null) => {
    if (!tab) {
        return [];
    }

    return tab.items.concat(tab.globalItems || []);
};
