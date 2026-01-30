import type {StateAndParamsMetaData} from '@gravity-ui/dashkit/helpers';
import {DashTabItemType} from 'shared';
import type {DashTabItemControlData, DashTabItemGroupControlData} from 'shared';
import {DASHKIT_STATE_VERSION} from 'ui/units/dash/modules/constants';
import type {GlobalItemWithId} from 'ui/units/dash/typings/dash';

import {getNewGlobalParamsAndQueueItems, updateExistingStateWithGlobalSelector} from '../helpers';

describe('dash helpers', () => {
    describe('getNewGlobalParamsAndQueueItems', () => {
        const mockSelector: GlobalItemWithId = {
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
            const groupSelector: GlobalItemWithId = {
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
                    version: DASHKIT_STATE_VERSION,
                },
            };
            const globalParams = {
                widget1: {params: {newParam: 'newValue'}},
            };
            const globalQueue = [{id: 'widget1'}];
            const previousMeta: StateAndParamsMetaData = {
                queue: [{id: 'widget2'}],
                version: DASHKIT_STATE_VERSION,
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
                    version: DASHKIT_STATE_VERSION,
                },
            });
        });

        it('should preserve non-global queue items and not updated global items', () => {
            const existingState = {
                widget1: {params: {param1: 'value1'}},
                widget2: {params: {param2: 'value2'}},
                __meta__: {
                    queue: [{id: 'widget1'}, {id: 'widget2'}],
                    version: DASHKIT_STATE_VERSION,
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

        it('should handle group control items with groupItemId in queue', () => {
            const existingState = {
                groupControl1: {
                    params: {
                        groupItem1: {param1: 'oldValue1'},
                        groupItem2: {param2: 'oldValue2'},
                    },
                },
                widget1: {params: {param3: 'value3'}},
                __meta__: {
                    queue: [
                        {id: 'groupControl1', groupItemId: 'groupItem1'},
                        {id: 'widget1'},
                        {id: 'groupControl1', groupItemId: 'groupItem2'},
                    ],
                    version: DASHKIT_STATE_VERSION,
                },
            };

            const globalParams = {
                groupControl1: {
                    params: {
                        groupItem1: {param1: 'newValue1'}, // changed
                        groupItem2: {param2: 'oldValue2'}, // unchanged
                        groupItem3: {param3: 'newValue3'}, // new
                    },
                },
            };

            const globalQueue = [
                {id: 'groupControl1', groupItemId: 'groupItem1'},
                {id: 'groupControl1', groupItemId: 'groupItem2'},
                {id: 'groupControl1', groupItemId: 'groupItem3'},
            ];

            const previousMeta: StateAndParamsMetaData = {
                queue: existingState.__meta__.queue,
                version: DASHKIT_STATE_VERSION,
            };

            const result = updateExistingStateWithGlobalSelector(
                existingState,
                globalParams,
                globalQueue,
                previousMeta,
            );

            // groupItem1 should be moved to the end because it was updated
            // groupItem2 should stay in place because it wasn't updated
            // groupItem3 should be added to the end
            expect((result.__meta__ as StateAndParamsMetaData).queue).toEqual([
                {id: 'widget1'}, // preserved non-global item
                {id: 'groupControl1', groupItemId: 'groupItem2'}, // unchanged group item stays in place
                {id: 'groupControl1', groupItemId: 'groupItem1'}, // updated group item moved to end
                {id: 'groupControl1', groupItemId: 'groupItem3'}, // new group item added to end
            ]);

            const groupParams = 'groupControl1' in result ? result['groupControl1'] : {};

            expect(groupParams).toEqual({
                params: {
                    groupItem1: {param1: 'newValue1'},
                    groupItem2: {param2: 'oldValue2'},
                    groupItem3: {param3: 'newValue3'},
                },
            });
        });

        it('should not overwrite selector values when not all group items are visible on tab', () => {
            // Scenario: Group control has 3 items, but only 2 are visible on current tab
            // The third item has different parameters on another tab and should not overwrite
            // the existing parameters of visible items
            const existingState = {
                groupControl1: {
                    params: {
                        visibleItem1: {param1: 'existingValue1'},
                        visibleItem2: {param2: 'existingValue2'},
                        hiddenItem3: {param3: 'existingValue3'}, // This item is not visible on current tab
                    },
                },
                __meta__: {
                    queue: [
                        {id: 'groupControl1', groupItemId: 'visibleItem1'},
                        {id: 'groupControl1', groupItemId: 'visibleItem2'},
                        {id: 'groupControl1', groupItemId: 'hiddenItem3'},
                    ],
                    version: DASHKIT_STATE_VERSION,
                },
            };

            // Global params contain only visible items on current tab
            // hiddenItem3 is not included because it's not visible on this tab
            const globalParams = {
                groupControl1: {
                    params: {
                        visibleItem1: {param1: 'newValue1'}, // changed
                        visibleItem2: {param2: 'existingValue2'}, // unchanged
                        // hiddenItem3 is not included - it should preserve its existing value
                    },
                },
            };

            const globalQueue = [
                {id: 'groupControl1', groupItemId: 'visibleItem1'},
                {id: 'groupControl1', groupItemId: 'visibleItem2'},
                // hiddenItem3 is not in the queue because it's not visible on this tab
            ];

            const previousMeta: StateAndParamsMetaData = {
                queue: existingState.__meta__.queue,
                version: DASHKIT_STATE_VERSION,
            };

            const result = updateExistingStateWithGlobalSelector(
                existingState,
                globalParams,
                globalQueue,
                previousMeta,
            );

            // Only visibleItem1 should be moved to the end because it was updated
            // visibleItem2 should stay in place because it wasn't updated
            // hiddenItem3 should stay in place and preserve its existing parameters
            expect((result.__meta__ as StateAndParamsMetaData).queue).toEqual([
                {id: 'groupControl1', groupItemId: 'visibleItem2'}, // unchanged visible item stays in place
                {id: 'groupControl1', groupItemId: 'hiddenItem3'}, // hidden item stays in place
                {id: 'groupControl1', groupItemId: 'visibleItem1'}, // updated visible item moved to end
            ]);

            const groupParams = 'groupControl1' in result ? result['groupControl1'] : {};

            // Verify that hiddenItem3 parameters are preserved and not overwritten
            expect(groupParams).toEqual({
                params: {
                    visibleItem1: {param1: 'newValue1'}, // updated
                    visibleItem2: {param2: 'existingValue2'}, // unchanged
                    hiddenItem3: {param3: 'existingValue3'}, // preserved from existing state
                },
            });
        });
    });
});
