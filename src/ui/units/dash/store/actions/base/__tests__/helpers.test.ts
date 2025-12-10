import type {
    ItemsStateAndParams,
    ItemsStateAndParamsBase,
    QueueItem,
} from '@gravity-ui/dashkit/helpers';
import {DashTabItemControlSourceType, DashTabItemType} from 'shared';
import type {
    DashData,
    DashTab,
    DashTabItem,
    DashTabItemControlData,
    DashTabItemGroupControlData,
    ImpactType,
} from 'shared';
import {DASHKIT_STATE_VERSION} from 'ui/units/dash/modules/constants';

import {getGlobalStatesForInactiveTabs} from '../helpers';

jest.mock('ui/utils/isEnabledFeature', () => ({
    isEnabledFeature: jest.fn(),
}));

const createMockDashData = (tabs: DashTab[]): DashData => ({
    counter: 1,
    tabs,
    salt: 'salt',
    schemeVersion: 1,
    settings: {
        autoupdateInterval: null,
        maxConcurrentRequests: null,
        silentLoading: false,
        dependentSelectors: true,
        hideTabs: false,
        expandTOC: false,
    },
});

type MockedGroupItem = {id: string; impactType?: ImpactType; impactTabsIds?: string[]};

const createMockTab = (id: string, title: string, globalItems: MockedGroupItem[] = []) => ({
    id,
    title,
    items: [],
    layout: [],
    aliases: {},
    connections: [],
    globalItems: globalItems as DashTabItem[],
});

const createMockControlItem = (
    id: string,
    title: string,
    sourceType = DashTabItemControlSourceType.External,
    source = {chartId: 'test'},
) => ({
    id,
    type: DashTabItemType.Control,
    namespace: 'default',
    data: {
        id,
        title,
        namespace: 'default',
        sourceType,
        source,
    } as DashTabItemControlData,
    defaults: {},
});

const createMockGroupControlItem = (id: string, groupItems: MockedGroupItem[]) => ({
    id,
    type: DashTabItemType.GroupControl,
    namespace: 'default',
    data: {
        group: groupItems,
    } as DashTabItemGroupControlData,
    defaults: {},
});

const createMockState = (
    items: ItemsStateAndParamsBase,
    queue: QueueItem[],
    version = DASHKIT_STATE_VERSION,
): ItemsStateAndParams => ({
    ...items,
    __meta__: {
        queue,
        version,
    },
});

