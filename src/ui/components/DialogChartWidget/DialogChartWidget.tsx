import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {RealTheme} from '@gravity-ui/uikit';
import {
    Checkbox,
    Dialog,
    Divider,
    HelpMark,
    Link,
    Popup,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
    Text,
    TextInput,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {CustomCommands, Spec} from 'immutability-helper';
import update, {Context} from 'immutability-helper';
import omit from 'lodash/omit';
import type {
    DashTabItemWidget,
    DashTabItemWidgetTab,
    StringParams,
    WidgetKind,
    WidgetType,
    WizardVisualizationId,
} from 'shared';
import {
    CustomPaletteBgColors,
    DashCommonQa,
    DialogDashWidgetQA,
    DialogWidget,
    EntryScope,
    Feature,
    ParamsSettingsQA,
} from 'shared';
import {getEntryVisualizationType} from 'shared/schema/mix/helpers';
import {Collapse} from 'ui/components/Collapse/Collapse';
import {Interpolate} from 'ui/components/Interpolate';
import {TabMenu} from 'ui/components/TabMenu/TabMenu';
import type {UpdateState} from 'ui/components/TabMenu/types';
import {TabActionType} from 'ui/components/TabMenu/types';
import {DL, URL_OPTIONS} from 'ui/constants/common';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import type {ValuesType} from 'utility-types';

import {registry} from '../../registry';
import NavigationInput from '../../units/dash/components/NavigationInput/NavigationInput';
import {ParamsSettings} from '../../units/dash/components/ParamsSettings/ParamsSettings';
import {
    clearEmptyParams,
    removeParam,
    updateParamTitle,
    updateParamValue,
    validateParamTitle,
} from '../../units/dash/components/ParamsSettings/helpers';
import {PaletteBackground} from '../../units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';
import {isEntryTypeWithFiltering} from '../../units/dash/containers/Dialogs/utils';
import {DASH_WIDGET_TYPES, EntryTypeNode} from '../../units/dash/modules/constants';
import type {SetItemDataArgs} from '../../units/dash/store/actions/dashTyped';
import {useBackgroundColorSettings} from '../DialogTitleWidget/useColorSettings';

import './DialogChartWidget.scss';

const imm = new Context();

type AutoExtendCommand<T = object> = CustomCommands<{$auto: Spec<T>}>;

imm.extend('$auto', (value, object) => {
    return object ? update(object, value) : update({}, value);
});

const b = block('widget-item-dialog');

const isWidgetTypeWithAutoHeight = (widgetType?: WidgetKind) => {
    return (
        widgetType === DASH_WIDGET_TYPES.TABLE ||
        widgetType === DASH_WIDGET_TYPES.MARKDOWN ||
        widgetType === DASH_WIDGET_TYPES.METRIC ||
        widgetType === DASH_WIDGET_TYPES.MARKUP
    );
};

const TAB_TYPE = {
    TABS: 'tabs',
    SETTINGS: 'settings',
} as const;

type AfterSettingsWidgetCallback = ((selectedWidgetType: WidgetKind) => void) | null;

export interface DialogChartWidgetFeatureProps {
    withoutSidebar?: boolean;

    enableAutoheight?: boolean;
    enableBackgroundColor?: boolean;
    enableCustomBgColorSelector?: boolean;
    enableSeparateThemeColorSelector?: boolean;
    enableFilteringSetting?: boolean;
}
export interface DialogChartWidgetProps extends DialogChartWidgetFeatureProps {
    openedItemId: string | null;
    openedItemData: DashTabItemWidget['data'];
    dialogIsVisible: boolean;

    widgetType?: WidgetType;
    currentTabId: string | null;
    workbookId: string | null;
    navigationPath: string | null;
    widgetsCurrentTab: {
        [key: string]: string;
    };

    theme?: RealTheme;

    changeNavigationPath: (newNavigationPath: string) => void;
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
}

type DialogChartWidgetState = {
    hideTitle: boolean;
    prevVisible: boolean;
    error: boolean;
    data: DashTabItemWidget['data'];
    tabIndex: number;
    isManualTitle: boolean;
    selectedWidgetType?: WidgetKind;
    selectedEntryType?: WidgetType;

    // new params logic, local state for current tab params
    tabParams: StringParams;

    legacyChanged: number;
    visualizationType?: WizardVisualizationId;
    activeTab: ValuesType<typeof TAB_TYPE>;
};

const INPUT_FILTERING_ID = 'chartFilteringField';
const INPUT_NAME_ID = 'chartNameField';
const INPUT_TITLE_VISIBILITY_ID = 'chartTitleVisibilityField';
const INPUT_DESCRIPTION_ID = 'chartDescriptionField';
const INPUT_AUTOHEIGHT_ID = 'chartAutoheightField';
const INPUT_HINT_ID = 'chartHintField';

const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableCommonChartDashSettings);

