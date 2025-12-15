import type {History} from 'history';
import {createBrowserHistory} from 'history';

let history: History | undefined;

export const getHistory = () => {
    if (!history) {
        history = createBrowserHistory();
    }

    return history;
};

export const setHistory = (newHistory: History) => {
    history = newHistory;
};
