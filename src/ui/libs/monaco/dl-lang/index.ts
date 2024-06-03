/* Module for setting syntax and color scheme of formula language in monaco*/

import {
    DATALENS_DARK_HC_THEME_MONACO,
    DATALENS_DARK_THEME_MONACO,
    DATALENS_LIGHT_HC_THEME_MONACO,
    DATALENS_LIGHT_THEME_MONACO,
    FORMULA_LANGUAGE_ID,
} from '../../../constants/common';
import {mapDlMonacoThemeToMonacoTheme} from '../theme-mappers';
import type {DlMonacoTheme, MonacoTypes} from '../types';
import {createCompletionItem, escapeFieldName, isLanguageAlreadyRegister} from '../utils';

import {COLOR_THEME_RULES, COMPLEX_KEYWORDS, KEYWORDS, OPERATORS, TOKENS} from './constants';

/* 
We keep in the closure a reference to the object of the previous state of the autocomplete in order to destroy the old one when creating the next state.
Otherwise, the same options will accumulate in the autocompletest.

What for?
Each time the editor is mounted (as well as when the available set of functions supported by the source is changed),
tokenization and autocomplete settings are created/changed.
This is necessary to make the editor highlight syntax and show in the widget any functions available for use
*/
let currentItemProvider: MonacoTypes.IDisposable | null = null;

const defineDlMonacoThemes = (monaco: typeof MonacoTypes, dlThemes: DlMonacoTheme[]) => {
    dlThemes.forEach((dlTheme) => {
        monaco.editor.defineTheme(dlTheme, {
            base: mapDlMonacoThemeToMonacoTheme(dlTheme),
            inherit: true,
            colors: {},
            rules: COLOR_THEME_RULES,
        });
    });
};

export const registerDatalensFormulaLanguage = (monaco: typeof MonacoTypes): void => {
    const isRegister = isLanguageAlreadyRegister(monaco, FORMULA_LANGUAGE_ID);

    if (isRegister) {
        return;
    }

    monaco.languages.register({id: FORMULA_LANGUAGE_ID});

    monaco.languages.setLanguageConfiguration(FORMULA_LANGUAGE_ID, {
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
            ["'", "'"],
            ['"', '"'],
        ],
        comments: {
            lineComment: '--',
            blockComment: ['/*', '*/'],
        },
    });

    defineDlMonacoThemes(monaco, [
        DATALENS_LIGHT_THEME_MONACO,
        DATALENS_LIGHT_HC_THEME_MONACO,
        DATALENS_DARK_THEME_MONACO,
        DATALENS_DARK_HC_THEME_MONACO,
    ]);
};