const DEFAULT_OPENED_ITEM_DATA: DashTabItemWidget['data'] = {
    hideTitle: false,
    ...(isDashColorPickersByThemeEnabled
        ? {
              backgroundSettings: {
                  color: undefined,
              },
          }
        : {}),
    tabs: [
        {
            get title() {
                return i18n('dash.widget-dialog.edit', 'value_title-default', {index: 1});
            },
            isDefault: true,
            description: '',
            ...(isDashColorPickersByThemeEnabled
                ? {}
                : {
                      background: {
                          color: CustomPaletteBgColors.NONE,
                      },
                  }),
            enableHint: false,
            hint: '',
            enableDescription: false,
        },
    ],
} as DashTabItemWidget['data'];

// TODO: put in defaultPath navigation key from entry
function DialogChartWidget(props: DialogChartWidgetProps) {
    const {
        enableAutoheight = true,
        enableBackgroundColor = false,
        enableCustomBgColorSelector = false,
        enableSeparateThemeColorSelector = true,
        enableFilteringSetting = true,
        theme,
        openedItemData = DEFAULT_OPENED_ITEM_DATA,
        dialogIsVisible,
        widgetsCurrentTab,
        withoutSidebar,
        changeNavigationPath,
        workbookId,
        navigationPath,
        closeDialog,
        setItemData,
        openedItemId,
    } = props;
    const [state, setState] = React.useState<DialogChartWidgetState>({
        hideTitle: true,
        prevVisible: false,
        error: false,
        tabIndex: 0,
        data: openedItemData,
        isManualTitle: false,
        tabParams: {},
        legacyChanged: 0,
        activeTab: TAB_TYPE.TABS,
    });

    const couldChangeOldBg = enableCustomBgColorSelector;

    const {
        oldBackgroundColor,
        backgroundColorSettings,
        setOldBackgroundColor,
        setBackgroundColorSettings,
        resultedBackgroundSettings,
    } = useBackgroundColorSettings({
        background: couldChangeOldBg
            ? openedItemData.tabs[0]?.background
            : {color: CustomPaletteBgColors.LIKE_CHART},
        backgroundSettings: openedItemData.backgroundSettings,
        defaultOldColor: couldChangeOldBg
            ? CustomPaletteBgColors.NONE
            : CustomPaletteBgColors.LIKE_CHART,
        enableSeparateThemeColorSelector,
        isNewWidget: !props.openedItemData,
    });
    const [prevDialogIsVisible, setPrevDialogIsVisible] = React.useState<boolean | undefined>();

    React.useEffect(() => {
        if (dialogIsVisible === prevDialogIsVisible) {
            return;
        }
        setPrevDialogIsVisible(dialogIsVisible);
        let currentTab: string;
        let tabIndex = 0;
        if (openedItemId) {
            currentTab = widgetsCurrentTab[openedItemId];
            tabIndex = openedItemData.tabs.findIndex(({id}) => id === currentTab);
        }
        tabIndex = tabIndex === -1 ? 0 : tabIndex;

        setState((prevState) => ({
            ...prevState,
            hideTitle: openedItemData.tabs.length === 1 && openedItemData.hideTitle,
            prevVisible: dialogIsVisible,
            error: false,
            data: openedItemData,
            tabIndex,
            isManualTitle: Boolean(openedItemId),
            selectedWidgetType: undefined,
            selectedEntryType: undefined,
            // new params logic, local state for current tab params
            tabParams: openedItemData.tabs[tabIndex]?.params || {},
            legacyChanged: 0,
        }));
    }, [dialogIsVisible, prevDialogIsVisible, openedItemData, openedItemId, widgetsCurrentTab]);

    const navigationInputRef = React.useRef<HTMLDivElement>(null);
    const afterSettingSelectedWidgetTypeCallbackRef =
        React.useRef<AfterSettingsWidgetCallback>(null);

    const isEdit = Boolean(openedItemId);

    const handleUpdateField = React.useCallback(
        (field: keyof DashTabItemWidgetTab, value: string | boolean) => {
            setState((prevState) => ({
                ...prevState,
                data: update(prevState.data, {
                    tabs: {
                        [prevState.tabIndex]: {[field]: {$set: value}},
                    },
                }),
            }));
        },
        [],
    );

    const onApply = React.useCallback(
        (argState: DialogChartWidgetState, resultedBg: typeof resultedBackgroundSettings) => {
            const isValidateParamTitle = isEnabledFeature(
                Feature.DashBoardWidgetParamsStrictValidation,
            );

            const {
                data: {tabs},
                hideTitle,
                tabIndex,
                tabParams,
            } = argState;
            const tabWithoutChartIdIndex = tabs.findIndex(({chartId}) => !chartId);

            if (tabWithoutChartIdIndex === -1) {
                const newData = {
                    ...(resultedBg?.backgroundSettings
                        ? {backgroundSettings: resultedBg.backgroundSettings}
                        : {}),

                    hideTitle: tabs.length === 1 && hideTitle,
                    tabs: tabs.map(({title, params, ...rest}, index) => {
                        let resultTabParams =
                            index === tabIndex ? clearEmptyParams(tabParams) : params;
                        if (isValidateParamTitle) {
                            resultTabParams = Object.entries(resultTabParams).reduce<StringParams>(
                                (accParams, [paramTitle, paramValue]) => {
                                    if (validateParamTitle(paramTitle) === null) {
                                        accParams[paramTitle] = paramValue;
                                    }
                                    return accParams;
                                },
                                {},
                            );
                        }

                        const tab = {
                            title:
                                title.trim() ||
                                i18n('dash.widget-dialog.edit', 'value_title-default', {
                                    index: index + 1,
                                }),
                            params: resultTabParams,
                            ...rest,
                            ...(resultedBg?.background ? {background: resultedBg.background} : {}),
                        };
                        return tab;
                    }),
                };

                setItemData({data: newData});

                closeDialog();
            } else {
                setState((prevState) => ({
                    ...prevState,
                    error: true,
                    tabIndex: tabWithoutChartIdIndex,
                }));
            }
        },
        [setItemData, closeDialog],
    );

    const onAddWidget = React.useCallback(
        ({entryId, name, params = {}}: {entryId: string; name: string; params: StringParams}) => {
            const filteredParams = omit(params, [URL_OPTIONS.EMBEDDED, URL_OPTIONS.NO_CONTROLS]);

            setState((prevState) => {
                const {data, tabIndex, isManualTitle, tabParams, legacyChanged} = prevState;
                const newTabParams = imm.update<
                    {tabParams: StringParams},
                    AutoExtendCommand<StringParams>
                >({tabParams}, {tabParams: {$auto: {$merge: filteredParams}}}).tabParams;

                if (isManualTitle) {
                    return {
                        ...prevState,
                        data: imm.update<
                            DialogChartWidgetState['data'],
                            AutoExtendCommand<DialogChartWidgetState['data']['tabs']>
                        >(data, {
                            tabs: {
                                [tabIndex]: {
                                    chartId: {$set: entryId},
                                    params: {$auto: {$merge: filteredParams}},
                                    autoHeight: {$set: false},
                                },
                            },
                        }),
                        tabParams: newTabParams,
                        legacyChanged: legacyChanged + 1,
                    };
                } else {
                    return {
                        ...prevState,
                        data: imm.update<
                            DialogChartWidgetState['data'],
                            AutoExtendCommand<DialogChartWidgetState['data']['tabs']>
                        >(data, {
                            tabs: {
                                [tabIndex]: {
                                    title: {$set: name},
                                    chartId: {$set: entryId},
                                    params: {$auto: {$merge: filteredParams}},
                                    autoHeight: {$set: false},
                                },
                            },
                        }),
                        tabParams: newTabParams,
                        legacyChanged: legacyChanged + 1,
                    };
                }
            });

            afterSettingSelectedWidgetTypeCallbackRef.current = (selectedWidgetType) => {
                setState((prevState) => ({
                    ...prevState,
                    data: update(prevState.data, {
                        tabs: {
                            [prevState.tabIndex]: {
                                autoHeight: {
                                    $set:
                                        enableAutoheight &&
                                        selectedWidgetType === DASH_WIDGET_TYPES.METRIC,
                                },
                            },
                        },
                    }),
                }));
            };
        },
        [enableAutoheight],
    );

    const onVisibilityCheckboxToggle = React.useCallback(() => {
        setState((prevState) => ({...prevState, hideTitle: !prevState.hideTitle}));
    }, []);

    const isAutoHeightOnCurrentTab = Boolean(state.data.tabs[state.tabIndex].autoHeight);
    const onAutoHeightRadioButtonChange = React.useCallback(() => {
        handleUpdateField('autoHeight', !isAutoHeightOnCurrentTab);
    }, [handleUpdateField, isAutoHeightOnCurrentTab]);

    const handleUpdateEnableDesc = React.useCallback(
        (val: boolean) => {
            handleUpdateField('enableDescription', val);
        },
        [handleUpdateField],
    );

    const handleUpdateEnableHint = React.useCallback(
        (val: boolean) => {
            handleUpdateField('enableHint', val);
        },
        [handleUpdateField],
    );

    const handleUpdateDescription = React.useCallback(
        (val: string) => {
            handleUpdateField('description', val);
        },
        [handleUpdateField],
    );

    const handleUpdateHint = React.useCallback(
        (val: string) => {
            handleUpdateField('hint', val);
        },
        [handleUpdateField],
    );

    const isEnabledFilteringOnCurrentTab = Boolean(
        state.data.tabs[state.tabIndex].enableActionParams,
    );
    const handleChangeFiltering = React.useCallback(() => {
        handleUpdateField('enableActionParams', !isEnabledFilteringOnCurrentTab);
    }, [handleUpdateField, isEnabledFilteringOnCurrentTab]);

    const updateTabMenu = React.useCallback(
        ({items, selectedItemIndex, action}: UpdateState<DashTabItemWidgetTab>) => {
            if (action === TabActionType.Skipped) {
                return;
            }

            const isNeedSaveParams =
                action === TabActionType.ChangeChosen || action === TabActionType.Add;

            setState((prevState) => {
                const {tabIndex, tabParams} = prevState;

                const itemsWithParams: UpdateState<DashTabItemWidgetTab>['items'] = items.map(
                    (item, index) => {
                        // fill empty description for correct work of TextArea
                        const description = item.description || '';

                        return isNeedSaveParams && index === tabIndex
                            ? {
                                  ...item,
                                  params: tabParams,
                                  description,
                              }
                            : {...item, description};
                    },
                );

                return {
                    ...prevState,
                    data: update(prevState.data, {tabs: {$set: itemsWithParams}}),
                    tabIndex: selectedItemIndex,
                    error: false,
                    isManualTitle: action === TabActionType.Add ? false : isEdit,
                    tabParams: items[selectedItemIndex].params || {},
                    legacyChanged: 0,
                };
            });
        },
        [isEdit],
    );

    const handleEditParamTitle = React.useCallback((paramTitleOld: string, paramTitle: string) => {
        setState((prevState) => ({
            ...prevState,
            tabParams: updateParamTitle(prevState.tabParams, paramTitleOld, paramTitle),
        }));
    }, []);

    const handleEditParamValue = React.useCallback((paramTitle: string, paramValue: string[]) => {
        setState((prevState) => ({
            ...prevState,
            tabParams: updateParamValue(prevState.tabParams, paramTitle, paramValue),
        }));
    }, []);

    const handleRemoveParam = React.useCallback((paramTitle: string) => {
        setState((prevState) => ({
            ...prevState,
            tabParams: removeParam(prevState.tabParams, paramTitle),
        }));
    }, []);

    const handleRemoveAllParams = React.useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            tabParams: {},
        }));
    }, []);

    const handleSetSelectedWidgetType = React.useCallback(
        ({
            selectedWidgetType,
            entryMeta,
        }: {
            selectedWidgetType: WidgetKind;
            entryMeta: {type: WidgetType};
        }) => {
            const visualizationType = getEntryVisualizationType(entryMeta);
            setState((prevState) => ({
                ...prevState,
                selectedWidgetType,
                selectedEntryType: entryMeta.type,
                visualizationType,
            }));

            if (afterSettingSelectedWidgetTypeCallbackRef.current) {
                afterSettingSelectedWidgetTypeCallbackRef.current(selectedWidgetType);
                afterSettingSelectedWidgetTypeCallbackRef.current = null;
            }
        },
        [],
    );

    const renderFilteringCharts = () => {
        const {data, tabIndex, selectedEntryType, visualizationType} = state;
        const canUseFiltration = isEntryTypeWithFiltering(selectedEntryType, visualizationType);
        const enableActionParams = Boolean(
            canUseFiltration && data.tabs[tabIndex].enableActionParams,
        );

        const helpPopover = (
            <HelpMark className={b('help-tooltip')}>
                {i18n('dash.widget-dialog.edit', 'context_filtering-other-charts')}
                {DL.ENDPOINTS.datalensDocs ? (
                    <p className={b('info-comment')}>
                        <Interpolate
                            text={i18n(
                                'dash.widget-dialog.edit',
                                'context_filtering-usage-limitations',
                            )}
                            matches={{
                                link(match) {
                                    return (
                                        <Link
                                            target="_blank"
                                            href={`${DL.ENDPOINTS.datalensDocs}/dashboard/chart-chart-filtration#using`}
                                        >
                                            {match}
                                        </Link>
                                    );
                                },
                            }}
                        />
                    </p>
                ) : null}
            </HelpMark>
        );

        return (
            <FormRow
                className={b('row')}
                fieldId={INPUT_FILTERING_ID}
                label={i18n('dash.widget-dialog.edit', 'label_filtering-other-charts')}
                labelHelpPopover={helpPopover}
            >
                <div>
                    <Checkbox
                        className={b('checkbox')}
                        id={INPUT_FILTERING_ID}
                        size="m"
                        onChange={handleChangeFiltering}
                        checked={enableActionParams}
                        disabled={!canUseFiltration}
                    />
                </div>
            </FormRow>
        );
    };

    const renderTabSettingsContent = () => {
        const {data, tabIndex, selectedWidgetType, tabParams, legacyChanged} = state;

        const autoHeightHelpPopover = (
            <HelpMark className={b('help-tooltip')}>
                {i18n('dash.widget-dialog.edit', 'context_autoheight-availability-hint')}
            </HelpMark>
        );

        const {title, chartId, description, autoHeight, hint, enableHint, enableDescription} =
            data.tabs[tabIndex];

        const hasDesc =
            enableDescription === undefined ? Boolean(description) : Boolean(enableDescription);

        const {MarkdownControl} = registry.common.components.getAll();

        return (
            <div className={b('content-wrapper')}>
                <div className={b('content')}>
                    <div className={b('section')}>
                        <Text className={b('section-title')}>
                            {i18n('dash.widget-dialog.edit', 'section_common')}
                        </Text>
                        <FormRow
                            className={b('row')}
                            fieldId={INPUT_NAME_ID}
                            label={i18n('dash.widget-dialog.edit', 'field_title')}
                        >
                            <TextInput
                                id={INPUT_NAME_ID}
                                size="m"
                                className={b('input')}
                                placeholder={i18n('dash.widget-dialog.edit', 'context_fill-title')}
                                value={title}
                                onUpdate={(value) =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        isManualTitle: true,
                                        data: update(prevState.data, {
                                            tabs: {
                                                [prevState.tabIndex]: {
                                                    title: {$set: value},
                                                },
                                            },
                                        }),
                                    }))
                                }
                            />
                        </FormRow>
                        <FormRow
                            className={b('row', {type: 'line-widget'})}
                            label={i18n('dash.widget-dialog.edit', 'field_widget')}
                        >
                            <div
                                className={b('navigation-input-container')}
                                ref={navigationInputRef}
                            >
                                <NavigationInput
                                    entryId={chartId}
                                    onChange={onAddWidget}
                                    excludeClickableType={EntryTypeNode.CONTROL_NODE}
                                    onUpdate={handleSetSelectedWidgetType}
                                    scope={EntryScope.Widget}
                                    workbookId={workbookId}
                                    navigationPath={navigationPath}
                                    changeNavigationPath={changeNavigationPath}
                                    navigationMixin={b('navigation-input-row')}
                                    linkMixin={b('navigation-input-row')}
                                />
                            </div>
                            <Popup
                                anchorElement={navigationInputRef.current}
                                open={state.error}
                                placement="left-start"
                                hasArrow={true}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        setState((prevState) => ({...prevState, error: false}));
                                    }
                                }}
                            >
                                <div className={b('error')}>
                                    {i18n('dash.widget-dialog.edit', 'toast_required-field')}
                                </div>
                            </Popup>
                        </FormRow>
                        {enableFilteringSetting && renderFilteringCharts()}
                    </div>
                    <div className={b('section')}>
                        <Text className={b('section-title')}>
                            {i18n('dash.widget-dialog.edit', 'section_appearance')}
                        </Text>
                        {data.tabs.length === 1 && (
                            <FormRow
                                className={b('row')}
                                fieldId={INPUT_TITLE_VISIBILITY_ID}
                                label={i18n('dash.widget-dialog.edit', 'field_title')}
                            >
                                <Checkbox
                                    className={b('checkbox')}
                                    size="m"
                                    onChange={onVisibilityCheckboxToggle}
                                    checked={!state.hideTitle}
                                    id={INPUT_TITLE_VISIBILITY_ID}
                                    qa={DashCommonQa.WidgetShowTitleCheckbox}
                                />
                            </FormRow>
                        )}
                        <FormRow
                            className={b('row')}
                            fieldId={INPUT_DESCRIPTION_ID}
                            label={i18n('dash.widget-dialog.edit', 'field_description')}
                        >
                            <div className={b('settings-container')}>
                                <Checkbox
                                    onUpdate={handleUpdateEnableDesc}
                                    checked={hasDesc}
                                    size="m"
                                    className={b('checkbox')}
                                />
                                {hasDesc && (
                                    <MarkdownControl
                                        className={b('markdown-control')}
                                        key={`md-desc-tab-${tabIndex}`}
                                        value={description || ''}
                                        onChange={handleUpdateDescription}
                                        disabled={!enableDescription}
                                        enableExtensions={true}
                                    />
                                )}
                            </div>
                        </FormRow>
                        <FormRow
                            className={b('row')}
                            fieldId={INPUT_HINT_ID}
                            label={i18n('dash.widget-dialog.edit', 'field_hint')}
                            labelHelpPopover={
                                <HelpMark className={b('help-tooltip')}>
                                    {i18n('dash.widget-dialog.edit', 'context_hint-display-info')}
                                </HelpMark>
                            }
                        >
                            <div className={b('settings-container')}>
                                <Checkbox
                                    onUpdate={handleUpdateEnableHint}
                                    checked={Boolean(enableHint)}
                                    size="m"
                                    className={b('checkbox')}
                                />
                                {Boolean(enableHint) && (
                                    <MarkdownControl
                                        className={b('markdown-control')}
                                        key={`md-hint-tab-${tabIndex}`}
                                        value={hint || ''}
                                        onChange={handleUpdateHint}
                                        disabled={!enableHint}
                                    />
                                )}
                            </div>
                        </FormRow>
                        {enableAutoheight && (
                            <FormRow
                                className={b('row')}
                                fieldId={INPUT_AUTOHEIGHT_ID}
                                label={i18n('dash.widget-dialog.edit', 'field_autoheight')}
                                labelHelpPopover={autoHeightHelpPopover}
                            >
                                <Checkbox
                                    className={b('checkbox')}
                                    id={INPUT_AUTOHEIGHT_ID}
                                    size="m"
                                    onChange={onAutoHeightRadioButtonChange}
                                    disabled={!isWidgetTypeWithAutoHeight(selectedWidgetType)}
                                    checked={Boolean(autoHeight)}
                                    qa={DashCommonQa.WidgetEnableAutoHeightCheckbox}
                                />
                            </FormRow>
                        )}
                        {enableBackgroundColor && (
                            <FormRow
                                className={b('row')}
                                label={
                                    <div className={b('caption')}>
                                        <span className={b('caption-text')}>
                                            {i18n('dash.widget-dialog.edit', 'field_background')}
                                        </span>
                                    </div>
                                }
                            >
                                <PaletteBackground
                                    theme={theme}
                                    oldColor={oldBackgroundColor}
                                    onSelectOldColor={setOldBackgroundColor}
                                    color={backgroundColorSettings}
                                    onSelect={setBackgroundColorSettings}
                                    enableCustomBgColorSelector={enableCustomBgColorSelector}
                                    enableSeparateThemeColorSelector={
                                        enableSeparateThemeColorSelector
                                    }
                                />
                            </FormRow>
                        )}
                    </div>
                    <ParamsSection
                        tabIndex={tabIndex}
                        legacyChanged={legacyChanged}
                        tabParams={tabParams}
                        handleEditParamTitle={handleEditParamTitle}
                        handleEditParamValue={handleEditParamValue}
                        handleRemoveParam={handleRemoveParam}
                        handleRemoveAllParams={handleRemoveAllParams}
                    />
                </div>
            </div>
        );
    };

    const shouldRenderTabs = false;
    // isEnabledFeature(Feature.EnableCommonChartDashSettings) && !withoutSidebar;
    const tabsTabContent = (
        <div className={b('tab-content', {'with-sidebar': !withoutSidebar})}>
            {!withoutSidebar && (
                <React.Fragment>
                    <TabMenu
                        className={b('sidebar')}
                        items={state.data.tabs}
                        selectedItemIndex={state.tabIndex}
                        onUpdate={updateTabMenu}
                    />
                    <Divider orientation="vertical" className={b('divider')} />
                </React.Fragment>
            )}
            {renderTabSettingsContent()}
        </div>
    );

    return (
        <Dialog
            size={withoutSidebar ? 'm' : 'l'}
            open={dialogIsVisible}
            onClose={closeDialog}
            className={b()}
            disableEscapeKeyDown
            disableHeightTransition
            qa={DialogWidget.ChartWidget}
        >
            <Dialog.Header caption={i18n('dash.widget-dialog.edit', 'label_widget')} />
            <Dialog.Body className={b('body')}>
                {shouldRenderTabs ? (
                    <TabProvider
                        value={TAB_TYPE.TABS}
                        // onUpdate={(value) => this.setState({activeTab: value})}
                    >
                        <TabList className={b('tab-list')}>
                            <Tab value={TAB_TYPE.TABS}>
                                {i18n('dash.widget-dialog.edit', 'tab_tabs')}
                            </Tab>
                            <Tab value={TAB_TYPE.SETTINGS}>
                                {i18n('dash.widget-dialog.edit', 'tab_settings')}
                            </Tab>
                        </TabList>
                        <TabPanel value={TAB_TYPE.TABS} className={b('tab-panel')}>
                            {tabsTabContent}
                        </TabPanel>
                        <TabPanel value={TAB_TYPE.SETTINGS} className={b('tab-panel')}>
                            <div className={b('tab-content')}>{tabsTabContent}</div>
                        </TabPanel>
                    </TabProvider>
                ) : (
                    tabsTabContent
                )}
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={closeDialog}
                onClickButtonApply={() => onApply(state, resultedBackgroundSettings)}
                textButtonApply={
                    isEdit
                        ? i18n('dash.widget-dialog.edit', 'button_save')
                        : i18n('dash.widget-dialog.edit', 'button_add')
                }
                textButtonCancel={i18n('dash.widget-dialog.edit', 'button_cancel')}
                propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
            />
        </Dialog>
    );
}

