import get from 'lodash/get';
import type {DLGlobalData, Permissions} from 'shared';
import {EntryScope} from 'shared';

import type {ContextMenuParams} from '../types';
import {getEntryContextMenuItems} from '../withConfiguredEntryContextMenu/withConfiguredEntryContextMenu';

jest.mock('../../../utils/utils', () => {
    return {
        isEnabledFeature: (feature: string) => get(window.DL.dynamicFeatures, feature),
    };
});

jest.mock('ui', () => {
    enum MockedScope {
        Dataset = 'dataset',
        Folder = 'folder',
        Dash = 'dash',
        Connection = 'connection',
        Widget = 'widget',
    }

    return {
        Scope: MockedScope,
        URL_QUERY: {
            REV_ID: 'revId',
        },
    };
});
jest.mock('../../../registry', () => ({
    registry: {
        common: {
            functions: {
                get: (str: string) => {
                    return str === 'getAdditionalEntryContextMenuItems'
                        ? () => []
                        : () => undefined;
                },
                getAll: () => {
                    return {
                        getTopLevelEntryScopes: () => [EntryScope.Dash],
                        getAllEntryScopes: () => Object.values(EntryScope),
                        getEntryScopesWithRevisionsList: () => [EntryScope.Dash, EntryScope.Widget],
                    };
                },
            },
        },
    },
}));

type TestData = {
    testId: number;
    input: {
        params: {
            entry: {
                scope: string;
                permissions: undefined | Permissions;
            };
            isEditMode: boolean;
            showSpecificItems: boolean;
            isLimitedView?: boolean;
        };
        mock: {
            features: {
                EntryMenuItemCopy: boolean;
                EntryMenuItemMove: boolean;
                MenuItemsFlatView: boolean;
            };
            showMenuInCharts: boolean;
            revId: null | string;
        };
    };
    result: Array<string>;
};

const PermissionsFalse: Permissions = {admin: false, edit: false, read: false, execute: false};

const testDataContextMenu: Array<TestData> = [
    {
        testId: 1,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Connection,
                    permissions: undefined,
                },
                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['rename', 'delete', 'move', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 2,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Connection,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: false,
                    EntryMenuItemMove: false,
                    MenuItemsFlatView: true,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['copy-link', 'show-related-entities'],
    },
    {
        testId: 3,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Dash,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: false,
                revId: 'rev',
            },
        },
        result: ['copy-link', 'show-related-entities'],
    },
    {
        testId: 4,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Dash,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: false,
                    EntryMenuItemMove: false,
                    MenuItemsFlatView: true,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['copy-link', 'show-related-entities'],
    },
    {
        testId: 5,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Dash,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: true,
                isLimitedView: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: false,
                    EntryMenuItemMove: false,
                    MenuItemsFlatView: true,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['copy-link', 'show-related-entities'],
    },
    {
        testId: 6,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Dataset,
                    permissions: undefined,
                },

                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['rename', 'delete', 'move', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 7,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Dataset,
                    permissions: {
                        admin: true,
                        edit: false,
                        read: false,
                        execute: false,
                    },
                },
                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['rename', 'delete', 'move', 'copy', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 8,
        input: {
            params: {
                entry: {
                    scope: 'folder',
                    permissions: PermissionsFalse,
                },

                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['copy-link'],
    },
    {
        testId: 9,
        input: {
            params: {
                entry: {
                    scope: 'folder',
                    permissions: PermissionsFalse,
                },

                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: false,
                    EntryMenuItemMove: false,
                    MenuItemsFlatView: true,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['copy-link'],
    },
    {
        testId: 10,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Widget,
                    permissions: undefined,
                },

                isEditMode: false,
                showSpecificItems: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: true,
                revId: null,
            },
        },
        result: [
            'revisions',
            'rename',
            'delete',
            'move',
            'copy',
            'copy-link',
            'show-related-entities',
        ],
    },
    {
        testId: 11,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Widget,
                    permissions: undefined,
                },
                isEditMode: false,
                showSpecificItems: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: true,
                revId: 'rev',
            },
        },
        result: ['revisions', 'rename', 'delete', 'move', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 12,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Widget,
                    permissions: undefined,
                },
                isEditMode: false,
                showSpecificItems: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: false,
                    EntryMenuItemMove: false,
                    MenuItemsFlatView: true,
                },
                showMenuInCharts: true,
                revId: null,
            },
        },
        result: ['revisions', 'rename', 'delete', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 13,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Widget,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: false,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: false,
                revId: null,
            },
        },
        result: ['copy', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 14,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Widget,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: true,
                revId: null,
            },
        },
        result: ['copy', 'copy-link', 'show-related-entities'],
    },
    {
        testId: 15,
        input: {
            params: {
                entry: {
                    scope: EntryScope.Widget,
                    permissions: PermissionsFalse,
                },
                isEditMode: false,
                showSpecificItems: true,
                isLimitedView: true,
            },
            mock: {
                features: {
                    EntryMenuItemCopy: true,
                    EntryMenuItemMove: true,
                    MenuItemsFlatView: false,
                },
                showMenuInCharts: true,
                revId: null,
            },
        },
        result: ['copy', 'copy-link', 'show-related-entities'],
    },
];

describe('withConfiguredEntryContextMenu', () => {
    let windowSpy: jest.SpyInstance<{
        DL: DLGlobalData;
        location: {pathname: string; search: string};
    }>;
    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get');
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    for (const testData of testDataContextMenu) {
        // description of the showMenuInCharts parameter:
        // - The page is not editor, the page path does not contain (part !== 'editor')
        // affects the result of the getEntryScopesWithRevisionsList() function for the REVISIONS action
        const testSuffix = `${testData.input.params.entry.scope} - [testId: ${testData.testId}]`;

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        test(`check the creation of context menus with different rights - ${testSuffix}`, () => {
            windowSpy.mockImplementation(() => ({
                DL: {
                    dynamicFeatures: {
                        MenuItemsFlatView: testData.input.mock.features.MenuItemsFlatView,
                        EntryMenuItemCopy: testData.input.mock.features.EntryMenuItemCopy,
                        EntryMenuItemMove: testData.input.mock.features.EntryMenuItemMove,
                    },
                } as unknown as DLGlobalData,
                location: {
                    pathname: testData.input.mock.showMenuInCharts ? '' : '/editor',
                    search: testData.input.mock.revId ? `?revId=${testData.input.mock.revId}` : '',
                },
            }));

            const result = getEntryContextMenuItems(testData.input.params as ContextMenuParams);

            expect(result.map((menuItem) => menuItem.action)).toEqual(testData.result);
        });
    }
});
