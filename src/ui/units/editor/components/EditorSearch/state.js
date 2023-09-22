import React, {useCallback, useEffect, useReducer} from 'react';

import isEmpty from 'lodash/isEmpty';

import {MATCH_CASE} from './constants';

export const EditorSearchContext = React.createContext({});

export function useEditorSearchStore() {
    return React.useContext(EditorSearchContext);
}

export const ACTION_TYPE = {
    CHANGE_STATE: 'change_state',
    SEARCH: 'search',
    OPEN_FOUND: 'open_found',
};

function findLineIndexes({line, text}) {
    const result = [];
    if (!(line && text)) {
        return result;
    }
    for (let i = 0; i < line.length; i++) {
        const index = line.indexOf(text, i);
        if (index === -1) {
            break;
        }
        i = index;
        result.push(index);
    }
    return result;
}

function formatLineMatchesToMonacoRange({lineIndex, indexes, text}) {
    const len = text.length;
    // Range(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number)
    return indexes.map((index) => [lineIndex + 1, index + 1, lineIndex + 1, index + 1 + len]);
}

function getSearchMatches({searchText, scriptsValues, tabsData, matchCase}) {
    const isLowerSearch = matchCase === MATCH_CASE.LOWER;
    const text = isLowerSearch ? searchText.toLowerCase() : searchText;
    return tabsData.map(({id, name}) => {
        const scriptValue = isLowerSearch ? scriptsValues[id].toLowerCase() : scriptsValues[id];
        const lines = scriptValue.split('\n');
        const originLines = scriptsValues[id].split('\n');
        const matches = lines.reduce((acc, line, lineIndex) => {
            return acc.concat(
                formatLineMatchesToMonacoRange({
                    lineIndex,
                    indexes: findLineIndexes({line, text}),
                    text,
                }).map((range) => ({
                    range,
                    line: originLines[lineIndex],
                })),
            );
        }, []);
        return {
            name,
            id,
            matches,
        };
    });
}

function calcIsFound(searchMatches) {
    if (isEmpty(searchMatches)) {
        return false;
    }
    return searchMatches.some(({matches}) => !isEmpty(matches));
}

const init = (data = {}) => ({
    ...data,
    searchText: '',
    matchCase: MATCH_CASE.LOWER,
    searchMatches: [],
    isFound: undefined,
    highlightLine: null,
});

const reducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPE.CHANGE_STATE:
            return {
                ...state,
                ...action.data,
            };
        case ACTION_TYPE.OPEN_FOUND: {
            const {id, range, index} = action.data;
            state.onOpenFound({id, range});
            return {
                ...state,
                highlightLine: {id, index},
            };
        }
        case ACTION_TYPE.SEARCH: {
            const {searchText, scriptsValues, tabsData, matchCase} = state;
            const searchMatches = getSearchMatches({
                searchText,
                scriptsValues,
                tabsData,
                matchCase,
            });
            return {
                ...state,
                searchMatches,
                isFound: calcIsFound(searchMatches),
            };
        }
        default:
            return state;
    }
};

export const useEditorSearchProviderValue = ({
    scriptsValues,
    tabsData,
    paneId,
    onOpenFound,
    onClear,
}) => {
    const [state, dispatch] = useReducer(
        reducer,
        {scriptsValues, tabsData, paneId, onOpenFound},
        init,
    );

    const setState = useCallback((data) => {
        dispatch({type: ACTION_TYPE.CHANGE_STATE, data});
    }, []);

    const dispatchAction = useCallback((type, data = {}) => {
        dispatch({type, data});
    }, []);

    useEffect(() => {
        const {matchCase, searchText} = state;
        const searchMatches = getSearchMatches({
            searchText,
            scriptsValues,
            tabsData,
            matchCase,
        });
        setState({
            searchMatches,
            scriptsValues,
            tabsData,
            paneId,
            onOpenFound,
            highlightLine: null,
        });
        onClear();
    }, [scriptsValues, tabsData, paneId, onOpenFound]);

    return {
        state,
        setState,
        dispatchAction,
    };
};
