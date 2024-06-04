import {
    conf as basicSQLConfig,
    language as basicSQLLanguage,
    // @ts-ignore
} from 'monaco-editor/esm/vs/basic-languages/mysql/mysql';

import {QL_LANGUAGE_ID} from '../../../constants/common';
import type {MonacoTypes} from '../types';
import {createCompletionItem, escapeFieldName, isLanguageAlreadyRegister} from '../utils';

import {FUNCTIONS, KEYWORDS, OPERATORS} from './constants';

let fieldItemProvider: MonacoTypes.IDisposable | null = null;

export const registerDatalensQLLanguage = (monaco: typeof MonacoTypes): void => {
    const isRegister = isLanguageAlreadyRegister(monaco, QL_LANGUAGE_ID);

    if (isRegister) {
        return;
    }

    monaco.languages.register({id: QL_LANGUAGE_ID});

    monaco.languages.setLanguageConfiguration(QL_LANGUAGE_ID, basicSQLConfig);
};

export const setDatalensQLLanguageConfiguration = (
    monaco: typeof MonacoTypes,
    fields: Record<string, string>[],
    tables: {
        title: string;
        group: string[];
        source_type: string;
    }[],
): void => {
    monaco.languages.setMonarchTokensProvider(QL_LANGUAGE_ID, basicSQLLanguage);

    if (fieldItemProvider) {
        fieldItemProvider.dispose();
    }

    fieldItemProvider = monaco.languages.registerCompletionItemProvider(QL_LANGUAGE_ID, {
        triggerCharacters: [' '],
        provideCompletionItems: (model, position, context) => {
            const word = model.getWordUntilPosition(position);

            const isTrigger =
                context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerCharacter;

            const rangeFromStart = {
                startLineNumber: 1,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: word.endColumn,
            };

            const rangeFromLineStart = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: 1,
                endColumn: word.endColumn,
            };

            // Whole text before cursor, joined lines, trimmed
            const textBeforePosition = model
                .getValueInRange(rangeFromStart)
                .replace(/\n/g, ' ')
                .trim()
                .toLowerCase();

            // Exact current line text before cursor without trimming
            const lineTextBeforePosition = model.getValueInRange(rangeFromLineStart).toLowerCase();

            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            // Current word including "." symbols (needed for full table names)
            const matchLastIdentificator = lineTextBeforePosition.match(/.* ([^ ]+)$/);
            if (matchLastIdentificator && matchLastIdentificator[1]) {
                range.startColumn = position.column - matchLastIdentificator[1].length;
            }

            let suggestFields = /(select|group by|order by)$/.test(textBeforePosition);
            let suggestTables = /from$/.test(textBeforePosition);

            if (!suggestFields || !suggestTables) {
                const selectIndex = textBeforePosition.indexOf('select');
                const fromIndex = textBeforePosition.indexOf('from');
                const groupByIndex = textBeforePosition.indexOf('group by');
                const orderByIndex = textBeforePosition.indexOf('order by');

                const maxFieldsIndex = Math.max(...[selectIndex, groupByIndex, orderByIndex]);

                if (maxFieldsIndex > fromIndex) {
                    suggestFields = true;
                } else if (fromIndex > maxFieldsIndex) {
                    suggestTables = true;
                }
            }

            let suggestions: MonacoTypes.languages.CompletionItem[] = [];

            const fieldsSuggestions = fields.map(({title, description, user_type}) => {
                const escapedValue = escapeFieldName(title);
                return createCompletionItem({
                    monaco,
                    label: title,
                    documentation: description,
                    detail: user_type,
                    range,
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: escapedValue,
                    sortText: `0${title}`,
                });
            });

            const tablesSuggestions = tables.map(({title, source_type, group}) => {
                let text = escapeFieldName(title);

                const prefix = group ? group.join('.') : '';
                if (prefix) {
                    text = `${prefix}.${text}`;
                }

                return createCompletionItem({
                    monaco,
                    label: text,
                    detail: source_type,
                    range,
                    kind: monaco.languages.CompletionItemKind.Struct,
                    insertText: text,
                    sortText: `0${text}`,
                });
            });

            const basicSuggestions = [
                ...KEYWORDS.map((text: string) => {
                    return createCompletionItem({
                        monaco,
                        label: text,
                        range,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: text,
                        sortText: text,
                    });
                }),
                ...FUNCTIONS.map((text: string) => {
                    return createCompletionItem({
                        monaco,
                        label: text,
                        range,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: text,
                        sortText: text,
                    });
                }),
                ...OPERATORS.map((text: string) => {
                    return createCompletionItem({
                        monaco,
                        label: text,
                        range,
                        kind: monaco.languages.CompletionItemKind.Operator,
                        insertText: text,
                        sortText: text,
                    });
                }),
            ];

            if (suggestFields) {
                suggestions = [...fieldsSuggestions, ...basicSuggestions];
            } else if (suggestTables) {
                suggestions = [...tablesSuggestions, ...basicSuggestions];
            } else if (!isTrigger) {
                suggestions = [...fieldsSuggestions, ...tablesSuggestions, ...basicSuggestions];
            }

            return {suggestions};
        },
    });
};

export const getKeywords = () => {
    return basicSQLLanguage.keywords;
};
