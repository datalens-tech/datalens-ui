import type {MonacoTypes} from '../types';
import {getTokenColor} from '../utils';

import '../../../styles/dl-monaco.scss';

// https://github.com/microsoft/vscode/blob/main/src/vs/editor/standalone/common/themes.ts
export const TOKENS = {
    KEYWORD: 'keyword.sql',
    OPERATOR: 'operator.sql',
    STRING: 'string',
    STRING_ESCAPE: 'string.escape',
    STRING_INVALID: 'invalid',
    NUMBER: 'number.sql',
    DATE: 'date',
    FIELD: 'field',
    COMMENT: 'comment',
    COMMENT_QUOTE: 'comment.quote',
};

export const OPERATORS = ['BETWEEN', 'IN', 'IS', 'NOT', 'LIKE', 'OR'];

export const KEYWORDS = [
    'AMONG',
    'AND',
    'CASE',
    'ELSE',
    'ELSEIF',
    'END',
    'FALSE',
    'IF',
    'NULL',
    'THEN',
    'TOTAL',
    'TRUE',
    'WHEN',
    'WITHIN',
    'ASC',
    'DESC',
    'FIXED',
    'INCLUDE',
    'EXCLUDE',
];

export const COMPLEX_KEYWORDS = ['ORDER BY', 'BEFORE FILTER BY', 'IGNORE DIMENSIONS'];

export const COLOR_THEME_RULES: MonacoTypes.editor.ITokenThemeRule[] = [
    {token: TOKENS.STRING_ESCAPE, foreground: getTokenColor(TOKENS.STRING_ESCAPE)},
    {token: TOKENS.DATE, foreground: getTokenColor(TOKENS.DATE)},
    {token: TOKENS.FIELD, foreground: getTokenColor(TOKENS.FIELD)},
];
