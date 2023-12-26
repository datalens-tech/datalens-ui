import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Checkbox, Dialog, Popup, TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import update, {Context, CustomCommands, Spec} from 'immutability-helper';
import {ResolveThunks, connect} from 'react-redux';
import {
    DashCommonQa,
    DashTabItemWidget,
    DashTabItemWidgetTab,
    DialogDashWidgetQA,
    EditorType,
    Feature,
    ParamsSettingsQA,
    StringParams,
    WidgetKind,
    WidgetType,
    WizardType,
} from 'shared';
import {DatalensGlobalState} from 'ui';
import {BetaMark} from 'ui/components/BetaMark/BetaMark';
import {Collapse} from 'ui/components/Collapse/Collapse';

import Utils from '../../../../../utils';
import NavigationInput from '../../../components/NavigationInput/NavigationInput';
import {ParamsSettings} from '../../../components/ParamsSettings/ParamsSettings';
import {
    clearEmptyParams,
    removeParam,
    updateParamTitle,
    updateParamValue,
    validateParamTitle,
} from '../../../components/ParamsSettings/helpers';
import TwoColumnDialog from '../../../components/TwoColumnDialog/TwoColumnDialog';
import {DIALOG_TYPE} from '../../../containers/Dialogs/constants';
import {DASH_WIDGET_TYPES, ENTRY_TYPE} from '../../../modules/constants';
import {closeDialog} from '../../../store/actions/dash';
import {setItemData} from '../../../store/actions/dashTyped';
import {
    selectCurrentTabId,
    selectDashWorkbookId,
    selectIsDialogVisible,
    selectOpenedItemData,
    selectWidgetsCurrentTab,
} from '../../../store/selectors/dashTypedSelectors';

import {ListState, TabMenu} from './TabMenu/TabMenu';

import './Widget.scss';

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
        widgetType === DASH_WIDGET_TYPES.METRIC
    );
};

