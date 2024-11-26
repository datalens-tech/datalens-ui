import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Checkbox, Dialog, Link, Popup, TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {CustomCommands, Spec} from 'immutability-helper';
import update, {Context} from 'immutability-helper';
import type {
    DashTabItemWidget,
    DashTabItemWidgetTab,
    HierarchyField,
    StringParams,
    WidgetKind,
    WidgetType,
    WizardVisualizationId,
} from 'shared';
import {DashCommonQa, DialogDashWidgetQA, EntryScope, Feature, ParamsSettingsQA} from 'shared';
import {getEntryHierarchy, getEntryVisualizationType} from 'shared/schema/mix/helpers';
import {Collapse} from 'ui/components/Collapse/Collapse';
import {Interpolate} from 'ui/components/Interpolate';
import {DL} from 'ui/constants/common';

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
import Utils from '../../utils';
import TwoColumnDialog from '../ControlComponents/TwoColumnDialog/TwoColumnDialog';

import {TabMenu} from './TabMenu/TabMenu';
import type {UpdateState} from './TabMenu/types';
import {TabActionType} from './TabMenu/types';

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

type LineProps = {
    className?: string;
    caption: React.ReactNode;
    children?: React.ReactNode;
};

function Line(props: LineProps) {
    return (
        <div className={b('line', props.className)}>
            <div className={b('line-caption')}>{props.caption}</div>
            <div className={b('line-content')}>{props.children}</div>
        </div>
    );
}

type AfterSettingsWidgetCallback = ((selectedWidgetType: WidgetKind) => void) | null;

export interface DialogChartWidgetFeatureProps {
    withoutSidebar?: boolean;

    enableAutoheight?: boolean;
    enableBackgroundColor?: boolean;
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
    hierarchies?: HierarchyField[];
};

// TODO: put in defaultPath navigation key from entry
class DialogChartWidget extends React.PureComponent<
    DialogChartWidgetProps,
    DialogChartWidgetState
