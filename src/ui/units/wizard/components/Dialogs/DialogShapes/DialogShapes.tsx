import React from 'react';

import {Shapes4} from '@gravity-ui/icons';
import {Button, Dialog, Flex, Icon, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import {
    type DatasetOptions,
    DialogShapeSettings,
    type Field,
    type FilterField,
    type ShapesConfig,
    type Update,
    type ValueOf,
} from 'shared';
import {getColorsConfigKey} from 'shared/modules/colors/common-helpers';
import {
    DEFAULT_LINE_CAP,
    DFAULT_LINE_JOIN,
    LINE_WIDTH_AUTO_VALUE,
    LINE_WIDTH_DEFAULT_VALUE,
} from 'ui/units/wizard/constants/shapes';
import type {LineCap, LineJoin} from 'ui/units/wizard/typings/shapes';

import {PaletteTypes} from '../../../constants';

import type {DialogLineCapAndJoinValue} from './DialogLineCapAndJoin/DialogLineCapAndJoin';
import {DialogShapesChartSettingsTab} from './tabs/DialogShapesChartSettingsTab';
import {DialogShapesGraphSettingsTab} from './tabs/DialogShapesGraphSettingsTab';

import './DialogShapes.scss';

export const DIALOG_SHAPES = Symbol('DIALOG_SHAPES');

const b = block('dialog-shapes');

type Props = {
    item: Field;
    items?: Field[];
    distincts?: Record<string, string[]>;
    options: DatasetOptions;
    parameters: Field[];
    dashboardParameters: Field[];
    datasetId: string;
    updates: Update[];
    filters: FilterField[];
    onApply: (shapesConfig: ShapesConfig) => void;
    onCancel: () => void;
    shapesConfig: ShapesConfig;
    paletteType: PaletteTypes;
};

export type OpenDialogShapesArgs = {
    id: typeof DIALOG_SHAPES;
    props: Props;
};

export type ShapesState = {
    mountedShapes: Record<string, string>;
    mountedShapesLineWidths: Record<string, string>;
    chartLineWidth: string;
    capAndJoin: DialogLineCapAndJoinValue;
    selectedValue: string | null;
};

const SETTINGS_SCOPE = {
    GRAPH: 'graph-shapes-settings',
    CHART: 'chart-shapes-settings',
} as const;

const SETTINGS_SCOPE_TABS = [
    {
        title: i18n('wizard', 'label_dialog-shapes-line-settings-tab'),
        value: SETTINGS_SCOPE.GRAPH,
        qa: DialogShapeSettings.LineSettingsGraphScopeTab,
    },
    {
        title: i18n('wizard', 'label_dialog-shapes-chart-settings-tab'),
        value: SETTINGS_SCOPE.CHART,
        qa: DialogShapeSettings.LineSettingsChartScopeTab,
    },
];

type GetInitialShapesStateArgs = {
    shapesConfig: ShapesConfig;
    paletteType: PaletteTypes;
    items?: Field[];
};

function getInitialShapesState({
    shapesConfig,
    paletteType,
    items,
}: GetInitialShapesStateArgs): ShapesState {
    const mountedShapes = shapesConfig.mountedShapes ?? {};

    const allLineIds =
        items?.map(
            (lineItem) => getColorsConfigKey(lineItem, items, {isMeasureNames: true}) as string,
        ) ?? [];

    const savedLineWidths =
        paletteType === PaletteTypes.Lines && shapesConfig.mountedShapesLineWidths
            ? Object.fromEntries(
                  Object.entries(shapesConfig.mountedShapesLineWidths).map(([key, value]) => [
                      key,
                      String(value),
                  ]),
              )
            : {};

    const mountedShapesLineWidths =
        paletteType === PaletteTypes.Lines
            ? Object.fromEntries(
                  allLineIds.map((lineId) => [
                      lineId,
                      savedLineWidths[lineId] ?? LINE_WIDTH_AUTO_VALUE,
                  ]),
              )
            : {};

    const chartLineWidth =
        shapesConfig.chartLineWidth === undefined
            ? LINE_WIDTH_DEFAULT_VALUE
            : String(shapesConfig.chartLineWidth);

    return {
        selectedValue: null,
        mountedShapes,
        mountedShapesLineWidths,
        chartLineWidth,
        capAndJoin: {
            cap: (shapesConfig.linecap as LineCap | undefined) || DEFAULT_LINE_CAP,
            join: (shapesConfig.linejoin as LineJoin | undefined) || DFAULT_LINE_JOIN,
        },
    };
}

const DialogShapes: React.FC<Props> = ({
    item,
    items,
    distincts,
    options,
    datasetId,
    updates,
    filters,
    onApply,
    shapesConfig,
    parameters,
    dashboardParameters,
    onCancel,
    paletteType,
}: Props) => {
    const [activeTab, setActiveTab] = React.useState<ValueOf<typeof SETTINGS_SCOPE>>(
        SETTINGS_SCOPE.GRAPH,
    );
    const [shapesState, setShapesState] = React.useState<ShapesState>(() =>
        getInitialShapesState({shapesConfig, paletteType, items}),
    );

    const onPaletteItemClick = React.useCallback(
        (shape: string) => {
            const {selectedValue} = shapesState;

            if (!selectedValue) {
                return;
            }

            const mountedShapes = {...shapesState.mountedShapes};
            const mountedShapesLineWidths = {...shapesState.mountedShapesLineWidths};
            const isDefaultValue = shape === 'auto';
            if (isDefaultValue) {
                delete mountedShapes[selectedValue];
            } else {
                mountedShapes[selectedValue] = shape;
                mountedShapesLineWidths[selectedValue] =
                    mountedShapesLineWidths[selectedValue] || LINE_WIDTH_AUTO_VALUE;
            }

            setShapesState((prevState) => ({
                ...prevState,
                mountedShapes,
                ...(paletteType === PaletteTypes.Lines ? {mountedShapesLineWidths} : {}),
            }));
        },
        [paletteType, shapesState],
    );

    const onLineWidthChange = React.useCallback((nextLineWidth: string) => {
        setShapesState((prevState) => ({
            ...prevState,
            mountedShapesLineWidths: {
                ...prevState.mountedShapesLineWidths,
                ...(prevState.selectedValue ? {[prevState.selectedValue]: nextLineWidth} : {}),
            },
        }));
    }, []);

    const onChartLineWidthChange = React.useCallback((nextLineWidth: string) => {
        setShapesState((prevState) => ({
            ...prevState,
            chartLineWidth: nextLineWidth,
        }));
    }, []);

    const onLineCapAndJoinChange = React.useCallback((nextValue: DialogLineCapAndJoinValue) => {
        setShapesState((prevState) => ({
            ...prevState,
            capAndJoin: {cap: nextValue.cap, join: nextValue.join},
        }));
    }, []);

    const onReset = React.useCallback(() => {
        setShapesState((prevState) => ({
            ...prevState,
            mountedShapes: {},
            mountedShapesLineWidths: {},
            chartLineWidth: LINE_WIDTH_DEFAULT_VALUE,
            capAndJoin: {
                cap: DEFAULT_LINE_CAP,
                join: DFAULT_LINE_JOIN,
            },
        }));
    }, []);

    const isResetDisabled = React.useMemo(() => {
        const hasNoMountedShapes =
            shapesState.mountedShapes && !Object.keys(shapesState.mountedShapes).length;
        const hasNoMountedShapesLineWidths =
            shapesState.mountedShapesLineWidths &&
            !Object.keys(shapesState.mountedShapesLineWidths).length;
        const isChartLineWidthDefault = shapesState.chartLineWidth === LINE_WIDTH_DEFAULT_VALUE;
        const isCapAndJoinDefault =
            shapesState.capAndJoin.cap === DEFAULT_LINE_CAP &&
            shapesState.capAndJoin.join === DFAULT_LINE_JOIN;

        return (
            hasNoMountedShapes &&
            hasNoMountedShapesLineWidths &&
            isChartLineWidthDefault &&
            isCapAndJoinDefault
        );
    }, [
        shapesState.mountedShapes,
        shapesState.mountedShapesLineWidths,
        shapesState.chartLineWidth,
        shapesState.capAndJoin.cap,
        shapesState.capAndJoin.join,
    ]);

    const onClose = React.useCallback(() => {
        onCancel();
    }, [onCancel]);

    const onCancelButtonClick = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const onApplyButtonClick = React.useCallback(() => {
        // Filter out lines with LINE_WIDTH_AUTO_VALUE - they will inherit from chartLineWidth on the server
        const filteredMountedShapesLineWidths = Object.entries(
            shapesState.mountedShapesLineWidths,
        ).reduce<Record<string, number>>((acc, [key, value]) => {
            if (value !== LINE_WIDTH_AUTO_VALUE) {
                acc[key] = Number(value);
            }
            return acc;
        }, {});

        const nextShapesConfig: ShapesConfig = {
            mountedShapes: shapesState.mountedShapes,
            chartLineWidth: Number(shapesState.chartLineWidth),
            ...(paletteType === PaletteTypes.Lines
                ? {
                      mountedShapesLineWidths: filteredMountedShapesLineWidths,
                  }
                : {}),
            linecap: shapesState.capAndJoin.cap,
            linejoin: shapesState.capAndJoin.join,
            fieldGuid: item.guid,
        };
        onApply(nextShapesConfig);
        onClose();
    }, [
        shapesState.mountedShapesLineWidths,
        shapesState.chartLineWidth,
        shapesState.mountedShapes,
        shapesState.capAndJoin.cap,
        shapesState.capAndJoin.join,
        paletteType,
        item.guid,
        onApply,
        onClose,
    ]);

    const linesShapesDialogBody = React.useMemo(() => {
        return (
            <TabProvider
                value={activeTab}
                onUpdate={(value) => setActiveTab(value as ValueOf<typeof SETTINGS_SCOPE>)}
            >
                <Flex direction="column" style={{width: '100%', height: '100%'}}>
                    <TabList style={{padding: '0 32px', flexShrink: 0}}>
                        {SETTINGS_SCOPE_TABS.map(({title, value, qa}) => (
                            <Tab key={value} value={value} qa={qa}>
                                {title}
                            </Tab>
                        ))}
                    </TabList>
                    <React.Fragment>
                        <TabPanel
                            value={SETTINGS_SCOPE.GRAPH}
                            style={{height: '100%'}}
                            qa={DialogShapeSettings.LineSettingsGraphScopeTabPanel}
                        >
                            <DialogShapesGraphSettingsTab
                                item={item}
                                items={items}
                                distincts={distincts}
                                options={options}
                                parameters={parameters}
                                dashboardParameters={dashboardParameters}
                                datasetId={datasetId}
                                updates={updates}
                                filters={filters}
                                shapesState={shapesState}
                                paletteType={paletteType}
                                setShapesState={(state) =>
                                    setShapesState((prevState) => ({
                                        ...prevState,
                                        ...state,
                                    }))
                                }
                                onPaletteItemClick={onPaletteItemClick}
                                onLineWidthChange={onLineWidthChange}
                            />
                        </TabPanel>
                        <TabPanel
                            value={SETTINGS_SCOPE.CHART}
                            style={{height: '100%'}}
                            qa={DialogShapeSettings.LineSettingsChartScopeTabPanel}
                        >
                            <DialogShapesChartSettingsTab
                                shapesState={shapesState}
                                paletteType={paletteType}
                                onChartLineWidthChange={onChartLineWidthChange}
                                onLineCapAndJoinChange={onLineCapAndJoinChange}
                            />
                        </TabPanel>
                    </React.Fragment>
                </Flex>
            </TabProvider>
        );
    }, [
        activeTab,
        dashboardParameters,
        datasetId,
        distincts,
        filters,
        item,
        items,
        onChartLineWidthChange,
        onLineCapAndJoinChange,
        onLineWidthChange,
        onPaletteItemClick,
        options,
        paletteType,
        parameters,
        shapesState,
        updates,
    ]);

    const otherShapesDialogBody = React.useMemo(() => {
        return (
            <DialogShapesGraphSettingsTab
                item={item}
                items={items}
                distincts={distincts}
                options={options}
                parameters={parameters}
                dashboardParameters={dashboardParameters}
                datasetId={datasetId}
                updates={updates}
                filters={filters}
                shapesState={shapesState}
                paletteType={paletteType}
                setShapesState={(state) =>
                    setShapesState((prevState) => ({
                        ...prevState,
                        ...state,
                    }))
                }
                onPaletteItemClick={onPaletteItemClick}
                onLineWidthChange={onLineWidthChange}
            />
        );
    }, [
        dashboardParameters,
        datasetId,
        distincts,
        filters,
        item,
        items,
        onLineWidthChange,
        onPaletteItemClick,
        options,
        paletteType,
        parameters,
        shapesState,
        updates,
    ]);

    return (
        <Dialog onClose={onClose} open={true}>
            <div
                className={b({
                    ['lines-shapes']: paletteType === PaletteTypes.Lines,
                    ['other-shapes']: paletteType !== PaletteTypes.Lines,
                })}
            >
                <Dialog.Header
                    insertBefore={
                        <div className={b('title-icon')}>
                            <Icon data={Shapes4} size={18} />
                        </div>
                    }
                    caption={i18n('wizard', 'label_shapes-settings')}
                />
                <Dialog.Body>
                    {paletteType === PaletteTypes.Lines
                        ? linesShapesDialogBody
                        : otherShapesDialogBody}
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    showError={false}
                    onClickButtonCancel={onCancelButtonClick}
                    onClickButtonApply={onApplyButtonClick}
                    textButtonApply={i18n('wizard', 'button_apply')}
                    textButtonCancel={i18n('wizard', 'button_cancel')}
                >
                    <Button view="outlined" size="l" disabled={isResetDisabled} onClick={onReset}>
                        {i18n('wizard', 'button_reset')}
                    </Button>
                </Dialog.Footer>
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHAPES, React.memo(DialogShapes));
