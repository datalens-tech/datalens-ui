import {URL_QUERY, Utils} from 'ui';

import {UrlSearch} from '../../../../../utils';
import {getGridSchemes} from '../../../configs/grid/grid-schemes';
import {MODULE_TYPE} from '../../../constants/common';

const KEY = 'editorGrid';

export class GridStorage {
    static canStorage(entry) {
        if (entry.type === MODULE_TYPE) {
            return false;
        }
        const urlSearch = new UrlSearch(window.location.search);
        if (urlSearch.has(URL_QUERY.ACTIVE_TAB) || urlSearch.has(URL_QUERY.ACTIVE_TAB)) {
            return false;
        }
        return true;
    }

    static formPanesViewsAndStore({entry, schemeId}) {
        const canStorage = GridStorage.canStorage(entry);
        const gridSchemes = getGridSchemes({type: entry.type});
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

    static storePanes({entry, panes, grid}) {
        if (GridStorage.canStorage(entry)) {
            GridStorage.store({
                [grid.scheme]: grid.panes.map((id) => panes.byId[id].view),
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
