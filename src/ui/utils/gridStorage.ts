import {Utils} from 'ui';

import {MODULE_TYPE, URL_QUERY} from '../constants';

import {UrlSearch} from './urlSearch';

const KEY = 'qlGrid';

export class GridStorage {
    static canStorage(entry: any) {
        if (entry.type === MODULE_TYPE) {
            return false;
        }
        const urlSearch = new UrlSearch(window.location.search);
        if (urlSearch.has(URL_QUERY.ACTIVE_TAB) || urlSearch.has(URL_QUERY.ACTIVE_TAB)) {
            return false;
        }
        return true;
    }

    static formPanesViewsAndStore({
        entry,
        schemeId,
        gridSchemes,
    }: {
        entry: any;
        schemeId: any;
        gridSchemes: any;
    }) {
        const canStorage = GridStorage.canStorage(entry);
        const storeData = canStorage ? GridStorage.restore() : {};
        const currentSchemeId = schemeId || storeData.latest || gridSchemes.default;
        const storePaneViews = storeData[currentSchemeId];
        const panesViews =
            (canStorage && storePaneViews) || gridSchemes.schemes[currentSchemeId].panes;

        if (canStorage) {
            GridStorage.store({
                latest: currentSchemeId,
                [currentSchemeId]: panesViews,
            });
        }

        return {currentSchemeId, panesViews};
    }

    static storePanes({entry, panes, grid}: {entry: any; panes: any; grid: any}) {
        if (GridStorage.canStorage(entry)) {
            GridStorage.store({
                [grid.scheme]: grid.panes.map((id: string) => panes.byId[id].view),
            });
        }
    }

    static restore() {
        return Utils.restore(KEY) || {};
    }

    static store(data = {}) {
        Utils.store(KEY, {
            ...GridStorage.restore(),
            ...data,
        });
    }
}
