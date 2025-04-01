import type {IncomingHttpHeaders} from 'http';

import type {AppContext} from '@gravity-ui/nodekit';
import Hashids from 'hashids/cjs';
import assign from 'lodash/assign';
import intersection from 'lodash/intersection';

import type {ServerI18n} from '../../../i18n/types';
import {DASH_CURRENT_SCHEME_VERSION, DASH_DATA_REQUIRED_FIELDS} from '../../../shared/constants';
import {DashSchemeConverter} from '../../../shared/modules';
import type {
    CreateEntryRequest,
    DashData,
    DashEntry,
    DashEntryCreateParams,
    DashTabItemControlData,
    Dictionary,
    EntryReadParams,
    UpdateEntryRequest,
} from '../../../shared/types';
import {
    DashTabItemControlSourceType,
    DashTabItemType,
    EntryScope,
    EntryUpdateMode,
    Feature,
} from '../../../shared/types';
import {isEnabledServerFeature} from '../../../shared/utils';

import US from './us';

function addControlLinkToResult(result: Dictionary<string>, data: DashTabItemControlData) {
    if (data.sourceType === DashTabItemControlSourceType.Dataset && 'datasetId' in data.source) {
        const {datasetId} = data.source;
        result[datasetId] = datasetId;
    }

    return result;
}

function gatherLinks(data: DashData) {
    return data.tabs.reduce(
        (result: Dictionary<string>, tab) =>
            tab.items.reduce((result, item) => {
                const {type, data} = item;

                if (type === DashTabItemType.Widget && 'tabs' in data) {
                    return data.tabs.reduce((result, widget) => {
                        const {chartId} = widget;
                        result[chartId] = chartId;
                        return result;
                    }, result);
                } else if (type === DashTabItemType.GroupControl) {
                    data.group.forEach((groupItem) => {
                        result = addControlLinkToResult(result, groupItem);
                    });
                } else if (type === DashTabItemType.Control && 'sourceType' in data) {
                    result = addControlLinkToResult(result, data);

                    if (
                        data.sourceType === DashTabItemControlSourceType.External &&
                        'chartId' in data.source
                    ) {
                        const {chartId} = data.source;
                        result[chartId] = chartId;
                    }
                }

                return result;
            }, result),
        {},
    );
}

function setDefaultData(
    I18n: ServerI18n,
    requestData: DashData,
    initialData: Partial<DashData> = {},
) {
    const i18n = I18n.keyset('dash.tabs-dialog.edit');

    const salt = Math.random().toString();
    const hashids = new Hashids(salt);
    const data: DashData = {
        salt,
        counter: 2,
        schemeVersion: DASH_CURRENT_SCHEME_VERSION,
        tabs: [
            {
                id: hashids.encode(1),
                title: i18n('value_default', {index: 1}),
                items: [],
                layout: [],
                aliases: {},
                connections: [],
            },
        ],
        settings: {
            autoupdateInterval: null,
            maxConcurrentRequests: null,
            silentLoading: false,
            dependentSelectors: true,
            hideTabs: false,
            hideDashTitle: false,
            expandTOC: false,
        },
    };

    return assign(data, initialData, requestData);
}

const needSetDefaultData = (data: DashData) =>
    DASH_DATA_REQUIRED_FIELDS.some((fieldName) => !(fieldName in data));

function validateData(data: DashData) {
    const allTabsIds: Set<string> = new Set();
    const allItemsIds: Set<string> = new Set();
    const allWidgetTabsIds: Set<string> = new Set();

    const isIdUniq = (id: string) => {
        if (allTabsIds.has(id) || allItemsIds.has(id) || allWidgetTabsIds.has(id)) {
            throw new Error(`Duplicated id ${id}`);
        }
        return true;
    };

    data.tabs.forEach(({id: tabId, title: tabTitle, items, layout, connections}) => {
        const currentItemsIds: Set<string> = new Set();
        const currentWidgetTabsIds: Set<string> = new Set();
        const currentControlsIds: Set<string> = new Set();

        if (isIdUniq(tabId)) {
            allTabsIds.add(tabId);
        }

        items.forEach(({id: itemId, type, data}) => {
            if (isIdUniq(itemId)) {
                allItemsIds.add(itemId);
                currentItemsIds.add(itemId);
            }

            if (type === DashTabItemType.Control || type === DashTabItemType.GroupControl) {
                // if it is group control all connections set on its items
                if ('group' in data) {
                    data.group.forEach((widgetItem) => {
                        currentControlsIds.add(widgetItem.id);
                    });
                } else {
                    currentControlsIds.add(itemId);
                }
            } else if (type === DashTabItemType.Widget && 'tabs' in data) {
                data.tabs.forEach(({id: widgetTabId}) => {
                    if (isIdUniq(widgetTabId)) {
                        allWidgetTabsIds.add(widgetTabId);
                        currentWidgetTabsIds.add(widgetTabId);
                    }
                });
            }
        });

        // checking that layout has all the ids from item, i.e. positions are set for all elements
        if (
            items.length !== layout.length ||
            items.length !==
                intersection(
                    Array.from(currentItemsIds),
                    layout.map(({i}) => i),
                ).length
        ) {
            throw new Error(`Not consistent items and layout on tab ${tabTitle}`);
        }

        connections.forEach(({from, to}) => {
            if (
                (!currentWidgetTabsIds.has(from) && !currentControlsIds.has(from)) ||
                (!currentWidgetTabsIds.has(to) && !currentControlsIds.has(to))
            ) {
                throw new Error(`Items ${from} and ${to} could not be in connection`);
            }
        });
    });
}

