import isObject from 'lodash/isObject';
import type {ChartKitHtmlItem} from 'shared';

import {ChartKitCustomError} from '../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

import {ALLOWED_REFERENCES, ATTR_DATA_CE_THEME, THEME_CSS_VARIABLE_PREFIX} from './constants';

export function validateUrl(url: string, errorMsg?: string) {
    if (!ALLOWED_REFERENCES.some((ref) => String(url).startsWith(ref))) {
        const msg = errorMsg ?? `'${url}' is not valid url`;
        throw new ChartKitCustomError(undefined, {
            message: msg,
            details: msg,
        });
    }
}

type ChartKitHtmlItemTheme = NonNullable<ChartKitHtmlItem['theme']>;

function validateThemeProperties(theme: Record<string, string>) {
    Object.entries(theme).forEach(([key, value]) => {
        if (!key.startsWith(THEME_CSS_VARIABLE_PREFIX)) {
            const msg = `\nVariable name should be started from "${THEME_CSS_VARIABLE_PREFIX}"`;
            throw new ChartKitCustomError(undefined, {message: msg, details: msg});
        }
        if (typeof value !== 'string') {
            const msg = '\nVariable value should be a string';
            throw new ChartKitCustomError(undefined, {message: msg, details: msg});
        }
    });
}

function validateTheme(value: unknown): value is ChartKitHtmlItemTheme {
    if (!isObject(value)) {
        const msg = '\n"theme" property should be an object';
        throw new ChartKitCustomError(undefined, {message: msg, details: msg});
    }
    if (!('dark' in value) || !('light' in value)) {
        const msg = '\nYou should specify "theme.dark" and "theme.light" properties';
        throw new ChartKitCustomError(undefined, {message: msg, details: msg});
    }
    if (!isObject(value.dark) || !isObject(value.light)) {
        const msg = '\n"theme.dark" and "theme.light" properties should be objects';
        throw new ChartKitCustomError(undefined, {message: msg, details: msg});
    }

    Object.values(value).forEach((theme) => {
        validateThemeProperties(theme as Record<string, string>);
    });

    return true;
}

export function getThemeStyle(value: unknown, dataThemeId: string) {
    if (!validateTheme(value)) {
        // Add return for value type narrowing
        return '';
    }

    const themes = Object.entries(value).map(([theme, variables]) => {
        const baseSelector = `.g-root_theme_${theme} [${ATTR_DATA_CE_THEME}="${dataThemeId}"]`;
        const variableEntries = Object.entries(variables);
        const style = variableEntries.reduce((acc, [variable, variableValue], i) => {
            let nextAcc = `${acc}${variable}:${variableValue};`;
            if (i === variableEntries.length - 1) {
                nextAcc += '}';
            }
            return nextAcc;
        }, `${baseSelector},${baseSelector} * {`);

        return style;
    });

    return `<style>${themes.join('')}</style>`;
}