export const setDatalensFormulaLanguageConfiguration = (
    monaco: typeof MonacoTypes,
    lowerCaseFunctions: string[],
    fields: string[],
): void => {
    const functions = lowerCaseFunctions.map((fn) => fn.toUpperCase());

    monaco.languages.setMonarchTokensProvider(FORMULA_LANGUAGE_ID, {
        /* TS swears at the use of custom fields that are not included in IMonarchLanguage. In the official documentation, a similar technique is used to create links in the tokenizer's regulars. Therefore, I put down ts-ignore*/

        functions,

        keywords: KEYWORDS,

        complexKeywords: COMPLEX_KEYWORDS.map((keyword) => keyword.replace(' ', '\\W+')).join('|'),

        operators: OPERATORS,

        date: /\d{4}-\d{2}-\d{2}/,
        datetime: /@date[Tt ](\d{2}(:\d{2}(:\d{2})?)?)?/,

        escapes: /\\(?:[nrt"'\\])/,

        tokenizer: {
            root: [
                [/#@date#/, TOKENS.DATE],
                [/##@date##/, TOKENS.DATE],
                [/#@datetime#/, TOKENS.DATE],
                [/##@datetime##/, TOKENS.DATE],

                {include: '@comments'},
                {include: '@numbers'},

                [/@complexKeywords/, 'keyword'],

                [
                    /[\w@#$]+/,
                    {
                        cases: {
                            '@keywords': TOKENS.KEYWORD,
                            '@functions': TOKENS.KEYWORD,
                            '@operators': TOKENS.OPERATOR,
                        },
                    },
                ],

                [/[<>=!%&+\-*/|~^]/, TOKENS.OPERATOR],

                [/"([^"\\]|\\.)*$/, TOKENS.STRING_INVALID],
                [/'([^'\\]|\\.)*$/, TOKENS.STRING_INVALID],
                [/'/, TOKENS.STRING, '@stringSingle'],
                [/"/, TOKENS.STRING, '@stringDouble'],

                [/\[[^[\]{}]+\]/, TOKENS.FIELD],
            ],
            comments: [
                [/--+.*/, TOKENS.COMMENT],
                [/\/\*/, {token: TOKENS.COMMENT_QUOTE, next: '@comment'}],
            ],
            comment: [
                [/[^*/]+/, TOKENS.COMMENT],
                [/\*\//, {token: TOKENS.COMMENT_QUOTE, next: '@pop'}],
                [/./, TOKENS.COMMENT],
            ],
            numbers: [
                [/0[xX][0-9a-fA-F]*/, TOKENS.NUMBER],
                [/[$][+-]*\d*(\.\d*)?/, TOKENS.NUMBER],
                [/((\d+(\.\d*)?)|(\.\d+))([eE][-+]?\d+)?/, TOKENS.NUMBER],
            ],
            stringSingle: [
                [/[^\\']+/, TOKENS.STRING],
                [/@escapes/, TOKENS.STRING_ESCAPE],
                [/\\./, TOKENS.STRING_INVALID],
                [/'/, TOKENS.STRING, '@pop'],
            ],
            stringDouble: [
                [/[^\\"]+/, TOKENS.STRING],
                [/@escapes/, TOKENS.STRING_ESCAPE],
                [/\\./, TOKENS.STRING_INVALID],
                [/"/, TOKENS.STRING, '@pop'],
            ],
        },

        ignoreCase: true,
    });

    if (currentItemProvider) {
        currentItemProvider.dispose();
    }

    currentItemProvider = monaco.languages.registerCompletionItemProvider(FORMULA_LANGUAGE_ID, {
        triggerCharacters: ['['],
        provideCompletionItems: (model, position, context) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };
            const hasOpeningParenthesis =
                model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column + 1,
                }) === '(';
            const hasOpeningSquareBracket =
                model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endLineNumber: position.lineNumber,
                    endColumn: word.startColumn - 1,
                }) === '[';
            const isTrigger =
                context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerCharacter;
            const showAllSuggestions = !isTrigger && !hasOpeningSquareBracket;

            const suggestions: MonacoTypes.languages.CompletionItem[] = [
                // Autocomplete for available fields
                ...fields.map((label) => {
                    const escapedValue = escapeFieldName(label);
                    return createCompletionItem({
                        monaco,
                        label,
                        range,
                        kind: monaco.languages.CompletionItemKind.Value,
                        insertText: showAllSuggestions ? `[${escapedValue}]` : escapedValue,
                    });
                }),
            ];

            if (showAllSuggestions) {
                suggestions.push(
                    ...OPERATORS.map((label) => {
                        return createCompletionItem({
                            monaco,
                            label,
                            range,
                            kind: monaco.languages.CompletionItemKind.Operator,
                        });
                    }),
                    ...functions.map((label) => {
                        return createCompletionItem({
                            monaco,
                            label,
                            range,
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: `${label}${hasOpeningParenthesis ? '' : '($0)'}`,
                        });
                    }),
                    ...[...KEYWORDS, ...COMPLEX_KEYWORDS].map((label) => {
                        return createCompletionItem({
                            monaco,
                            label,
                            range,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                        });
                    }),
                );
            }

            return {suggestions};
        },
    });
};
