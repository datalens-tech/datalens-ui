import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {HelpMarkProps, RealTheme} from '@gravity-ui/uikit';
import {Checkbox, Dialog, Flex, HelpMark, Link, Popup, Text, TextInput} from '@gravity-ui/uikit';
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
import {DashCommonQa, DialogDashWidgetQA, EntryScope, Feature, ParamsSettingsQA} from 'shared';
import {getEntryVisualizationType} from 'shared/schema/mix/helpers';
import {Collapse} from 'ui/components/Collapse/Collapse';
import {Interpolate} from 'ui/components/Interpolate';
import {TabMenu} from 'ui/components/TabMenu/TabMenu';
import type {UpdateState} from 'ui/components/TabMenu/types';
import {TabActionType} from 'ui/components/TabMenu/types';
import {DL, URL_OPTIONS} from 'ui/constants/common';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

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
import TwoColumnDialog from '../ControlComponents/TwoColumnDialog/TwoColumnDialog';

import './DialogChartWidget.scss';

const imm = new Context();

type AutoExtendCommand<T = object> = CustomCommands<{$auto: Spec<T>}>;

imm.extend('$auto', (value, object) => {
    return object ? update(object, value) : update({}, value);
});

const helpMarkDefaultProps: Partial<HelpMarkProps> = {
    style: {
        verticalAlign: 'middle',
    },
    popoverProps: {style: {maxWidth: 300}},
};

const b = block('widget-item-dialog');

const isWidgetTypeWithAutoHeight = (widgetType?: WidgetKind) => {
    return (
        widgetType === DASH_WIDGET_TYPES.TABLE ||
        widgetType === DASH_WIDGET_TYPES.MARKDOWN ||
        widgetType === DASH_WIDGET_TYPES.METRIC ||
        widgetType === DASH_WIDGET_TYPES.MARKUP
    );
};

type AfterSettingsWidgetCallback = ((selectedWidgetType: WidgetKind) => void) | null;

export interface DialogChartWidgetFeatureProps {
    withoutSidebar?: boolean;

    enableAutoheight?: boolean;
    enableBackgroundColor?: boolean;
    enableCustomBgColorSelector?: boolean;
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
};

const INPUT_FILTERING_ID = 'chartFilteringField';
const INPUT_NAME_ID = 'chartNameField';
const INPUT_DESCRIPTION_ID = 'chartDescriptionField';
const INPUT_AUTOHEIGHT_ID = 'chartAutoheightField';
const INPUT_HINT_ID = 'chartHintField';

// TODO: put in defaultPath navigation key from entry
class DialogChartWidget extends React.PureComponent<
    DialogChartWidgetProps,
    DialogChartWidgetState