const isEntryTypeWithFiltering = (entryType?: WidgetType) => {
    const wizardFilteringAvailable = Utils.isEnabledFeature(
        Feature.WizardChartChartFilteringAvailable,
    );
    const widgetTypesWithFilteringAvailable: WidgetType[] = [
        EditorType.TableNode,
        EditorType.GraphNode,
    ];

    if (wizardFilteringAvailable) {
        widgetTypesWithFilteringAvailable.push(
            WizardType.GraphWizardNode,
            WizardType.TableWizardNode,
        );
    }

    return entryType && widgetTypesWithFilteringAvailable.includes(entryType);
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

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type State = {
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
};

type Props = StateProps & DispatchProps;

// TODO: put in defaultPath navigation key from entry
class Widget extends React.PureComponent<Props, State> {
    static defaultProps = {
        data: {
            hideTitle: false,
            tabs: [
                {
                    get title() {
                        return i18n('dash.widget-dialog.edit', 'value_title-default', {index: 1});
                    },
                    isDefault: true,
                    description: '',
                },
            ],
        } as DashTabItemWidget['data'],
    };

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.visible === prevState.prevVisible) {
            return null;
        }

        let currentTab: string;
        let tabIndex = 0;
        if (nextProps.id) {
            currentTab = nextProps.widgetsCurrentTab[nextProps.id];
            tabIndex = nextProps.data.tabs.findIndex(({id}) => id === currentTab);
        }

        return {
            hideTitle: nextProps.data.tabs.length === 1 && nextProps.data.hideTitle,
            prevVisible: nextProps.visible,
            error: false,
            data: nextProps.data,
            tabIndex: tabIndex === -1 ? 0 : tabIndex,
            isManualTitle: Boolean(nextProps.id),
            selectedWidgetType: null,
            selectedEntryType: null,
            // new params logic, local state for current tab params
            tabParams: nextProps.data.tabs[0]?.params || {},
            legacyChanged: 0,
        };
    }

    state: State = {
        hideTitle: true,
        prevVisible: false,
        error: false,
        tabIndex: 0,
        data: Widget.defaultProps.data,
        isManualTitle: false,
        tabParams: {},
        legacyChanged: 0,
    };

    private navigationInputRef = React.createRef<HTMLDivElement>();
    private afterSettingSelectedWidgetTypeCallback: AfterSettingsWidgetCallback = null;

    get isEdit() {
        return Boolean(this.props.id);
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
        const {data, tabIndex, isManualTitle, tabParams, legacyChanged} = this.state;

        const newTabParams = imm.update<{tabParams: StringParams}, AutoExtendCommand<StringParams>>(
            {tabParams},
            {tabParams: {$auto: {$merge: params}}},
        ).tabParams;

        if (isManualTitle) {
            this.setState({
                data: imm.update<State['data'], AutoExtendCommand<State['data']['tabs']>>(data, {
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
                data: imm.update<State['data'], AutoExtendCommand<State['data']['tabs']>>(data, {
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
                            autoHeight: {$set: selectedWidgetType === DASH_WIDGET_TYPES.METRIC},
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

    updateTabMenu = ({items, selectedItemIndex, action}: ListState<DashTabItemWidgetTab>) => {
        const {data, tabIndex, tabParams} = this.state;

        const isNeedSaveParams = action === 'changeChosen' || action === 'add';

        const itemsWithParams: ListState<DashTabItemWidgetTab>['items'] = items.map(
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
            isManualTitle: action === 'add' ? false : this.isEdit,
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
        this.setState({selectedWidgetType, selectedEntryType: entryMeta.type});

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
                        update={this.updateTabMenu}
                    />
                </div>
            </div>
        );
    };

    renderFilteringCharts = () => {
        const showFilteringChartSetting = Utils.isEnabledFeature(Feature.ShowFilteringChartSetting);
        if (!showFilteringChartSetting) {
            return null;
        }
        const {data, tabIndex, selectedEntryType} = this.state;
        const caption = (
            <div
                className={b('caption', {
                    inactive: !isEntryTypeWithFiltering(selectedEntryType),
                })}
            >
                <span className={b('caption-text')}>
                    {i18n('dash.widget-dialog.edit', 'label_filtering-other-charts')}
                </span>
                <HelpPopover
                    className={b('help-tooltip')}
                    content={i18n('dash.widget-dialog.edit', 'context_filtering-other-charts')}
                />
                <BetaMark className={b('beta')} />
            </div>
        );

        return (
            <Line caption={caption}>
                <Checkbox
                    size="m"
                    onChange={this.handleChangeFiltering}
                    checked={data.tabs[tabIndex].enableActionParams || false}
                    disabled={!isEntryTypeWithFiltering(selectedEntryType)}
                >
                    {i18n('dash.widget-dialog.edit', 'field_enable-filtering-other-charts')}
                </Checkbox>
            </Line>
        );
    };

    renderDialogBody = () => {
        const {data, tabIndex, selectedWidgetType} = this.state;
        const {workbookId} = this.props;

        const autoHeightCheckboxCaption = (
            <div
                className={b('caption', {
                    inactive: !isWidgetTypeWithAutoHeight(selectedWidgetType),
                })}
            >
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

        const {title, chartId, description, autoHeight} = data.tabs[tabIndex];

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
                            excludeClickableType={ENTRY_TYPE.CONTROL_NODE}
                            onUpdate={this.setSelectedWidgetType}
                            workbookId={workbookId}
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
                <Line caption={autoHeightCheckboxCaption}>
                    <Checkbox
                        size="m"
                        onChange={this.onAutoHeightRadioButtonChange}
                        disabled={!isWidgetTypeWithAutoHeight(selectedWidgetType)}
                        checked={Boolean(autoHeight)}
                    >
                        {i18n('dash.widget-dialog.edit', 'label_autoheight-enable')}
                    </Checkbox>
                </Line>
                {this.renderFilteringCharts()}
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

    render() {
        const {visible, closeDialog} = this.props;

        const sidebar = this.renderDialogSidebar();
        const footer = this.renderDialogFooter();
        const content = this.renderDialogBody();
        const bodyHeaderKey = 'label_tab-settings';
        const bodyHeader = i18n('dash.widget-dialog.edit', bodyHeaderKey);

        const showFilteringChartSetting = Utils.isEnabledFeature(Feature.ShowFilteringChartSetting);

        return (
            <TwoColumnDialog
                className={b({long: showFilteringChartSetting})}
                open={visible}
                onClose={closeDialog}
                sidebarHeader={i18n('dash.widget-dialog.edit', 'label_widget')}
                sidebar={sidebar}
                bodyHeader={bodyHeader}
                body={content}
                footer={footer}
                sidebarClassMixin={b('dialog-sidebar')}
                disableFocusTrap={true}
            />
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    id: state.dash.openedItemId,
    data: selectOpenedItemData(state) as DashTabItemWidget['data'],
    widgetType: state.dash.openedItemWidgetType,
    visible: selectIsDialogVisible(state, DIALOG_TYPE.WIDGET),
    currentTabId: selectCurrentTabId(state),
    workbookId: selectDashWorkbookId(state),
    widgetsCurrentTab: selectWidgetsCurrentTab(state),
});

const mapDispatchToProps = {
    closeDialog,
    setItemData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Widget);
