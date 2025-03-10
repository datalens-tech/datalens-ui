import {dateTimeUtc} from '@gravity-ui/date-utils';
import omitBy from 'lodash/omitBy';

import {DASH_CURRENT_SCHEME_VERSION} from '../constants/dash';
import {DUPLICATED_WIDGET_BG_COLORS_PRESET} from '../constants/widgets';
import type {BackgroundSettings, DashData, DashTab, DashTabItem} from '../types';
import {DashTabConnectionKind, DashTabItemControlElementType, DashTabItemType} from '../types';

const DATE_FORMAT_V7 = 'YYYY-MM-DD';

function getActualBackground(background?: BackgroundSettings): BackgroundSettings | undefined {
    if (background && DUPLICATED_WIDGET_BG_COLORS_PRESET.includes(background.color)) {
        return {
            color: background.color.replace('medium', 'light-hover'),
        };
    }

    return background;
}

export function migrateBgColor(item: DashTabItem): DashTabItem {
    const newItem: DashTabItem = Object.assign({...item}, {data: Object.assign({}, item.data)});

    if ('background' in newItem.data) {
        if (
            newItem.data.background &&
            DUPLICATED_WIDGET_BG_COLORS_PRESET.includes(newItem.data.background.color)
        ) {
            newItem.data.background = getActualBackground(newItem.data.background);

            return newItem;
        }
    }
    if (newItem.type === DashTabItemType.Widget) {
        newItem.data.tabs = newItem.data.tabs.map((tab) => ({
            ...tab,
            background: getActualBackground(tab.background),
        }));

        return newItem;
    }
    return item;
}

export function preparedData(data: DashData) {
    data.tabs.forEach((dashTabItem) => {
        dashTabItem.items = dashTabItem.items.map((wi) => {
            const widgetItem = migrateBgColor(wi);
            if (widgetItem.type !== DashTabItemType.Control) {
                return widgetItem;
            }
            for (const [key, val] of Object.entries(widgetItem.defaults)) {
                widgetItem.defaults[key] = val === null ? '' : val;
            }
            return widgetItem;
        });
    });

    return data;
}

// appeared at the time of the transition from 6 to 7, there is possibility that previous conversions are no longer needed

class DashSchemeConverter {
    static isUpdateNeeded(data: DashData) {
        return data.schemeVersion < DASH_CURRENT_SCHEME_VERSION;
    }

    static update(data: DashData) {
        if (data.schemeVersion < DASH_CURRENT_SCHEME_VERSION) {
            return DashSchemeConverter.upTo8(data);
        }
        return data;
    }

    static async upTo3(data: any) {
        const {salt, pages, counter, schemeVersion} = data;

        if (schemeVersion >= 3) {
            return data;
        }

        const savedResponses: any = {};

        const [page] = pages;

        const {id: pageId, tabs} = page;

        const convertedTabs = await Promise.all(
            tabs.map(async (tab: any) => {
                const {id: tabId, items, title, layout, ignores = []} = tab;
                return {
                    id: tabId,
                    items: await Promise.all(
                        items.map(
                            async ({
                                id,
                                data: itemData,
                                tabs,
                                type,
                                defaults,
                                namespace = 'default',
                            }: any) => {
                                const data = itemData || tabs;
                                if (type === DashTabItemType.Control && !defaults) {
                                    const defaultValue = data.control.defaultValue || '';

                                    if (data.dataset) {
                                        const {id: datasetId, fieldName} = data.dataset;

                                        try {
                                            const {fields} = savedResponses[datasetId];
                                            //     || await sdk.bi.getDataSetFieldsById({dataSetId: datasetId});
                                            savedResponses[datasetId] = {fields};

                                            const field = fields.find(
                                                ({title}: any) => title === fieldName,
                                            );

                                            if (field) {
                                                data.dataset.fieldId = field.guid;
                                                delete data.dataset.fieldName;
                                                delete data.dataset.name;
                                                defaults = {[field.guid]: defaultValue};
                                            } else {
                                                defaults = {[fieldName]: defaultValue};
                                            }
                                        } catch (error) {
                                            console.error('DATASET_FIELDS', id, error);
                                            defaults = {[fieldName]: defaultValue};
                                        }
                                    } else {
                                        const connection = tab.connections.find(
                                            ({fromId}: any) => fromId === id,
                                        );

                                        if (connection) {
                                            data.control.fieldName = connection.param;
                                            defaults = {[connection.param]: defaultValue};
                                        } else {
                                            defaults = {};
                                        }
                                    }
                                } else if (!defaults) {
                                    defaults = {};
                                }
                                return {id, data, type, defaults, namespace};
                            },
                        ),
                    ),
                    title,
                    layout,
                    ignores,
                };
            }),
        );

        return {
            salt,
            counter,
            schemeVersion: 3,
            pages: [{id: pageId, tabs: convertedTabs}],
        };
    }

    // adding the aliases field for each tab
    static async upTo4(originalData: any) {
        const data = await DashSchemeConverter.upTo3(originalData);

        const {salt, pages, schemeVersion, counter} = data;

        if (schemeVersion >= 4) {
            return data;
        }

        const [page] = pages;

        const {id: pageId, tabs} = page;

        const convertedTabs = tabs.map((tab: any) => ({...tab, aliases: {}}));

        return {
            salt,
            counter,
            schemeVersion: 4,
            pages: [{id: pageId, tabs: convertedTabs}],
        };
    }