> {
    static defaultProps = {
        enableAutoheight: true,
        enableBackgroundColor: false,
        enableCustomBgColorSelector: false,
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
                        color: 'transparent',
                    },
                    enableHint: false,
                    hint: '',
                    enableDescription: false,
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
                disableEscapeKeyDown={true}
                withoutSidebar={withoutSidebar}
            />
        );
    }

    get isEdit() {
        return Boolean(this.props.openedItemId);
    }

    handleUpdateField = (field: keyof DashTabItemWidgetTab, value: string | boolean) => {
        const {data, tabIndex} = this.state;
        this.setState({
            data: update(data, {
                tabs: {
                    [tabIndex]: {
                        [field]: {$set: value},
                    },
                },
            }),
        });
    };

    onApply = () => {
        const isValidateParamTitle = isEnabledFeature(
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

        const filteredParams = omit(params, [URL_OPTIONS.EMBEDDED, URL_OPTIONS.NO_CONTROLS]);

        const newTabParams = imm.update<{tabParams: StringParams}, AutoExtendCommand<StringParams>>(
            {tabParams},
            {tabParams: {$auto: {$merge: filteredParams}}},
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
                            params: {$auto: {$merge: filteredParams}},
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
                            params: {$auto: {$merge: filteredParams}},
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
        const currentCondition = this.state.data.tabs[this.state.tabIndex].autoHeight;

        this.handleUpdateField('autoHeight', !currentCondition);
    };

    handleUpdateEnableDesc = (val: boolean) => {
        this.handleUpdateField('enableDescription', val);
    };

    handleUpdateEnableHint = (val: boolean) => {
        this.handleUpdateField('enableHint', val);
    };

    handleUpdateDescription = (val: string) => {
        this.handleUpdateField('description', val);
    };

    handleUpdateHint = (val: string) => {
        this.handleUpdateField('hint', val);
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
        const currentCondition = this.state.data.tabs[this.state.tabIndex].enableActionParams;
        this.handleUpdateField('enableActionParams', !currentCondition);
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
        this.setState({
            selectedWidgetType,
            selectedEntryType: entryMeta.type,
            visualizationType,
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

    getFiltrationDocsLink = () => {
        if (!DL.ENDPOINTS.datalensDocs) {
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

        const helpPopover = (
            <HelpMark {...helpMarkDefaultProps} className={b('help-tooltip')}>
                {i18n('dash.widget-dialog.edit', 'context_filtering-other-charts')}
                {this.getFiltrationDocsLink()}
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
                        onChange={this.handleChangeFiltering}
                        checked={enableActionParams}
                        disabled={!canUseFiltration}
                    />
                </div>
            </FormRow>
        );
    };

    renderDialogBody = () => {
        const {data, tabIndex, selectedWidgetType} = this.state;
        const {
            workbookId,
            navigationPath,
            enableAutoheight,
            enableBackgroundColor,
            enableCustomBgColorSelector,
            enableFilteringSetting,
            changeNavigationPath,
        } = this.props;

        const autoHeightHelpPopover = (
            <HelpMark {...helpMarkDefaultProps} className={b('help-tooltip')}>
                {i18n('dash.widget-dialog.edit', 'context_autoheight-availability-hint')}
            </HelpMark>
        );

        const {
            title,
            chartId,
            description,
            autoHeight,
            background,
            hint,
            enableHint,
            enableDescription,
        } = data.tabs[tabIndex];

        const hasDesc =
            enableDescription === undefined ? Boolean(description) : Boolean(enableDescription);

        const {MarkdownControl} = registry.common.components.getAll();

        return (
            <React.Fragment>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_NAME_ID}
                    label={i18n('dash.widget-dialog.edit', 'field_title')}
                >
                    <Flex gap={2}>
                        <TextInput
                            id={INPUT_NAME_ID}
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
                                    className={b('checkbox')}
                                    size="m"
                                    onChange={this.onVisibilityCheckboxToggle}
                                    checked={!this.state.hideTitle}
                                    qa={DashCommonQa.WidgetShowTitleCheckbox}
                                >
                                    {i18n('dash.widget-dialog.edit', 'field_show-title')}
                                </Checkbox>
                            </div>
                        )}
                    </Flex>
                </FormRow>
                <FormRow
                    className={b('row', {type: 'line-widget'})}
                    label={i18n('dash.widget-dialog.edit', 'field_widget')}
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
                        anchorElement={this.navigationInputRef.current}
                        open={this.state.error}
                        placement="left-start"
                        hasArrow={true}
                        onOpenChange={(open) => {
                            if (!open) {
                                this.setState({error: false});
                            }
                        }}
                    >
                        <div className={b('error')}>
                            {i18n('dash.widget-dialog.edit', 'toast_required-field')}
                        </div>
                    </Popup>
                </FormRow>
                <FormRow
                    className={b('row')}
                    fieldId={INPUT_DESCRIPTION_ID}
                    label={i18n('dash.widget-dialog.edit', 'field_description')}
                >
                    <div className={b('settings-container')}>
                        <Checkbox
                            onUpdate={this.handleUpdateEnableDesc}
                            checked={hasDesc}
                            size="m"
                            className={b('checkbox')}
                        />
                        {hasDesc && (
                            <MarkdownControl
                                key={`md-desc-tab-${tabIndex}`}
                                value={description || ''}
                                onChange={this.handleUpdateDescription}
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
                        <HelpMark {...helpMarkDefaultProps} className={b('help-tooltip')}>
                            {i18n('dash.widget-dialog.edit', 'context_hint-display-info')}
                        </HelpMark>
                    }
                >
                    <div className={b('settings-container')}>
                        <Checkbox
                            onUpdate={this.handleUpdateEnableHint}
                            checked={Boolean(enableHint)}
                            size="m"
                            className={b('checkbox')}
                        />
                        {Boolean(enableHint) && (
                            <MarkdownControl
                                key={`md-hint-tab-${tabIndex}`}
                                value={hint || ''}
                                onChange={this.handleUpdateHint}
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
                            onChange={this.onAutoHeightRadioButtonChange}
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
                            color={background?.color}
                            onSelect={this.handleBackgroundColorSelected}
                            enableCustomBgColorSelector={enableCustomBgColorSelector}
                        />
                    </FormRow>
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
        const isValidateParamTitle = isEnabledFeature(
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
                    <Text variant="subheader-3">
                        {i18n('dash.widget-dialog.edit', 'field_params')}
                    </Text>
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