function ParamsSection({
    tabIndex,
    legacyChanged,
    tabParams,
    handleEditParamTitle,
    handleEditParamValue,
    handleRemoveParam,
    handleRemoveAllParams,
}: {
    tabIndex: number;
    legacyChanged: number;
    tabParams: StringParams;
    handleEditParamTitle: (paramTitleOld: string, paramTitle: string) => void;
    handleEditParamValue: (paramTitle: string, paramValue: string[]) => void;
    handleRemoveParam: (paramTitle: string) => void;
    handleRemoveAllParams: () => void;
}) {
    const isValidateParamTitle = isEnabledFeature(Feature.DashBoardWidgetParamsStrictValidation);

    let paramValidator;
    if (isValidateParamTitle) {
        paramValidator = (paramTitle: string) => {
            const errorCode = validateParamTitle(paramTitle);

            if (errorCode) {
                return new Error(i18n('dash.params-button-dialog.view', `context_${errorCode}`));
            }

            return null;
        };
    }

    return (
        <Collapse
            className={b('params-collapse', null, b('section'))}
            title={
                <Text variant="subheader-2">{i18n('dash.widget-dialog.edit', 'field_params')}</Text>
            }
            titleSize="m"
            arrowPosition="right"
            arrowQa={ParamsSettingsQA.Open}
            headerClassName={b('section-title')}
        >
            <ParamsSettings
                tagLabelClassName={b('tag-label')}
                data={tabParams}
                group={tabIndex + legacyChanged}
                onEditParamTitle={handleEditParamTitle}
                onEditParamValue={handleEditParamValue}
                onRemoveParam={handleRemoveParam}
                onRemoveAllParams={handleRemoveAllParams}
                validator={{title: paramValidator}}
            />
        </Collapse>
    );
}

export default DialogChartWidget;
