import {
    CONTROLS_PLACEMENT_MODE,
    DASH_CURRENT_SCHEME_VERSION,
    DashLoadPriority,
    DashTabConnectionKind,
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    DashTabItemTitleSizes,
    DashTabItemType,
} from '../../../';
import {type DashSchema, dashSchema} from '../dash-api.schema';

const DASH_DEFAULT_NAMESPACE = 'default';

describe('dashSchema', () => {
    describe('valid configurations', () => {
        it('should validate minimal valid dashboard configuration', () => {
            const validConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(validConfig);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validConfig);
            }
        });

        it('should validate complete dashboard configuration with all optional fields', () => {
            const validConfig: DashSchema = {
                key: 'dashboard-key-123',
                data: {
                    counter: 1,
                    salt: 'random-salt-123',
                    schemeVersion: DASH_CURRENT_SCHEME_VERSION,
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Complete Tab',
                            items: [
                                {
                                    id: 'text1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Text,
                                    data: {
                                        text: 'Sample text content',
                                    },
                                },
                                {
                                    id: 'title1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Title,
                                    data: {
                                        text: 'Sample Title',
                                        size: DashTabItemTitleSizes.L,
                                        showInTOC: true,
                                    },
                                },
                                {
                                    id: 'widget1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Widget,
                                    data: {
                                        hideTitle: false,
                                        tabs: [
                                            {
                                                id: 'widget-tab1',
                                                title: 'Widget Tab',
                                                description: 'Widget description',
                                                chartId: 'chart123',
                                                isDefault: true,
                                                params: {param1: 'value1'},
                                                autoHeight: true,
                                            },
                                        ],
                                    },
                                },
                            ],
                            layout: [
                                {
                                    i: 'text1',
                                    h: 2,
                                    w: 12,
                                    x: 0,
                                    y: 0,
                                },
                                {
                                    i: 'title1',
                                    h: 1,
                                    w: 12,
                                    x: 0,
                                    y: 2,
                                    parent: 'text1',
                                },
                            ],
                            connections: [
                                {
                                    from: 'control1',
                                    to: 'widget1',
                                    kind: DashTabConnectionKind.Ignore,
                                },
                            ],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [['alias1', 'alias2']],
                            },
                        },
                    ],
                    settings: {
                        autoupdateInterval: 60,
                        maxConcurrentRequests: 5,
                        loadPriority: DashLoadPriority.Charts,
                        silentLoading: true,
                        dependentSelectors: false,
                        globalParams: {globalParam: 'value'},
                        hideTabs: false,
                        hideDashTitle: true,
                        expandTOC: false,
                    },
                },
                meta: {metaKey: 'metaValue'},
                links: {linkKey: 'linkValue'},
            };

            const result = dashSchema.safeParse(validConfig);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validConfig);
            }
        });

        it('should validate dashboard with control items', () => {
            const validConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Tab with Controls',
                            items: [
                                {
                                    id: 'control1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Dataset Control',
                                        sourceType: DashTabItemControlSourceType.Dataset,
                                        source: {
                                            datasetId: 'dataset123',
                                            datasetFieldId: 'field123',
                                            elementType: DashTabItemControlElementType.Select,
                                            required: true,
                                            showHint: true,
                                            showTitle: true,
                                            defaultValue: 'default',
                                            multiselectable: false,
                                        },
                                    },
                                    defaults: {defaultParam: 'value'},
                                },
                                {
                                    id: 'control2',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Manual Control',
                                        sourceType: DashTabItemControlSourceType.Manual,
                                        source: {
                                            fieldName: 'manualField',
                                            elementType: DashTabItemControlElementType.Date,
                                            required: false,
                                            showHint: false,
                                            showTitle: true,
                                            defaultValue: '2023-01-01',
                                            isRange: true,
                                            acceptableValues: {
                                                from: '2023-01-01',
                                                to: '2023-12-31',
                                            },
                                        },
                                    },
                                    defaults: {},
                                },
                                {
                                    id: 'control3',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'External Control',
                                        sourceType: DashTabItemControlSourceType.External,
                                        source: {
                                            chartId: 'external-chart-123',
                                            text: 'External control text',
                                            autoHeight: true,
                                        },
                                    },
                                    defaults: {},
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(validConfig);
            expect(result.success).toBe(true);
        });

        it('should validate dashboard with group control', () => {
            const validConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Tab with Group Control',
                            items: [
                                {
                                    id: 'groupControl1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.GroupControl,
                                    data: {
                                        group: [
                                            {
                                                id: 'groupItem1',
                                                title: 'Group Item 1',
                                                namespace: DASH_DEFAULT_NAMESPACE,
                                                sourceType: DashTabItemControlSourceType.Dataset,
                                                defaults: {param: 'value'},
                                                placementMode: CONTROLS_PLACEMENT_MODE.AUTO,
                                                width: '50%',
                                                source: {
                                                    datasetId: 'dataset123',
                                                    datasetFieldId: 'field123',
                                                    elementType:
                                                        DashTabItemControlElementType.Input,
                                                    required: true,
                                                    showHint: false,
                                                    showTitle: true,
                                                    defaultValue: 'input value',
                                                },
                                            },
                                        ],
                                        autoHeight: true,
                                        buttonApply: true,
                                        buttonReset: false,
                                        showGroupName: true,
                                        updateControlsOnChange: false,
                                    },
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(validConfig);
            expect(result.success).toBe(true);
        });

        it('should validate different control element types', () => {
            // Test Select control
            const selectConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'control-select',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Select Control',
                                        sourceType: DashTabItemControlSourceType.Manual,
                                        source: {
                                            fieldName: 'selectField',
                                            elementType: DashTabItemControlElementType.Select,
                                            required: false,
                                            showHint: true,
                                            showTitle: true,
                                            defaultValue: ['option1', 'option2'],
                                            multiselectable: true,
                                        },
                                    },
                                    defaults: {},
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            // Test Date control
            const dateConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'control-date',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Date Control',
                                        sourceType: DashTabItemControlSourceType.Manual,
                                        source: {
                                            fieldName: 'dateField',
                                            elementType: DashTabItemControlElementType.Date,
                                            required: false,
                                            showHint: true,
                                            showTitle: true,
                                            defaultValue: '2023-01-01',
                                            isRange: false,
                                        },
                                    },
                                    defaults: {},
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            // Test Input control
            const inputConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'control-input',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Input Control',
                                        sourceType: DashTabItemControlSourceType.Manual,
                                        source: {
                                            fieldName: 'inputField',
                                            elementType: DashTabItemControlElementType.Input,
                                            required: false,
                                            showHint: true,
                                            showTitle: true,
                                            defaultValue: 'input text',
                                        },
                                    },
                                    defaults: {},
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            // Test Checkbox control
            const checkboxConfig: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'control-checkbox',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Checkbox Control',
                                        sourceType: DashTabItemControlSourceType.Manual,
                                        source: {
                                            fieldName: 'checkboxField',
                                            elementType: DashTabItemControlElementType.Checkbox,
                                            required: false,
                                            showHint: true,
                                            showTitle: true,
                                            defaultValue: 'true',
                                        },
                                    },
                                    defaults: {},
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const configs = [selectConfig, dateConfig, inputConfig, checkboxConfig];
            configs.forEach((config) => {
                const result = dashSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });

        it('should validate different title sizes', () => {
            const titleSizes = Object.values(DashTabItemTitleSizes);

            titleSizes.forEach((size, index) => {
                const config: DashSchema = {
                    data: {
                        tabs: [
                            {
                                id: 'tab1',
                                title: 'Test Tab',
                                items: [
                                    {
                                        id: `title${index}`,
                                        namespace: DASH_DEFAULT_NAMESPACE,
                                        type: DashTabItemType.Title,
                                        data: {
                                            text: `Title ${size}`,
                                            size: size,
                                        },
                                    },
                                ],
                                layout: [],
                                connections: [],
                                aliases: {
                                    [DASH_DEFAULT_NAMESPACE]: [],
                                },
                            },
                        ],
                    },
                };

                const result = dashSchema.safeParse(config);
                expect(result.success).toBe(true);
            });
        });
    });

    describe('invalid configurations', () => {
        it('should reject configuration without required data field', () => {
            const invalidConfig = {
                key: 'test-key',
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'invalid_type',
                        expected: 'object',
                        message: 'Invalid input: expected object, received undefined',
                        path: ['data'],
                    }),
                );
            }
        });

        it('should reject configuration without tabs', () => {
            const invalidConfig = {
                data: {
                    settings: {},
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'invalid_type',
                        path: ['data', 'tabs'],
                        message: 'Invalid input: expected array, received undefined',
                    }),
                );
            }
        });

        it('should reject tab with empty id', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: '',
                            title: 'Test Tab',
                            items: [],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_small',
                        path: ['data', 'tabs', 0, 'id'],
                    }),
                );
            }
        });

        it('should reject tab with empty title', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: '',
                            items: [],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_small',
                        path: ['data', 'tabs', 0, 'title'],
                    }),
                );
            }
        });

        it('should reject item with invalid namespace', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'text1',
                                    namespace: 'invalid-namespace',
                                    type: DashTabItemType.Text,
                                    data: {
                                        text: 'Sample text',
                                    },
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'invalid_value',
                        path: ['data', 'tabs', 0, 'items', 0, 'namespace'],
                    }),
                );
            }
        });

        it('should reject control with invalid element type', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'control1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Control,
                                    data: {
                                        title: 'Invalid Control',
                                        sourceType: DashTabItemControlSourceType.Manual,
                                        source: {
                                            fieldName: 'field1',
                                            elementType: 'invalid-type',
                                            required: false,
                                            showHint: false,
                                            showTitle: true,
                                        },
                                    },
                                    defaults: {},
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
        });

        it('should reject widget tab with empty chartId', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [
                                {
                                    id: 'widget1',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Widget,
                                    data: {
                                        hideTitle: false,
                                        tabs: [
                                            {
                                                id: 'widget-tab1',
                                                title: 'Widget Tab',
                                                chartId: '',
                                            },
                                        ],
                                    },
                                },
                            ],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_small',
                        path: ['data', 'tabs', 0, 'items', 0, 'data', 'tabs', 0, 'chartId'],
                    }),
                );
            }
        });

        it('should reject invalid scheme version', () => {
            const invalidConfig = {
                data: {
                    schemeVersion: DASH_CURRENT_SCHEME_VERSION + 1,
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_big',
                        path: ['data', 'schemeVersion'],
                    }),
                );
            }
        });

        it('should reject invalid autoupdate interval', () => {
            const invalidConfig = {
                data: {
                    tabs: [],
                    settings: {
                        autoupdateInterval: 15, // less than minimum 30
                    },
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'invalid_union',
                        path: ['data', 'settings', 'autoupdateInterval'],
                    }),
                );
            }
        });

        it('should reject invalid maxConcurrentRequests', () => {
            const invalidConfig = {
                data: {
                    tabs: [],
                    settings: {
                        maxConcurrentRequests: 0, // less than minimum 1
                    },
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'invalid_union',
                        path: ['data', 'settings', 'maxConcurrentRequests'],
                    }),
                );
            }
        });

        it('should accept layout item with negative dimensions (schema allows this)', () => {
            const validConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [],
                            layout: [
                                {
                                    i: 'item1',
                                    h: -1,
                                    w: 12,
                                    x: 0,
                                    y: 0,
                                },
                            ],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(validConfig);
            expect(result.success).toBe(true);
        });

        it('should reject connection with empty from/to fields', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [],
                            layout: [],
                            connections: [
                                {
                                    from: '',
                                    to: 'widget1',
                                    kind: DashTabConnectionKind.Ignore,
                                },
                            ],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_small',
                        path: ['data', 'tabs', 0, 'connections', 0, 'from'],
                    }),
                );
            }
        });

        it('should reject aliases with invalid structure', () => {
            const invalidConfig = {
                data: {
                    tabs: [
                        {
                            id: 'tab1',
                            title: 'Test Tab',
                            items: [],
                            layout: [],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [['single-item']], // should have at least 2 items
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(invalidConfig);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_small',
                        path: ['data', 'tabs', 0, 'aliases', DASH_DEFAULT_NAMESPACE, 0],
                    }),
                );
            }
        });
    });

    describe('edge cases', () => {
        it('should handle null values in settings', () => {
            const config = {
                data: {
                    tabs: [],
                    settings: {
                        autoupdateInterval: null,
                        maxConcurrentRequests: null,
                    },
                },
            };

            const result = dashSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should handle string autoupdate interval', () => {
            const config = {
                data: {
                    tabs: [],
                    settings: {
                        autoupdateInterval: '60',
                    },
                },
            };

            const result = dashSchema.safeParse(config);
            expect(result.success).toBe(true);
        });

        it('should handle empty key', () => {
            const config = {
                key: '',
                data: {
                    tabs: [],
                },
            };

            const result = dashSchema.safeParse(config);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues).toContainEqual(
                    expect.objectContaining({
                        code: 'too_small',
                        path: ['key'],
                    }),
                );
            }
        });

        it('should handle complex nested structures', () => {
            const config: DashSchema = {
                data: {
                    tabs: [
                        {
                            id: 'complex-tab',
                            title: 'Complex Tab',
                            items: [
                                {
                                    id: 'complex-widget',
                                    namespace: DASH_DEFAULT_NAMESPACE,
                                    type: DashTabItemType.Widget,
                                    data: {
                                        hideTitle: false,
                                        tabs: [
                                            {
                                                id: 'nested-tab-1',
                                                title: 'Nested Tab 1',
                                                description: 'First nested tab',
                                                chartId: 'chart-1',
                                                isDefault: true,
                                                params: {
                                                    complexParam: {
                                                        nested: {
                                                            value: 'deep-value',
                                                            array: [1, 2, 3],
                                                        },
                                                    },
                                                },
                                                autoHeight: false,
                                            },
                                            {
                                                id: 'nested-tab-2',
                                                title: 'Nested Tab 2',
                                                chartId: 'chart-2',
                                                params: {},
                                            },
                                        ],
                                    },
                                },
                            ],
                            layout: [
                                {
                                    i: 'complex-widget',
                                    h: 10,
                                    w: 24,
                                    x: 6,
                                    y: 5,
                                },
                            ],
                            connections: [],
                            aliases: {
                                [DASH_DEFAULT_NAMESPACE]: [
                                    ['alias-group-1', 'alias-group-2'],
                                    ['another-alias-1', 'another-alias-2'],
                                ],
                            },
                        },
                    ],
                },
            };

            const result = dashSchema.safeParse(config);
            expect(result.success).toBe(true);
        });
    });
});
