import React from 'react';

import {Shapes4} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Tab, TabList, TabPanel, TabProvider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import type {
    DatasetOptions,
    Field,
    FilterField,
    LineShapeSettings,
    ShapesConfig,
    Update,
} from 'shared';

import {CommonSettings} from './components/CommonSettings/CommonSettings';
import {LineSettings} from './components/LineSettings/LineSettings';
import {DEFAULT_COMMON_LINE_SETTINGS, DIALOG_LINE_SHAPES_TABS} from './constants';
import {i18n} from './i18n';
import type {ShapesState} from './types';

import './DialogLineShapes.scss';

export const DIALOG_LINE_SHAPES = Symbol('DIALOG_LINE_SHAPES');

const b = block('dialog-line-shapes');

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
    onClose: () => void;
    shapesConfig: ShapesConfig;
};

export type OpenDialogLineShapesArgs = {
    id: typeof DIALOG_LINE_SHAPES;
    props: Props;
};

const DialogLineShapes = ({
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
    onClose,
}: Props) => {
    const [activeTab, setActiveTab] = React.useState<string>(DIALOG_LINE_SHAPES_TABS.LineSettings);
    const [shapesState, setShapesState] = React.useState<ShapesState>({
        selected: null,
        mountedShapes:
            shapesConfig.mountedShapes && Object.keys(shapesConfig.mountedShapes)
                ? shapesConfig.mountedShapes
                : {},
        lineSettings: shapesConfig.lineSettings ?? {},
        commonLineSettings: {...DEFAULT_COMMON_LINE_SETTINGS, ...shapesConfig.commonLineSettings},
    });

    const hasChanges = React.useMemo(() => {
        return (
            !isEmpty(shapesState.mountedShapes) ||
            !isEmpty(shapesState.lineSettings) ||
            !isEqual(shapesState.commonLineSettings, DEFAULT_COMMON_LINE_SETTINGS)
        );
    }, [shapesState]);

    const onReset = React.useCallback(() => {
        setShapesState((prevState) => ({
            ...prevState,
            mountedShapes: {},
            lineSettings: {},
            commonLineSettings: {...DEFAULT_COMMON_LINE_SETTINGS},
        }));
    }, []);

    const onApplyButtonClick = React.useCallback(() => {
        onApply({
            mountedShapes: shapesState.mountedShapes,
            fieldGuid: item.guid,
            lineSettings: shapesState.lineSettings,
            commonLineSettings: shapesState.commonLineSettings,
        });
    }, [item.guid, onApply, shapesState]);

    const handleUpdateCommonSettings = React.useCallback(
        (value: LineShapeSettings) => {
            setShapesState({...shapesState, commonLineSettings: value});
        },
        [shapesState],
    );

    const handleUpdateLinesSettings = React.useCallback((value: ShapesState) => {
        setShapesState(value);
    }, []);

    return (
        <Dialog onClose={onClose} open={true}>
            <div className={b()}>
                <Dialog.Header
                    insertBefore={
                        <div className={b('title-icon')}>
                            <Icon data={Shapes4} size={18} />
                        </div>
                    }
                    caption={i18n('label_shapes-settings')}
                />
                <Dialog.Body>
                    <TabProvider
                        value={activeTab}
                        onUpdate={(value) => {
                            setActiveTab(value);
                        }}
                    >
                        <TabList className={b('tab-list')}>
                            <Tab value={DIALOG_LINE_SHAPES_TABS.LineSettings}>
                                {i18n('label_mounted-line-settings')}
                            </Tab>
                            <Tab value={DIALOG_LINE_SHAPES_TABS.CommonSettings}>
                                {i18n('label_common-line-settings')}
                            </Tab>
                        </TabList>
                        <React.Fragment>
                            <TabPanel
                                value={DIALOG_LINE_SHAPES_TABS.LineSettings}
                                className={b('tab-panel')}
                            >
                                <LineSettings
                                    item={item}
                                    items={items}
                                    distincts={distincts}
                                    options={options}
                                    datasetId={datasetId}
                                    filters={filters}
                                    parameters={parameters}
                                    dashboardParameters={dashboardParameters}
                                    updates={updates}
                                    value={shapesState}
                                    onChange={handleUpdateLinesSettings}
                                />
                            </TabPanel>
                            <TabPanel
                                className={b('tab-panel')}
                                value={DIALOG_LINE_SHAPES_TABS.CommonSettings}
                            >
                                <CommonSettings
                                    value={shapesState.commonLineSettings}
                                    onChange={handleUpdateCommonSettings}
                                />
                            </TabPanel>
                        </React.Fragment>
                    </TabProvider>
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    showError={false}
                    onClickButtonCancel={onClose}
                    onClickButtonApply={onApplyButtonClick}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                >
                    <Button view="outlined" size="l" disabled={!hasChanges} onClick={onReset}>
                        {i18n('button_reset')}
                    </Button>
                </Dialog.Footer>
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_LINE_SHAPES, React.memo(DialogLineShapes));