class Dash {
    static async create(
        data: CreateEntryRequest<DashEntry | DashEntryCreateParams>,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
        I18n: ServerI18n,
    ): Promise<DashEntry> {
        try {
            let usData: CreateEntryRequest<DashEntry | DashEntryCreateParams> = {
                ...data,
                scope: EntryScope.Dash,
                type: '',
                mode: data.mode || EntryUpdateMode.Publish,
            };

            if (data.asNew) {
                usData = {
                    ...data,
                    key: data.key,
                    scope: EntryScope.Dash,
                    type: '',
                };
            } else if (needSetDefaultData(usData.data)) {
                usData.data = setDefaultData(I18n, usData.data);
            }

            const isServerMigrationEnabled = Boolean(
                isEnabledServerFeature(ctx, Feature.DashServerMigrationEnable),
            );
            if (isServerMigrationEnabled && DashSchemeConverter.isUpdateNeeded(usData.data)) {
                usData.data = await DashSchemeConverter.update(usData.data);
            }

            usData.links = gatherLinks(usData.data);

            validateData(usData.data);

            const headersWithMetadata = {
                ...headers,
                ...ctx.getMetadata(),
            };

            const createdEntry = (await US.createEntry(
                usData,
                headersWithMetadata,
                ctx,
            )) as DashEntry & {
                revId: string;
            };

            ctx.log('SDK_DASH_CREATE_SUCCESS', US.getLoggedEntry(createdEntry));

            return createdEntry;
        } catch (error) {
            ctx.logError('SDK_DASH_CREATE_FAILED', error, US.getLoggedErrorEntry(data));

            throw error;
        }
    }

    static async read(
        entryId: string,
        params: EntryReadParams | null,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
    ): Promise<DashEntry> {
        try {
            const headersWithMetadata = {
                ...headers,
                ...ctx.getMetadata(),
            };
            const result = (await US.readEntry(
                entryId,
                params,
                headersWithMetadata,
                ctx,
            )) as DashEntry;

            const isServerMigrationEnabled = Boolean(
                isEnabledServerFeature(ctx, Feature.DashServerMigrationEnable),
            );
            if (isServerMigrationEnabled && DashSchemeConverter.isUpdateNeeded(result.data)) {
                result.data = await DashSchemeConverter.update(result.data);
            }

            ctx.log('SDK_DASH_READ_SUCCESS', US.getLoggedEntry(result));

            return result;
        } catch (error) {
            ctx.logError('SDK_DASH_READ_FAILED', error, {entryId, params});

            throw error;
        }
    }

    static async update(
        entryId: string,
        data: UpdateEntryRequest<DashEntry>,
        headers: IncomingHttpHeaders,
        ctx: AppContext,
        I18n: ServerI18n,
    ): Promise<DashEntry> {
        try {
            const usData: typeof data & {skipSyncLinks?: boolean} = {...data};
            const mode = data.mode || EntryUpdateMode.Publish;

            const needDataSend = !(mode === EntryUpdateMode.Publish && data.revId);
            if (needDataSend) {
                if (needSetDefaultData(usData.data)) {
                    const initialData = await Dash.read(entryId, null, headers, ctx);
                    usData.data = setDefaultData(I18n, usData.data, initialData.data);
                }

                usData.links = gatherLinks(usData.data);

                validateData(usData.data);
            }

            if (mode !== EntryUpdateMode.Publish) {
                usData.skipSyncLinks = true;
            }

            const headersWithMetadata = {
                ...headers,
                ...ctx.getMetadata(),
            };

            const result = (await US.updateEntry(
                entryId,
                mode,
                usData,
                headersWithMetadata,
                ctx,
            )) as DashEntry;

            ctx.log('SDK_DASH_UPDATE_SUCCESS', US.getLoggedEntry(result));

            return result;
        } catch (error) {
            ctx.logError('SDK_DASH_UPDATE_FAILED', error, {
                entryId,
                ...US.getLoggedErrorEntry(data),
            });

            throw error;
        }
    }

    static async delete(entryId: string, headers: IncomingHttpHeaders, ctx: AppContext) {
        try {
            const headersWithMetadata = {
                ...headers,
                ...ctx.getMetadata(),
            };

            const result = (await US.deleteEntry(entryId, headersWithMetadata, ctx)) as DashEntry;

            ctx.log('SDK_DASH_DELETE_SUCCESS', US.getLoggedEntry(result));

            return result;
        } catch (error) {
            ctx.logError('SDK_DASH_DELETE_FAILED', error, {entryId});

            throw error;
        }
    }
}

export default Dash;
