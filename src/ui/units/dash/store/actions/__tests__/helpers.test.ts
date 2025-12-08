import {type StateAndParamsMetaData} from '@gravity-ui/dashkit/helpers';
import {DashTabItemType} from 'shared';
import type {DashTabItem, DashTabItemControlData, DashTabItemGroupControlData} from 'shared';

import type {GlobalItem} from '../../typings/dash';
import {
    getNewGlobalParamsAndQueueItems,
    getVisibleGlobalItemsIdsByTab,
    updateExistingStateWithGlobalSelector,
} from '../helpers';

describe('dash helpers', () => {
    describe('getVisibleGlobalItemsIdsByTab', () => {
        it('should return empty set when no global items', () => {
            const result = getVisibleGlobalItemsIdsByTab(undefined, 'tab1');
            expect(result).toEqual(new Set());
        });

        it('should return control item id', () => {
            const globalItems: DashTabItem[] = [
                {
                    id: 'control1',
                    type: DashTabItemType.Control,
                    data: {} as DashTabItemControlData,
                    namespace: 'default',
                    orderId: 0,
                    defaults: {},
                },
            ];
            const result = getVisibleGlobalItemsIdsByTab(globalItems, 'tab1');
            expect(result).toEqual(new Set(['control1']));
        });

        it('should return group control and its group items ids', () => {
            const globalItems: DashTabItem[] = [
                {
                    id: 'group1',
                    type: DashTabItemType.GroupControl,
                    data: {
                        group: [
                            {id: 'item1', impactType: 'allTabs'},
                            {id: 'item2', impactType: 'selectedTabs', impactTabsIds: ['tab1']},
                        ],
                    } as DashTabItemGroupControlData,
                    namespace: 'default',
                    orderId: 0,
                    defaults: {},
                },
            ];
            const result = getVisibleGlobalItemsIdsByTab(globalItems, 'tab1');
            expect(result).toEqual(new Set(['group1', 'item1', 'item2']));
        });
    });

    describe('getNewGlobalParamsAndQueueItems', () => {
        const mockSelector: GlobalItem = {
            id: 'selector1',
            type: DashTabItemType.Control,
            data: {impactType: 'allTabs'} as DashTabItemControlData,
        };

        it('should return params and queue for control with allTabs impact', () => {
            const params = {param1: 'value1'};
            const result = getNewGlobalParamsAndQueueItems(
                'tab1',
                mockSelector,
                ['selector1'],
                params,
            );

            expect(result.globalParams).toEqual({
                selector1: {params},
            });
            expect(result.globalQueue).toEqual([{id: 'selector1'}]);
        });

        it('should return empty for control without impact on tab', () => {
            const selectorWithoutImpact = {
                ...mockSelector,
                data: {
                    impactType: 'selectedTabs',
                    impactTabsIds: ['tab2'],
                } as DashTabItemControlData,
            };
            const params = {param1: 'value1'};
            const result = getNewGlobalParamsAndQueueItems(
                'tab1',
                selectorWithoutImpact,
                ['selector1'],
                params,
            );

            expect(result.globalParams).toEqual({});
            expect(result.globalQueue).toEqual([]);
        });

        it('should handle group control with mixed impact types', () => {
            const groupSelector: GlobalItem = {
                id: 'group1',
                type: DashTabItemType.GroupControl,
                data: {
                    impactType: 'allTabs',
                    group: [
                        {id: 'item1', impactType: 'asGroup'},
                        {id: 'item2', impactType: 'selectedTabs', impactTabsIds: ['tab1']},
                        {id: 'item3', impactType: 'selectedTabs', impactTabsIds: ['tab2']},
                    ],
                } as DashTabItemGroupControlData,
            };
            const params = {
                item1: {param1: 'value1'},
                item2: {param2: 'value2'},
            };
            const result = getNewGlobalParamsAndQueueItems(
                'tab1',
                groupSelector,
                ['item1', 'item2'],
                params,
            );

            expect(result.globalParams).toEqual({
                group1: {
                    params: {
                        item1: {param1: 'value1'},
                        item2: {param2: 'value2'},
                    },
                },
            });
            expect(result.globalQueue).toEqual([
                {id: 'group1', groupItemId: 'item1'},
                {id: 'group1', groupItemId: 'item2'},
            ]);
        });
    });

    describe('updateExistingStateWithGlobalSelector', () => {
        it('should update existing state with new global params', () => {
            const existingState = {
                widget1: {params: {oldParam: 'oldValue'}},
                __meta__: {
                    queue: [{id: 'widget2'}],
                    version: 2,
                },
            };
            const globalParams = {
                widget1: {params: {newParam: 'newValue'}},
            };
            const globalQueue = [{id: 'widget1'}];
            const previousMeta: StateAndParamsMetaData = {
                queue: [{id: 'widget2'}],
                version: 2,
            };

            const result = updateExistingStateWithGlobalSelector(
                existingState,
                globalParams,
                globalQueue,
                previousMeta,
            );

            expect(result).toEqual({
                widget1: {params: {newParam: 'newValue'}},
                __meta__: {
                    queue: [{id: 'widget2'}, {id: 'widget1'}],
                    version: 2,
                },
            });
        });

        it('should preserve non-global queue items and not updated global items', () => {
            const existingState = {
                widget1: {params: {param1: 'value1'}},
                widget2: {params: {param2: 'value2'}},
                __meta__: {
                    queue: [{id: 'widget1'}, {id: 'widget2'}],
                    version: 2,
                },
            };
            const globalParams = {
                widget1: {params: {param1: 'value1'}},
                widget3: {params: {newParam: 'newValue'}},
            };
            const globalQueue = [{id: 'widget3'}, {id: 'widget1'}];

            const result = updateExistingStateWithGlobalSelector(
                existingState,
                globalParams,
                globalQueue,
                existingState.__meta__,
            );

            expect((result.__meta__ as StateAndParamsMetaData).queue).toEqual([
                {id: 'widget1'}, // params have not been changed, so the global item remains in the same position
                {id: 'widget2'}, // preserved non-global item
                {id: 'widget3'}, // new global item
            ]);
        });
    });
});
