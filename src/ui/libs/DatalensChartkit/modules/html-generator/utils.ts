import escape from 'lodash/escape';
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

function validateThemesConsistency(
    theme: ChartKitHtmlItemTheme,
    themeKeysToCheck: (keyof ChartKitHtmlItemTheme)[],
) {
    const missedVariables: Record<string, string[]> = {};
    themeKeysToCheck.forEach((targetKey) => {
        const targetThemeVariables = Object.keys(theme[targetKey] || {});
        themeKeysToCheck
            .filter((key) => key !== targetKey)
            .forEach((key) => {
                const themeVariables = Object.keys(theme[key] || {});
                targetThemeVariables.forEach((varName) => {
                    if (!themeVariables.includes(varName)) {
                        if (!missedVariables[key]) {
                            missedVariables[key] = [];
                        }
                        missedVariables[key].push(varName);
                    }
                });
            });
    });

    const hasMissedVariables = Object.values(missedVariables).some(
        (variables) => variables?.length,
    );

    if (hasMissedVariables) {
        let msg = '\nInconsistent defining of variables among themes.\n\n';
        Object.entries(missedVariables).forEach(([themeKey, variables]) => {
            msg += `Missing variables in ${themeKey} theme:\n${variables.join('\n')}\n\n`;
        });
        msg += 'You should define missing variables due to have a consistent theme configuration.';
        throw new ChartKitCustomError(undefined, {message: msg, details: msg});
    }
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
    if (
        !isObject(value.dark) ||
        !isObject(value.light) ||
        ('dark-hc' in value && !isObject(value['dark-hc'])) ||
        ('light-hc' in value && !isObject(value['light-hc']))
    ) {
        const msg = '\nTheme properties should be objects';
        throw new ChartKitCustomError(undefined, {message: msg, details: msg});
    }

    Object.values(value as ChartKitHtmlItemTheme).forEach((theme) => {
        validateThemeProperties(theme);
    });

    validateThemesConsistency(value as ChartKitHtmlItemTheme, ['dark', 'light']);

    return true;
}

function getThemeSelector(theme: string, dataThemeId: string) {
    const isHcTheme = theme.endsWith('hc');
    // Add ".g-root" class to increase specificity for high contrast
    // theme due to fallback selectors for regular light and dark themes
    const baseSelector = `${isHcTheme ? '.g-root' : ''}.g-root_theme_${theme} [${ATTR_DATA_CE_THEME}="${dataThemeId}"]`;
    const baseHCSelector = isHcTheme
        ? ''
        : // Add fallback for high contrast theme in order
          // not to force users to define all available themes
          `.g-root_theme_${theme}-hc [${ATTR_DATA_CE_THEME}="${dataThemeId}"]`;
    return baseHCSelector
        ? `${baseSelector},${baseSelector} *,${baseHCSelector},${baseHCSelector} * {`
        : `${baseSelector},${baseSelector} * {`;
}

export function getThemeStyle(value: unknown, dataThemeId: string) {
    if (!validateTheme(value)) {
        // Add return for value type narrowing
        return '';
    }

    const themes = Object.entries(value).map(([theme, variables]) => {
        const variableEntries = Object.entries(variables);
        const style = variableEntries.reduce(
            (acc, [variable, variableValue], i) => {
                const escapedVariable = escape(`${variable}:${variableValue}`);
                let nextAcc = `${acc}${escapedVariable};`;
                if (i === variableEntries.length - 1) {
                    nextAcc += '}';
                }
                return nextAcc;
            },
            getThemeSelector(theme, dataThemeId),
        );

        return style;
    });

    return `<style>${themes.join('')}</style>`;
}

export async function getParseHtmlFn() {
    const htmlparser2 = await import(/* webpackChunkName: "htmlparser2" */ 'htmlparser2');

    return function (value: string) {
        const root = htmlparser2.parseDocument(value);
        return root.children.map(mapElementToJson);
    };
}

function mapElementToJson(element: any) {
    if (element.type === 'tag') {
        const {style = '', ...attributes} = element.attribs;

        return {
            tag: element.name,
            content: element.children.map(mapElementToJson),
            attributes,
            style: Object.fromEntries(style.split(';').map((item: string) => item.split(':'))),
        };
    }

    return element.data ?? '';
}
