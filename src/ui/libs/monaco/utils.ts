import type {MonacoTypes} from './types';

interface CompletionItemConfig {
    monaco: typeof MonacoTypes;
    label: string;
    range: MonacoTypes.IRange;
    kind: MonacoTypes.languages.CompletionItemKind;
    detail?: string;
    documentation?: string;
    insertText?: string;
    sortText?: string;
}

const computedStyle = getComputedStyle(document.documentElement);
const reRegExpChar = /[\\^$]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export const getTokenColor = (token: string) => {
    const preparedToken = token.split('.').join('-');
    return (
        computedStyle.getPropertyValue(`--dl-color-monaco-${preparedToken}`).substring(1) ||
        undefined
    );
};

export const isLanguageAlreadyRegister = (
    monaco: typeof MonacoTypes,
    languageId: string,
): boolean => {
    const languages = monaco.languages.getLanguages();

    return languages.findIndex(({id}) => id === languageId) !== -1;
};

export const createCompletionItem = ({
    monaco,
    label,
    range,
    kind,
    detail,
    documentation,
    insertText,
    sortText,
}: CompletionItemConfig): MonacoTypes.languages.CompletionItem => {
    return {
        label,
        range,
        kind,
        detail,
        documentation,
        insertText: insertText || label,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        sortText,
    };
};

/**
 * The method from lodash, redesigned for the realities of our BI
 * https://github.com/lodash/lodash/blob/2f79053d7bc7c9c9561a30dda202b3dcd2b72b90/escapeRegExp.js
 *
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 */

export const escapeFieldName = (string: string) => {
    return string && reHasRegExpChar.test(string)
        ? string.replace(reRegExpChar, '\\$&')
        : string || '';
};
