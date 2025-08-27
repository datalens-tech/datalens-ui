import type {CommonSharedExtraSettings, Dataset, Shared} from 'shared';
import {ChartsConfigVersion, WizardType} from 'shared';

import {VISUALIZATION_IDS} from '../../../../constants/visualizations';
import {UPDATE_CLIENT_CHARTS_CONFIG, UPDATE_PREVIEW} from '../../actions/preview';
import {preview} from '../preview';

import {defaultPreviewState} from './mocks/preview.mock';
import {getMockedVisualizationsListWithId} from './utils/previewTestUtils';

const mockedVisualizations: Array<[string, Shared['visualization']]> =
    getMockedVisualizationsListWithId();

describe('Preview reducer', () => {
    describe('UPDATE_PREVIEW', () => {
        const chartTypeByVisualizationId: Record<string, WizardType> = {
            [VISUALIZATION_IDS.FLAT_TABLE]: WizardType.TableWizardNode,
            [VISUALIZATION_IDS.PIVOT_TABLE]: WizardType.TableWizardNode,
            [VISUALIZATION_IDS.GEOPOINT]: WizardType.YmapWizardNode,
            [VISUALIZATION_IDS.GEOPOLYGON]: WizardType.YmapWizardNode,
            [VISUALIZATION_IDS.HEATMAP]: WizardType.YmapWizardNode,
            [VISUALIZATION_IDS.GEOLAYER]: WizardType.YmapWizardNode,
            [VISUALIZATION_IDS.POLYLINE]: WizardType.YmapWizardNode,
            [VISUALIZATION_IDS.METRIC]: WizardType.MetricWizardNode,
            [VISUALIZATION_IDS.AREA]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.AREA_100P]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.BAR]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.BAR_Y_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.BAR_X_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.BAR_100P]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.BAR_Y_100P_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.LINE]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.LINE_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.COLUMN]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.COLUMN_100P]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.PIE]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.PIE_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.DONUT]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.DONUT_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.TREEMAP]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.SCATTER]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.SCATTER_D3]: WizardType.GravityChartsWizardNode,
            [VISUALIZATION_IDS.COMBINED_CHART]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.GEOPOINT_WITH_CLUSTER]: WizardType.GraphWizardNode,
            [VISUALIZATION_IDS.TREEMAP_D3]: WizardType.GravityChartsWizardNode,
        };

        it('Should return same state when calls with empty args', () => {
            const updatedState = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {},
            });

            expect(updatedState).toMatchObject(defaultPreviewState);
        });

        it('Should return same state when "needRedraw" === false', () => {
            const updatedState = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {needRedraw: false},
            });

            expect(updatedState).toMatchObject(defaultPreviewState);
        });

        it.each(mockedVisualizations)(
            'Should return state with configType depending on the type of visualization %s',
            (id: string, visualization) => {
                const expectedWizardType = chartTypeByVisualizationId[id];

                const updatedState = preview(defaultPreviewState, {
                    type: UPDATE_PREVIEW,
                    preview: {visualization},
                });

                expect(updatedState).toMatchObject({
                    ...defaultPreviewState,
                    isLoading: false,
                    configType: expectedWizardType,
                });
            },
        );

        it('Should disable pagination when datasets more then one', () => {
            const mockedVisualization = mockedVisualizations[0][1];
            const mockedDataset = {} as Dataset;
            const mockedDatasets = [mockedDataset, mockedDataset];
            const updatedState = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {
                    datasets: mockedDatasets,
                    extraSettings: {pagination: 'on'},
                    visualization: mockedVisualization,
                },
            });

            const extraSettings = updatedState.extraSettings as CommonSharedExtraSettings;

            expect(extraSettings.pagination).toEqual('off');
        });

        it('Should update only extraSettings, datasets, dataset, configType, visualization props when disable pagination', () => {
            const mockedVisualization = mockedVisualizations[0][1];
            const mockedDataset = {} as Dataset;
            const mockedDatasets = [mockedDataset, mockedDataset];
            const updatedState = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {
                    datasets: mockedDatasets,
                    extraSettings: {pagination: 'on'},
                    visualization: mockedVisualization,
                },
            });

            expect(updatedState).toMatchObject({
                ...defaultPreviewState,
                extraSettings: {pagination: 'off'},
                datasets: mockedDatasets,
                dataset: mockedDataset,
                configType: WizardType.GraphWizardNode,
                visualization: mockedVisualization,
            });
        });

        it('Should set loading state when all checks was falsy', () => {
            const mockedVisualizationWithItems = mockedVisualizations[0][1];

            const stateWithVisualization = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {visualization: mockedVisualizationWithItems},
            });

            expect(stateWithVisualization).toMatchObject({
                ...defaultPreviewState,
                visualization: mockedVisualizationWithItems,
                configType: WizardType.GraphWizardNode,
            });

            const mockedVisualization = {
                ...mockedVisualizationWithItems,
                placeholders: mockedVisualizationWithItems.placeholders.map((placeholder) => ({
                    ...placeholder,
                    items: [],
                })),
            };

            const updatedState = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {visualization: mockedVisualization},
            });

            expect(updatedState.isLoading).toEqual(true);
        });

        it('Should update only visualization, config, configType and isLoading props when all checks was falsy', () => {
            const mockedVisualizationWithItems = mockedVisualizations[0][1];

            const stateWithVisualization = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {visualization: mockedVisualizationWithItems},
            });

            expect(stateWithVisualization).toMatchObject({
                ...defaultPreviewState,
                visualization: mockedVisualizationWithItems,
                configType: WizardType.GraphWizardNode,
            });

            const mockedVisualization = {
                ...mockedVisualizationWithItems,
                placeholders: mockedVisualizationWithItems.placeholders.map((placeholder) => ({
                    ...placeholder,
                    items: [],
                })),
            };

            const updatedState = preview(defaultPreviewState, {
                type: UPDATE_PREVIEW,
                preview: {visualization: mockedVisualization},
            });

            expect(updatedState).toMatchObject({
                ...updatedState,
                visualization: mockedVisualization,
                config: undefined,
                configType: undefined,
                isLoading: true,
            });
        });
    });

    describe('UPDATE_CLIENT_CHARTS_CONFIG', () => {
        const defaultUpdateClientChartsConfigState = {
            ...defaultPreviewState,
            configType: WizardType.GraphWizardNode,
            visualization: mockedVisualizations[0][1],
        };
        it('Should return same state when configType is undefined', () => {
            const stateWithoutConfigType = {
                ...defaultUpdateClientChartsConfigState,
                configType: undefined,
            };
            const updatedState = preview(stateWithoutConfigType, {
                type: UPDATE_CLIENT_CHARTS_CONFIG,
                clientChartsConfigArgs: {},
            });

            expect(updatedState).toStrictEqual(stateWithoutConfigType);
        });

        it('Should return initialPreviewHash when isInitialPreview true', () => {
            const updatedStateWithoutInitialPreview = preview(
                defaultUpdateClientChartsConfigState,
                {type: UPDATE_CLIENT_CHARTS_CONFIG, clientChartsConfigArgs: {}},
            );

            expect(updatedStateWithoutInitialPreview.initialPreviewHash).toEqual('');

            const updatedState = preview(defaultUpdateClientChartsConfigState, {
                type: UPDATE_CLIENT_CHARTS_CONFIG,
                clientChartsConfigArgs: {isInitialPreview: true},
            });

            expect(updatedState.initialPreviewHash).not.toEqual('');
            expect(updatedState.initialPreviewHash).toEqual(updatedState.hash);
        });

        it('Should return config undefined, when withoutRerender true', () => {
            const updatedState = preview(defaultUpdateClientChartsConfigState, {
                type: UPDATE_CLIENT_CHARTS_CONFIG,
                clientChartsConfigArgs: {withoutRerender: true},
            });

            expect(updatedState.isLoading).toEqual(false);
            expect(updatedState.config).not.toBeDefined();
        });

        it('Should return config, when all data exists', () => {
            const mockedDataset = {
                id: 'mocked_dataset_id',
            } as Dataset;
            const stateWithDataset = {
                ...defaultUpdateClientChartsConfigState,
                dataset: mockedDataset,
                datasets: [mockedDataset],
            };
            const updatedState = preview(stateWithDataset, {
                type: UPDATE_CLIENT_CHARTS_CONFIG,
                clientChartsConfigArgs: {},
            });

            const expectedShared = {
                colors: [],
                colorsConfig: {},
                datasetsIds: ['mocked_dataset_id'],
                datasetsPartialFields: [[]],
                extraSettings: {},
                filters: [],
                geopointsConfig: {},
                hierarchies: [],
                labels: [],
                links: [],
                segments: [],
                shapesConfig: {},
                shapes: [],
                sort: [],
                tooltips: [],
                type: 'datalens',
                updates: [],
                version: ChartsConfigVersion.V14,
                visualization: stateWithDataset.visualization,
                wizardDataset: mockedDataset,
            };

            expect(updatedState.config?.shared).toStrictEqual(expectedShared);
        });
    });
});
