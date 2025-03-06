import Hashids from 'hashids';
import get from 'lodash/get';
import moment from 'moment';
import {registry} from 'ui/registry';

import {getChartEditorTypes} from '../../../configs/chart/chart-editor-types';
import {DEFAULT_TAB_ID, PANE_VIEWS} from '../../../constants/common';

import {GridStorage} from './gridStorage';

export class Helper {
    static getDefaultTabId(tabs, queryActiveTab) {
        const {allIds, byId} = tabs;
        const checkedTabId =
            queryActiveTab && Object.prototype.hasOwnProperty.call(byId, queryActiveTab)
                ? queryActiveTab
                : DEFAULT_TAB_ID;
        return Object.prototype.hasOwnProperty.call(byId, checkedTabId) ? checkedTabId : allIds[0];
    }

    static createPaneViewsData() {
        return Object.values(PANE_VIEWS).reduce(
            (acc, view) => {
                acc.byId[view] = {
                    id: view,
                    name: view,
                };
                acc.allIds.push(view);
                return acc;
            },
            {byId: {}, allIds: []},
        );
    }

    static createTabData(entry = {}) {
        const getEmptyTemplateType = registry.editor.functions.get('getEmptyTemplateType');
        const {type = getEmptyTemplateType(), data = {}} = entry;
        const {tabs} = getChartEditorTypes(type);
        const tabsIds = tabs.map(({id}) => id);
        const scriptsValues = {};
        const byId = tabsIds.reduce((acc, tabId, index) => {
            acc[tabId] = {
                ...tabs[index],
            };
            const tabName = tabId;
            switch (tabId) {
                case 'sources': {
                    scriptsValues[tabName] = get(data, 'url', get(data, 'sources', ''));
                    break;
                }
                case 'controls': {
                    scriptsValues[tabName] = get(data, 'ui', get(data, 'controls', ''));
                    break;
                }
                case 'prepare': {
                    scriptsValues[tabName] = get(data, 'js', get(data, 'prepare', ''));
                    break;
                }
                case 'config': {
                    scriptsValues[tabName] = get(data, 'table', get(data, 'config', ''));
                    break;
                }
                default: {
                    scriptsValues[tabName] = data[tabId] || '';
                }
            }

            return acc;
        }, {});
        return {
            tabs: {
                byId,
                allIds: tabsIds,
            },
            scriptsValues,
        };
    }

    static createGridData({tabs, schemeId, entry, settings, queryActiveTab}) {
        const {currentSchemeId, panesViews} = GridStorage.formPanesViewsAndStore({entry, schemeId});
        let counter = settings.counter;
        const hashids = new Hashids('ChartEditor Hashids salt');
        const panes = panesViews.reduce(
            (acc, view) => {
                const id = hashids.encode(++counter);
                acc.byId[id] = {
                    id,
                    view,
                    currentTab:
                        view === PANE_VIEWS.EDITOR
                            ? this.getDefaultTabId(tabs, queryActiveTab)
                            : null,
                };
                acc.allIds.push(id);
                return acc;
            },
            {byId: {}, allIds: []},
        );
        return {
            settings: {...settings, counter},
            panes,
            grid: {
                panes: [...panes.allIds],
                scheme: currentSchemeId,
            },
        };
    }

    static getEmptyTemplate() {
        const getEmptyTemplateType = registry.editor.functions.get('getEmptyTemplateType');
        return {
            type: getEmptyTemplateType(),
            scope: 'widget',
            savedId: '1',
            revId: '1',
            publishedId: '1',
            updatedAt: moment().format(),
            data: this.createTabData().scriptsValues,
        };
    }

    static formEntryData({entry, scriptsValues}) {
        return {
            ...entry.data,
            ...scriptsValues,
        };
    }
}