// Tests for base/helpers.ts functions
describe('base/helpers.ts', () => {
    const {isEnabledFeature} = require('ui/utils/isEnabledFeature');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getGlobalStatesForInactiveTabs', () => {
        it('should resolve null when queue is empty', async () => {
            isEnabledFeature.mockReturnValue(true);

            const state = createMockState({}, []);
            const data = createMockDashData([createMockTab('tab1', 'Tab 1')]);

            const result = await getGlobalStatesForInactiveTabs({
                state,
                data,
                currentTabId: 'tab1',
            });

            expect(result).toBeNull();
        });

        it('should skip tabs with no global items', async () => {
            isEnabledFeature.mockReturnValue(true);

            const state = createMockState({control1: {params: {param1: 'value1'}}}, [
                {id: 'control1'},
            ]);

            const data = createMockDashData([
                createMockTab('tab1', 'Tab 1'),
                createMockTab('tab2', 'Tab 2'),
            ]);

            const result = await getGlobalStatesForInactiveTabs({
                state,
                data,
                currentTabId: null,
            });

            expect(result).toBeNull();
        });

        it('should process tabs with global items and return updated hash states', async () => {
            isEnabledFeature.mockReturnValue(true);

            const state = createMockState(
                {
                    control1: {params: {param1: 'value1'}},
                    groupControl1: {
                        params: {
                            groupItem1: {groupParam1: 'groupValue1'},
                            groupItem2: {groupParam2: 'groupValue2'},
                        },
                    },
                },
                [
                    {id: 'control1'},
                    {id: 'groupControl1', groupItemId: 'groupItem1'},
                    {id: 'groupControl1', groupItemId: 'groupItem2'},
                ],
            );

            const data = createMockDashData([
                createMockTab('tab1', 'Tab 1', [
                    createMockControlItem('control1', 'Control 1'),
                    createMockGroupControlItem('groupControl1', [
                        {id: 'groupItem1', impactType: 'allTabs'},
                        {id: 'groupItem2', impactType: 'allTabs'},
                    ]),
                ]),
                createMockTab('tab2', 'Tab 2', [
                    createMockControlItem('control1', 'Control 1'),
                    createMockGroupControlItem('groupControl1', [
                        {id: 'groupItem1', impactType: 'allTabs'},
                        {id: 'groupItem2', impactType: 'allTabs'},
                    ]),
                ]),
            ]);

            const mockNewTabState = createMockState(
                {
                    control1: {params: {param1: 'value1'}},
                    groupControl1: {
                        params: {
                            groupItem1: {groupParam1: 'groupValue1'},
                            groupItem2: {groupParam2: 'groupValue2'},
                        },
                    },
                },
                [
                    {id: 'control1'},
                    {id: 'groupControl1', groupItemId: 'groupItem1'},
                    {id: 'groupControl1', groupItemId: 'groupItem2'},
                ],
            );

            const result = await getGlobalStatesForInactiveTabs({
                state,
                data,
                currentTabId: 'tab1',
            });

            expect(result).toEqual({
                tab2: {
                    state: mockNewTabState,
                    hash: undefined,
                },
            });
        });

        it('should handle multiple tabs with different global items', async () => {
            isEnabledFeature.mockReturnValue(true);

            const state = createMockState(
                {
                    control1: {params: {param1: 'value1'}},
                    control2: {params: {param2: 'value2'}},
                    groupControl1: {
                        params: {
                            groupItem1: {groupParam1: 'groupValue1'},
                            groupItem2: {groupParam2: 'groupValue2'},
                        },
                    },
                },
                [
                    {id: 'control1'},
                    {id: 'control2'},
                    {id: 'groupControl1', groupItemId: 'groupItem1'},
                    {id: 'groupControl1', groupItemId: 'groupItem2'},
                ],
            );

            const data = createMockDashData([
                createMockTab('tab1', 'Tab 1', [
                    createMockControlItem(
                        'control1',
                        'Control 1',
                        DashTabItemControlSourceType.Manual,
                        {chartId: 'test'},
                    ),
                    createMockGroupControlItem('groupControl1', [
                        {id: 'groupItem1', impactType: 'allTabs'},
                        {
                            id: 'groupItem2',
                            impactType: 'selectedTabs',
                            impactTabsIds: ['tab1', 'tab3'],
                        },
                    ]),
                ]),
                createMockTab('tab2', 'Tab 2', [
                    createMockControlItem(
                        'control2',
                        'Control 2',
                        DashTabItemControlSourceType.Manual,
                        {chartId: 'test'},
                    ),
                ]),
                createMockTab('tab3', 'Tab 3', [
                    createMockControlItem(
                        'control1',
                        'Control 1',
                        DashTabItemControlSourceType.Manual,
                        {chartId: 'test'},
                    ),
                    createMockControlItem(
                        'control2',
                        'Control 2',
                        DashTabItemControlSourceType.Manual,
                        {chartId: 'test'},
                    ),
                    createMockGroupControlItem('groupControl1', [
                        {id: 'groupItem1', impactType: 'allTabs'},
                        {
                            id: 'groupItem2',
                            impactType: 'selectedTabs',
                            impactTabsIds: ['tab1', 'tab3'],
                        },
                    ]),
                ]),
            ]);

            const mockNewTabState1 = createMockState({control2: {params: {param2: 'value2'}}}, [
                {id: 'control2'},
            ]);

            const mockNewTabState2 = createMockState(
                {
                    control1: {params: {param1: 'value1'}},
                    control2: {params: {param2: 'value2'}},
                    groupControl1: {
                        params: {
                            groupItem1: {groupParam1: 'groupValue1'},
                            groupItem2: {groupParam2: 'groupValue2'},
                        },
                    },
                },
                [
                    {id: 'control1'},
                    {id: 'control2'},
                    {id: 'groupControl1', groupItemId: 'groupItem1'},
                    {id: 'groupControl1', groupItemId: 'groupItem2'},
                ],
            );

            const result = await getGlobalStatesForInactiveTabs({
                state,
                data,
                currentTabId: 'tab1',
            });

            expect(result).toEqual({
                tab2: {
                    state: mockNewTabState1,
                    hash: undefined,
                },
                tab3: {
                    state: mockNewTabState2,
                    hash: undefined,
                },
            });
        });
    });
});
