import Hashids from 'hashids';
import moment from 'moment';
import type {QLChartType, QlConfig, Shared} from 'shared';
import {QlConfigVersions} from 'shared/types/ql/versions';

import {qlTypes} from '../../configs/chart-types';
import {DEFAULT_TAB_ID, DEFAULT_TYPE, PANE_VIEWS} from '../../constants';
import {getDefaultQlVisualization} from '../../utils/visualization';
import type {
    QLEntry,
    QLGridSchemes,
    QLPaneData,
    QLSettings,
    QLTabData,
    QLTabs,
} from '../typings/ql';

interface CreateGridDataParams {
    tabs: QLTabs;
    schemeId?: string;
    entry: QLEntry;
    settings: QLSettings;
    queryActiveTab?: string;
    gridSchemes: QLGridSchemes;
}

export class Helper {
    static getDefaultTabId(tabs: QLTabs, queryActiveTab?: string) {
        const {allIds, byId} = tabs;
        const checkedTabId =
            queryActiveTab && Object.prototype.hasOwnProperty.call(byId, queryActiveTab)
                ? queryActiveTab
                : DEFAULT_TAB_ID;
        return Object.prototype.hasOwnProperty.call(byId, checkedTabId) ? checkedTabId : allIds[0];
    }

    static createPaneViewsData() {
        return Object.values(PANE_VIEWS).reduce(
            (acc: {byId: Record<string, {id: string; name: string}>; allIds: string[]}, view) => {
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

    static createTabData() {
        const {tabs} = qlTypes[DEFAULT_TYPE];
        const tabsIds = tabs.map(({id}) => id);

        const byId = tabsIds.reduce((acc: Record<string, QLTabData>, tabId, index) => {
            acc[tabId] = {
                ...tabs[index],
            };
            return acc;
        }, {});
        return {
            tabs: {
                byId,
                allIds: tabsIds,
            },
        };
    }

    static createGridData({tabs, settings, queryActiveTab, gridSchemes}: CreateGridDataParams) {
        const currentSchemeId = gridSchemes.default;
        const panesViews = gridSchemes.schemes[currentSchemeId].panes;

        let counter = settings.counter;
        const hashids = new Hashids(settings.salt);
        const panes = panesViews.reduce(
            (acc: {byId: Record<string, QLPaneData>; allIds: string[]}, view: string) => {
                const id = hashids.encode(++counter);
                acc.byId[id] = {
                    id,
                    view,
                    currentTab:
                        view === PANE_VIEWS.MAIN
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
        const emptyQlTemplate: QlConfig = {
            params: [],
            extraSettings: {},
            type: 'ql',
            chartType: '' as QLChartType,
            visualization: getDefaultQlVisualization() as Shared['visualization'],
            queryValue: '',
            queries: [],
            connection: {
                entryId: '',
                type: '',
            },
            colors: [],
            shapes: [],
            labels: [],
            tooltips: [],
            version: QlConfigVersions.V5,
        };

        return {
            type: DEFAULT_TYPE,
            scope: 'widget',
            links: {},
            entryId: '',
            meta: {},
            fake: true,
            savedId: '1',
            revId: '1',
            publishedId: '1',
            updatedAt: moment().format(),
            isFavorite: false,
            createdAt: '',
            createdBy: '',
            hidden: false,
            public: false,
            tenantId: '',
            updatedBy: '',
            unversionedData: null,
            data: {
                shared: emptyQlTemplate,
            },
            permissions: {
                read: true,
                edit: true,
                admin: true,
                execute: true,
            },
            connection: null,
            workbookId: null,
            annotation: null,
        };
    }

    static formTablePreviewData({queryValue}: {queryValue: string}) {
        return {
            shared: {
                queryValue,
                mode: 'table_preview',
            },
        };
    }
}