    // ignors for the WIDGET-elements is translated into ignors for tabs WIDGET-elements
    static async upTo6(originalData: any) {
        const data = await DashSchemeConverter.upTo4(originalData);

        const {salt, pages, counter, schemeVersion} = data;

        if (schemeVersion >= 6) {
            return data;
        }

        const [page] = pages;

        const {id: pageId, tabs} = page;

        const convertedTabs = tabs.map(({ignores, ...tab}: any) => ({
            ...tab,
            ignores: ignores.reduce((result: any, {who, whom}: any) => {
                tab.items
                    .filter(({id, type}: any) => id === who && type === DashTabItemType.Widget)
                    .forEach(({data}: any) =>
                        data.forEach(({id}: any) => {
                            result.push({who: id, whom});
                        }),
                    );
                return result;
            }, []),
        }));

        return {
            salt,
            counter,
            schemeVersion: 6,
            pages: [{id: pageId, tabs: convertedTabs}],
        };
    }

    static async upTo7(originalData: any): Promise<DashData> {
        const data = await DashSchemeConverter.upTo6(originalData);

        const {salt, pages, counter, schemeVersion, settings = {}} = data;

        if (schemeVersion >= 7) {
            return data;
        }

        const tabs: DashTab[] = pages[0].tabs;

        tabs.forEach((tab: any) => {
            // eslint-disable-next-line complexity
            tab.items = tab.items.map((item: any) => {
                const {type, data} = item;

                if (type === DashTabItemType.Widget) {
                    item.data = {
                        hideTitle: data[0].hideTitle,
                        tabs: data.map(({data: {uuid, ...inner}, ...outer}: any) => ({
                            chartId: uuid,
                            ...inner,
                            ...outer,
                        })),
                    };
                }

                if (type === DashTabItemType.Control) {
                    const {
                        title,
                        control,
                        dataset: {id: datasetId = null, fieldId: datasetFieldId = null} = {},
                        external: {entryId = null} = {},
                        showTitle,
                        sourceType,
                    } = item.data;

                    if (
                        control.elementType === DashTabItemControlElementType.Date &&
                        typeof control.defaultValue === 'object'
                    ) {
                        const {
                            defaultValue: {type, value = {}},
                        } = control;

                        if (control.isRange) {
                            if (type === 'relative') {
                                const {from = '0', to = '0'} = value;
                                const resultFrom =
                                    from[0] === '-' ? `+${from.replace('-', '')}` : `-${from || 0}`;
                                const resultTo =
                                    to[0] === '-' ? `+${to.replace('-', '')}` : `-${to || 0}`;
                                control.defaultValue = `__interval___relative_${resultFrom}d___relative_${resultTo}d`;
                            } else if (type === 'date' && value.from && value.to) {
                                control.defaultValue = `__interval_${dateTimeUtc({input: value.from}).format(DATE_FORMAT_V7)}_${dateTimeUtc({input: value.to}).format(DATE_FORMAT_V7)}`;
                            } else {
                                control.defaultValue = '';
                            }
                        } else if (type === 'relative') {
                            const {from = '0'} = value;
                            const resultFrom =
                                from[0] === '-' ? `+${from.replace('-', '')}` : `-${from || 0}`;
                            control.defaultValue = `__relative_${resultFrom}d`;
                        } else if (type === 'date' && value.from) {
                            control.defaultValue = dateTimeUtc({input: value.from}).format(
                                DATE_FORMAT_V7,
                            );
                        } else {
                            control.defaultValue = '';
                        }

                        item.defaults[datasetFieldId || control.fieldName] = control.defaultValue;
                    }

                    if (
                        control.elementType === DashTabItemControlElementType.Select &&
                        control.acceptableValues
                    ) {
                        control.acceptableValues = control.acceptableValues.map((value: any) => ({
                            title: value,
                            value,
                        }));
                    }

                    item.data = {
                        title,
                        sourceType,
                        source: omitBy(
                            {
                                showTitle,
                                ...control,
                                datasetId,
                                datasetFieldId,
                                chartId: entryId,
                            },
                            (value) => !value,
                        ),
                    };
                }

                return item;
            });

            tab.connections = tab.ignores.map(({who, whom}: any) => ({
                from: who,
                to: whom,
                kind: DashTabConnectionKind.Ignore,
            }));
            delete tab.ignores;
        });

        const result: DashData = {
            salt,
            counter,
            schemeVersion: 7,
            tabs,
            settings,
        };

        return result;
    }

    static async upTo8(originalData: any): Promise<DashData> {
        const data = await DashSchemeConverter.upTo7(originalData);
        const {schemeVersion} = data;

        if (schemeVersion >= 8) {
            return data;
        }

        data.tabs.forEach((dashTabItem) => {
            dashTabItem.items = dashTabItem.items.map((wi) => {
                const widgetItem = migrateBgColor(wi);
                if (widgetItem.type !== DashTabItemType.Control) {
                    return widgetItem;
                }
                for (const [key, val] of Object.entries(widgetItem.defaults)) {
                    widgetItem.defaults[key] = val === null ? '' : val;
                }
                return widgetItem;
            });
        });

        return {
            ...data,
            schemeVersion: 8,
        };
    }
}

export default DashSchemeConverter;