> {
    static defaultProps = {
        enableAutoheight: true,
        enableBackgroundColor: false,
        enableFilteringSetting: true,
        openedItemData: {
            hideTitle: false,
            tabs: [
                {
                    get title() {
                        return i18n('dash.widget-dialog.edit', 'value_title-default', {index: 1});
                    },
                    isDefault: true,
                    description: '',
                    background: {
                        enabled: false,
                        color: 'transparent',
                    },
                },
            ],
        } as DashTabItemWidget['data'],
    };

    static getDerivedStateFromProps(
        nextProps: DialogChartWidgetProps,
        prevState: DialogChartWidgetState,
    ) {
        if (nextProps.dialogIsVisible === prevState.prevVisible) {
            return null;
        }

        let currentTab: string;
        let tabIndex = 0;
        if (nextProps.openedItemId) {
            currentTab = nextProps.widgetsCurrentTab[nextProps.openedItemId];
            tabIndex = nextProps.openedItemData.tabs.findIndex(({id}) => id === currentTab);
        }
        tabIndex = tabIndex === -1 ? 0 : tabIndex;

        return {
            hideTitle:
                nextProps.openedItemData.tabs.length === 1 && nextProps.openedItemData.hideTitle,
            prevVisible: nextProps.dialogIsVisible,
            error: false,
            data: nextProps.openedItemData,
            tabIndex,
            isManualTitle: Boolean(nextProps.openedItemId),
            selectedWidgetType: null,
            selectedEntryType: null,
            // new params logic, local state for current tab params
            tabParams: nextProps.openedItemData.tabs[tabIndex]?.params || {},
            legacyChanged: 0,
        };
    }

    state: DialogChartWidgetState = {
        hideTitle: true,
        prevVisible: false,
        error: false,
        tabIndex: 0,
        data: DialogChartWidget.defaultProps.openedItemData,
        isManualTitle: false,
        tabParams: {},
        legacyChanged: 0,
    };

    private navigationInputRef = React.createRef<HTMLDivElement>();
    private afterSettingSelectedWidgetTypeCallback: AfterSettingsWidgetCallback = null;

    render() {
        const {dialogIsVisible, withoutSidebar, closeDialog} = this.props;

        const sidebar = this.renderDialogSidebar();
        const footer = this.renderDialogFooter();
        const content = this.renderDialogBody();

        return (
            <TwoColumnDialog
                className={b({long: true, 'without-sidebar': withoutSidebar})}
                open={dialogIsVisible}
                onClose={closeDialog}
                sidebarHeader={i18n('dash.widget-dialog.edit', 'label_widget')}
                sidebar={sidebar}
                body={content}
                footer={footer}
                sidebarClassMixin={b('dialog-sidebar')}
                contentClassMixin={b('content')}
                bodyClassMixin={b('content-body')}
                disableFocusTrap={true}
                disableEscapeKeyDown={true}
                withoutSidebar={withoutSidebar}
            />
        );
    }

    get isEdit() {
        return Boolean(this.props.openedItemId);
    }

    onApply = () => {
        const isValidateParamTitle = Utils.isEnabledFeature(
            Feature.DashBoardWidgetParamsStrictValidation,
        );

        const {tabs} = this.state.data;
        const tabIndex = tabs.findIndex(({chartId}) => !chartId);

        if (tabIndex === -1) {
            const newData = {
                hideTitle: tabs.length === 1 && this.state.hideTitle,
                tabs: tabs.map(({title, params, ...rest}, index) => {
                    let tabParams =
                        index === this.state.tabIndex
                            ? clearEmptyParams(this.state.tabParams)
                            : params;
                    if (isValidateParamTitle) {
                        tabParams = Object.entries(tabParams).reduce<StringParams>(
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
                        params: tabParams,
                        ...rest,
                    };
                    return tab;
                }),
            };

            this.props.setItemData({data: newData});

            this.props.closeDialog();
        } else {
            this.setState({
                error: true,
                tabIndex,
            });
        }
    };

    onAddWidget = ({
        entryId,
        name,
        params = {},
    }: {
        entryId: string;
        name: string;
        params: StringParams;
    }) => {
        const {enableAutoheight} = this.props;
        const {data, tabIndex, isManualTitle, tabParams, legacyChanged} = this.state;

        const newTabParams = imm.update<{tabParams: StringParams}, AutoExtendCommand<StringParams>>(
            {tabParams},
            {tabParams: {$auto: {$merge: params}}},
        ).tabParams;

        if (isManualTitle) {
            this.setState({
                data: imm.update<
                    DialogChartWidgetState['data'],
                    AutoExtendCommand<DialogChartWidgetState['data']['tabs']>
                >(data, {
                    tabs: {
                        [tabIndex]: {
                            chartId: {$set: entryId},
                            params: {$auto: {$merge: params}},
                            autoHeight: {$set: false},
                        },
                    },
                }),
                tabParams: newTabParams,
                legacyChanged: legacyChanged + 1,
            });
        } else {
            this.setState({
                data: imm.update<
                    DialogChartWidgetState['data'],
                    AutoExtendCommand<DialogChartWidgetState['data']['tabs']>
                >(data, {
                    tabs: {
                        [tabIndex]: {
                            title: {$set: name},
                            chartId: {$set: entryId},
                            params: {$auto: {$merge: params}},
                            autoHeight: {$set: false},
                        },
                    },
                }),
                tabParams: newTabParams,
                legacyChanged: legacyChanged + 1,
            });
        }

        this.afterSettingSelectedWidgetTypeCallback = (selectedWidgetType) => {
            this.setState({
                data: update(this.state.data, {
                    tabs: {
                        [tabIndex]: {
                            autoHeight: {
                                $set:
                                    enableAutoheight &&
                                    selectedWidgetType === DASH_WIDGET_TYPES.METRIC,
                            },
                        },
                    },
                }),
            });
        };
    };

    onVisibilityCheckboxToggle = () => {
        this.setState((state) => ({hideTitle: !state.hideTitle}));
    };

    onAutoHeightRadioButtonChange = () => {
        const {data, tabIndex} = this.state;
        const currentCondition = this.state.data.tabs[tabIndex].autoHeight;

        this.setState({
            data: update(data, {
                tabs: {
                    [tabIndex]: {autoHeight: {$set: !currentCondition}},
                },
            }),
        });
    };

    handleBackgroundEnabledChanged = () => {
        const {data, tabIndex} = this.state;

        if (!data.tabs[tabIndex].background) {
            data.tabs[tabIndex].background = {
                enabled: false,
                color: 'transparent',
            };
        }

        this.setState({
            data: update(data, {
                tabs: {
                    [tabIndex]: {
                        background: {
                            enabled: {$set: !data.tabs[tabIndex].background?.enabled},
                        },
                    },
                },
            }),
        });
    };

    handleBackgroundColorSelected = (color: string) => {
        const {data, tabIndex} = this.state;

        this.setState({
            data: update(data, {
                tabs: {
                    [tabIndex]: {
                        background: {
                            color: {$set: color},
                        },
                    },
                },
            }),
        });
    };

    handleChangeFiltering = () => {
        const {data, tabIndex} = this.state;
        const currentCondition = this.state.data.tabs[tabIndex].enableActionParams;

        this.setState({
            data: update(data, {
                tabs: {
                    [tabIndex]: {enableActionParams: {$set: !currentCondition}},
                },
            }),
        });
    };

    updateTabMenu = ({items, selectedItemIndex, action}: UpdateState<DashTabItemWidgetTab>) => {
        const {data, tabIndex, tabParams} = this.state;

        if (action === TabActionType.Skipped) {
            return;
        }

        const isNeedSaveParams =
            action === TabActionType.ChangeChosen || action === TabActionType.Add;

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

        this.setState({
            data: update(data, {tabs: {$set: itemsWithParams}}),
            tabIndex: selectedItemIndex,
            error: false,
            isManualTitle: action === TabActionType.Add ? false : this.isEdit,
            tabParams: items[selectedItemIndex].params || {},
            legacyChanged: 0,
        });
    };

    handleEditParamTitle = (paramTitleOld: string, paramTitle: string) => {
        this.setState({
            tabParams: updateParamTitle(this.state.tabParams, paramTitleOld, paramTitle),
        });
    };

    handleEditParamValue = (paramTitle: string, paramValue: string[]) => {
        this.setState({
            tabParams: updateParamValue(this.state.tabParams, paramTitle, paramValue),
        });
    };

    handleRemoveParam = (paramTitle: string) => {
        this.setState({
            tabParams: removeParam(this.state.tabParams, paramTitle),
        });
    };

    handleRemoveAllParams = () => {
        this.setState({
            tabParams: {},
        });
    };

    setSelectedWidgetType = ({
        selectedWidgetType,
        entryMeta,
    }: {
        selectedWidgetType: WidgetKind;
        entryMeta: {type: WidgetType};
    }) => {
        const visualizationType = getEntryVisualizationType(entryMeta);
        const hierarchies = getEntryHierarchy(entryMeta);
        this.setState({
            selectedWidgetType,
            selectedEntryType: entryMeta.type,
            visualizationType,
            hierarchies,
        });

        if (this.afterSettingSelectedWidgetTypeCallback) {
            this.afterSettingSelectedWidgetTypeCallback(selectedWidgetType);
            this.afterSettingSelectedWidgetTypeCallback = null;
        }
    };

    renderDialogSidebar = () => {
        const {data, tabIndex} = this.state;

        return (
            <div className={b('main')}>
                <div className={b('sidebar')}>
                    <TabMenu
                        items={data.tabs}
                        selectedItemIndex={tabIndex}
                        onUpdate={this.updateTabMenu}
                        tabIconMixin={b('add-icon')}
                    />
                </div>
            </div>
        );
    };

    getHierarchyWarning = () => {
        const {hierarchies} = this.state;
        const showFilterHierarchyWarning = Boolean(hierarchies?.length) ?? false;

        if (!showFilterHierarchyWarning || !DL.ENDPOINTS.datalensDocs) {
            return null;
        }

        return (
            <p className={b('info-comment')}>
                <Interpolate
                    text={i18n('dash.widget-dialog.edit', 'context_filtering-usage-limitations')}
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
        );
    };

    renderFilteringCharts = () => {
        const {data, tabIndex, selectedEntryType, visualizationType} = this.state;
        const canUseFiltration = isEntryTypeWithFiltering(selectedEntryType, visualizationType);
        const enableActionParams = Boolean(
            canUseFiltration && data.tabs[tabIndex].enableActionParams,
        );

        const caption = (
            <div className={b('caption')}>
                <span className={b('caption-text')}>
                    {i18n('dash.widget-dialog.edit', 'label_filtering-other-charts')}
                </span>
                <HelpPopover
                    className={b('help-tooltip')}
                    content={i18n('dash.widget-dialog.edit', 'context_filtering-other-charts')}
                />
            </div>
        );

        return (
            <Line caption={caption}>
                <div>
                    <Checkbox
                        size="m"
                        onChange={this.handleChangeFiltering}
                        checked={enableActionParams}
                        disabled={!canUseFiltration}
                    >
                        {i18n('dash.widget-dialog.edit', 'field_enable-filtering-other-charts')}
                    </Checkbox>
                    {this.getHierarchyWarning()}
                </div>
            </Line>
        );
    };

    renderDialogBody = () => {
        const {data, tabIndex, selectedWidgetType} = this.state;
        const {
            workbookId,
            navigationPath,
            enableAutoheight,
            enableBackgroundColor,
            enableFilteringSetting,
            changeNavigationPath,
        } = this.props;

        const autoHeightCheckboxCaption = (
            <div className={b('caption')}>
                <span className={b('caption-text')}>
                    {i18n('dash.widget-dialog.edit', 'field_autoheight')}
                </span>
                <HelpPopover
                    className={b('help-tooltip')}
                    content={i18n(
                        'dash.widget-dialog.edit',
                        'context_autoheight-availability-hint',
                    )}
                />
            </div>
        );

        const {title, chartId, description, autoHeight, background} = data.tabs[tabIndex];

        return (
            <React.Fragment>
                <Line caption={i18n('dash.widget-dialog.edit', 'field_title')}>
                    <TextInput
                        size="m"
                        className={b('input')}
                        placeholder={i18n('dash.widget-dialog.edit', 'context_fill-title')}
                        value={title}
                        onUpdate={(value) =>
                            this.setState({
                                isManualTitle: true,
                                data: update(data, {
                                    tabs: {
                                        [tabIndex]: {
                                            title: {$set: value},
                                        },
                                    },
                                }),
                            })
                        }
                    />
                    {data.tabs.length === 1 && (
                        <div className={b('visibility-toggle')}>
                            <Checkbox
                                size="m"
                                onChange={this.onVisibilityCheckboxToggle}
                                checked={!this.state.hideTitle}
                                qa={DashCommonQa.WidgetShowTitleCheckbox}
                            >
                                {i18n('dash.widget-dialog.edit', 'field_show-title')}
                            </Checkbox>
                        </div>
                    )}
                </Line>
                <Line
                    caption={i18n('dash.widget-dialog.edit', 'field_widget')}
                    className={b('line-widget')}
                >
                    <div className={b('navigation-input-container')} ref={this.navigationInputRef}>
                        <NavigationInput
                            entryId={chartId}
                            onChange={this.onAddWidget}
                            excludeClickableType={EntryTypeNode.CONTROL_NODE}
                            onUpdate={this.setSelectedWidgetType}
                            scope={EntryScope.Widget}
                            workbookId={workbookId}
                            navigationPath={navigationPath}
                            changeNavigationPath={changeNavigationPath}
                        />
                    </div>
                    <Popup
                        anchorRef={this.navigationInputRef}
                        open={this.state.error}
                        placement="left-start"
                        hasArrow={true}
                        onClose={() => this.setState({error: false})}
                    >
                        <div className={b('error')}>
                            {i18n('dash.widget-dialog.edit', 'toast_required-field')}
                        </div>
                    </Popup>
                </Line>
                <Line caption={i18n('dash.widget-dialog.edit', 'field_description')}>
                    <div className={b('textarea-wrapper')}>
                        <TextArea
                            size="m"
                            className={b('input')}
                            value={description}
                            placeholder={i18n(
                                'dash.widget-dialog.edit',
                                'context_fill-description',
                            )}
                            onUpdate={(value) =>
                                this.setState({
                                    data: update(data, {
                                        tabs: {
                                            [tabIndex]: {
                                                description: {$set: value},
                                            },
                                        },
                                    }),
                                })
                            }
                            rows={3}
                        />
                    </div>
                </Line>
                {enableAutoheight && (
                    <Line caption={autoHeightCheckboxCaption}>
                        <Checkbox
                            size="m"
                            onChange={this.onAutoHeightRadioButtonChange}
                            disabled={!isWidgetTypeWithAutoHeight(selectedWidgetType)}
                            checked={Boolean(autoHeight)}
                            qa={DashCommonQa.WidgetEnableAutoHeightCheckbox}
                        >
                            {i18n('dash.widget-dialog.edit', 'label_autoheight-enable')}
                        </Checkbox>
                    </Line>
                )}
                {enableBackgroundColor && (
                    <Line
                        caption={
                            <div className={b('caption')}>
                                <span className={b('caption-text')}>
                                    {i18n('dash.widget-dialog.edit', 'field_background')}
                                </span>
                            </div>
                        }
                    >
                        <Checkbox
                            checked={Boolean(background?.enabled)}
                            onChange={this.handleBackgroundEnabledChanged}
                            qa={DashCommonQa.WidgetEnableBackgroundCheckbox}
                        >
                            {i18n('dash.widget-dialog.edit', 'field_background-enable')}
                        </Checkbox>
                        {Boolean(background?.enabled) && (
                            <PaletteBackground
                                color={background?.color}
                                onSelect={this.handleBackgroundColorSelected}
                            />
                        )}
                    </Line>
                )}
                {enableFilteringSetting && this.renderFilteringCharts()}
                {this.renderParams()}
            </React.Fragment>
        );
    };

    renderDialogFooter = () => {
        const {closeDialog} = this.props;

        return (
            <Dialog.Footer
                onClickButtonCancel={closeDialog}
                onClickButtonApply={this.onApply}
                textButtonApply={
                    this.isEdit
                        ? i18n('dash.widget-dialog.edit', 'button_save')
                        : i18n('dash.widget-dialog.edit', 'button_add')
                }
                textButtonCancel={i18n('dash.widget-dialog.edit', 'button_cancel')}
                propsButtonApply={{qa: DialogDashWidgetQA.Apply}}
                propsButtonCancel={{qa: DialogDashWidgetQA.Cancel}}
            />
        );
    };

    renderParams() {
        const isValidateParamTitle = Utils.isEnabledFeature(
            Feature.DashBoardWidgetParamsStrictValidation,
        );

        const {tabIndex, legacyChanged} = this.state;

        let paramValidator;
        if (isValidateParamTitle) {
            paramValidator = (paramTitle: string) => {
                const errorCode = validateParamTitle(paramTitle);

                if (errorCode) {
                    return new Error(
                        i18n('dash.params-button-dialog.view', `context_${errorCode}`),
                    );
                }

                return null;
            };
        }

        return (
            <Collapse
                className={b('params-collapse')}
                title={
                    <Line
                        className={b('params-title')}
                        caption={i18n('dash.widget-dialog.edit', 'field_params')}
                    />
                }
                arrowPosition="left"
                arrowQa={ParamsSettingsQA.Open}
            >
                <ParamsSettings
                    data={this.state.tabParams}
                    group={tabIndex + legacyChanged}
                    onEditParamTitle={this.handleEditParamTitle}
                    onEditParamValue={this.handleEditParamValue}
                    onRemoveParam={this.handleRemoveParam}
                    onRemoveAllParams={this.handleRemoveAllParams}
                    validator={{title: paramValidator}}
                />
            </Collapse>
        );
    }
}

export default DialogChartWidget;
