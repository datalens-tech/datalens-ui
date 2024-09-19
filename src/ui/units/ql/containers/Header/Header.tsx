import React from 'react';

import {LayoutHeader} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _isEqual from 'lodash/isEqual';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {CommonSharedExtraSettings} from 'shared';
import {EntryUpdateMode, Feature} from 'shared';
import type {QlConfig} from 'shared/types/config/ql';
import type {DatalensGlobalState, EntryDialogues} from 'ui';
import {ActionPanel, DialogNoRights, EntryDialogName, EntryDialogResolveStatus, Utils} from 'ui';

import type {GetEntryResponse} from '../../../../../shared/schema';
import {ChartSaveControls} from '../../../../components/ActionPanel/components/ChartSaveControls/ChartSaveControl';
import type {AdditionalButtonTemplate} from '../../../../components/ActionPanel/components/ChartSaveControls/types';
import type {EntryContextMenuItems} from '../../../../components/EntryContextMenu/helpers';
import {isDraftVersion} from '../../../../components/Revisions/helpers';
import {registry} from '../../../../registry';
import {openNavigation} from '../../../../store/actions/asideHeader';
import {openDialogSaveDraftChartAsActualConfirm} from '../../../../store/actions/dialog';
import {reloadRevisionsOnSave} from '../../../../store/actions/entryContent';
import DialogSettings from '../../components/Dialogs/Settings/Settings';
import {prepareChartDataBeforeSave} from '../../modules/helpers';
import {
    drawPreview,
    setEntry,
    setExtraSettings,
    setQlChartActualRevision,
    toggleTablePreview,
    updateChart,
} from '../../store/actions/ql';
import {
    getConnection,
    getCurrentSchemeId,
    getDefaultPath,
    getEntryCanBeSaved,
    getEntryNotChanged,
    getExtraSettings,
    getPreviewData,
    getRedirectUrl,
    getValid,
} from '../../store/reducers/ql';
import type {QLEntry} from '../../store/typings/ql';

import iconMonitoring from 'ui/assets/icons/monitoring.svg';

import './Header.scss';

const b = block('ql-header');

type HeaderDispatchProps = typeof mapDispatchToProps;
type HeaderStateProps = ReturnType<typeof makeMapStateToProps>;

type HeaderOuterProps = {
    entry: QLEntry | null;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    match: {
        isExact: boolean;
        path: string;
        url: string;
        params: Record<string, string>;
    };
};

type HeaderInnerProps = HeaderStateProps & HeaderDispatchProps & RouteComponentProps<{}>;

type HeaderState = {
    dialogNoRightsVisible: boolean;
    dialogSettingsVisible: boolean;
    entry?: QLEntry;
};

type HeaderProps = HeaderInnerProps & HeaderOuterProps;

class Header extends React.PureComponent<HeaderProps, HeaderState> {
    constructor(props: HeaderProps) {
        super(props);

        const state: HeaderState = {
            dialogNoRightsVisible: false,
            dialogSettingsVisible: false,
        };

        if (props.entry !== null) {
            state.entry = props.entry;
        }

        this.state = state;
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.unloadConfirmation);
    }

    componentDidUpdate(prevProps: Readonly<HeaderProps>) {
        if (this.props.entry !== null && this.props.entry !== prevProps.entry) {
            this.setState({entry: this.props.entry});
        }
    }

    render() {
        const {entryCanBeSaved, valid, extraSettings} = this.props;
        const {entry} = this.state;

        const entryLocked = entry && entry.permissions && entry.permissions.edit === false;

        const isCurrentRevisionActual = entry?.revId && entry?.revId === entry?.publishedId;
        const isNewChart = typeof entry?.fake !== 'undefined' && entry?.fake;

        const isSaveButtonDisabled = !entryCanBeSaved;

        const {QlActionPanelExtension} = registry.ql.components.getAll();

        const enablePublish =
            entry && Utils.isEnabledFeature(Feature.EnablePublishEntry) && !entry.fake;

        return (
            <React.Fragment>
                <ActionPanel
                    entry={entry as GetEntryResponse}
                    enablePublish={enablePublish}
                    className={b()}
                    setActualVersion={this.handleSetActualRevision}
                    additionalEntryItems={this.additionalEntryItems}
                    rightItems={[
                        <QlActionPanelExtension key="ql-action-panel-extension" />,
                        <ChartSaveControls
                            key="header-right-controls"
                            onClickButtonSave={this.onClickButtonSave}
                            onOpenNoRightsDialog={this.openNoRightsDialog}
                            isLocked={Boolean(entryLocked)}
                            isSaveButtonDisabled={isSaveButtonDisabled}
                            isDropdownDisabled={!valid || isNewChart}
                            isCurrentRevisionActual={Boolean(isCurrentRevisionActual)}
                            isNewChart={isNewChart}
                            needSplitMainAndAdditionalButtons={true}
                            additionalControls={this.getAdditionalRightControlButtons()}
                            onSaveAndPublishClick={this.saveAsPublishedClick}
                            onSaveAsDraftClick={this.saveAsDraftClick}
                            onSaveAsNewClick={this.saveAsAction}
                        />,
                    ]}
                />
                <DialogNoRights
                    visible={this.state.dialogNoRightsVisible}
                    onClose={() => {
                        this.setState({
                            dialogNoRightsVisible: false,
                        });
                    }}
                    onAccessRights={this.openRequestWidgetAccessRightsDialog}
                    onSaveAs={() => {
                        const {previewData} = this.props;
                        if (previewData) {
                            const preparedChartData = prepareChartDataBeforeSave(previewData);
                            this.openSaveAsWidgetDialog(preparedChartData);
                        }
                    }}
                />
                {entry && (
                    <DialogSettings
                        entry={entry}
                        extraSettings={extraSettings}
                        visible={this.state.dialogSettingsVisible}
                        onCancel={() => {
                            this.setState({
                                dialogSettingsVisible: false,
                            });
                        }}
                        onApply={({
                            extraSettings: newExtraSettings,
                        }: {
                            extraSettings: CommonSharedExtraSettings;
                        }) => {
                            this.setState({
                                dialogSettingsVisible: false,
                            });

                            if (!_isEqual(extraSettings, newExtraSettings)) {
                                this.props.setExtraSettings({extraSettings: newExtraSettings});

                                this.props.drawPreview({
                                    withoutTable: true,
                                });
                            }
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    private getAdditionalRightControlButtons = (): AdditionalButtonTemplate[] => {
        return [
            {
                key: 'toggle-table-preview-button',
                title: i18n('wizard', 'tooltip_table-preview'),
                action: () => this.onClickButtonToggleTablePreview(),
                className: b('toggle-preview-btn'),
                icon: {
                    data: LayoutHeader,
                    size: 16,
                    className: b('toggle-preview-icon'),
                },
            },
        ];
    };

    private handleSetActualRevision = () => {
        const {entry} = this.props;

        if (!entry) {
            return;
        }

        const isDraft = isDraftVersion(entry);

        if (isDraft) {
            this.props.setQlChartActualRevision(true);
        } else {
            this.props.openDialogSaveDraftChartAsActualConfirm({
                onApply: () => this.props.setQlChartActualRevision(),
            });
        }
    };

    private saveAsDraftClick = () => {
        this.onClickButtonSave(EntryUpdateMode.Save);
    };

    private saveAsPublishedClick = () => {
        this.onClickButtonSave(EntryUpdateMode.Publish);
    };

    private saveAsAction = () => {
        const {previewData} = this.props;

        if (!previewData) {
            return;
        }

        const preparedChartData = prepareChartDataBeforeSave(previewData);

        this.openSaveAsWidgetDialog(preparedChartData);
    };

    private get additionalEntryItems() {
        const {redirectUrl} = this.props;

        const items = [] as EntryContextMenuItems;

        if (redirectUrl) {
            items.push({
                text: i18n('sql', 'button_open-in-monitoring'),
                icon: <Icon data={iconMonitoring} width={16} height={16} />,
                id: 'sql-to-monitoring',
                action: () => {
                    window.open(redirectUrl, '_blank');
                },
            });
        }

        return items;
    }

    private unloadConfirmation = (event: Event) => {
        const {entryNotChanged} = this.props;

        if (!entryNotChanged) {
            event.returnValue = true;
        }
    };

    private getDefaultChartName() {
        const {connection} = this.props;
        if (connection === null) {
            return '';
        }
        const name = connection.name ? connection.name : Utils.getEntryNameFromKey(connection.key);
        return `${name} - ${i18n('sql', 'text_default-name')}`;
    }

    private openSaveAsWidgetDialog = async (preparedChartData: QlConfig) => {
        const {entry, defaultPath, entryDialoguesRef, connection} = this.props;

        if (!entryDialoguesRef || !connection) {
            return;
        }

        const path = entry && !entry.fake ? entry.key.replace(/[^/]+$/, '') : defaultPath;

        const initName =
            entry && !entry.fake
                ? i18n('wizard', 'label_widget-name-copy', {
                      name: Utils.getEntryNameFromKey(entry.key, true),
                  })
                : this.getDefaultChartName();

        const result = await entryDialoguesRef.current?.open({
            dialog: EntryDialogName.CreateQLChart,
            dialogProps: {
                data: preparedChartData,
                initName,
                initDestination: path,
                workbookId: entry?.workbookId,
            },
        });

        if (!result || !result.data || result.status === EntryDialogResolveStatus.Close) {
            return;
        }

        // todo: another history breaks the behavior, so for now we use window.history, as everywhere else, then we'll change it everywhere at once too
        window.history.replaceState({}, document.title, `/ql/${result.data.entryId}`);

        result.data.data = {
            shared: JSON.parse(result.data.data.shared),
        };

        this.props.setEntry({entry: result.data as QLEntry});
    };

    private openNoRightsDialog = () => {
        this.setState({
            dialogNoRightsVisible: true,
        });
    };

    private openRequestWidgetAccessRightsDialog = () => {
        const {entry, entryDialoguesRef} = this.props;

        if (entry) {
            entryDialoguesRef.current?.open({
                dialog: EntryDialogName.Unlock,
                dialogProps: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    entry: entry as any,
                },
            });
        }
    };

    private onClickButtonToggleTablePreview = () => {
        this.props.toggleTablePreview();
    };

    private onClickButtonSave = (mode?: EntryUpdateMode) => {
        const {entry, previewData} = this.props;

        if (!previewData || !entry) {
            return;
        }

        const preparedChartData = prepareChartDataBeforeSave(previewData);

        // Updating an existing one or saving a new one?
        if (entry.fake) {
            // Saving a new one
            this.openSaveAsWidgetDialog(preparedChartData);
        } else {
            // Updating an existing one
            this.props.updateChart(preparedChartData, mode);
            this.props.reloadRevisionsOnSave(true);
        }
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        schemeId: getCurrentSchemeId(state),
        defaultPath: getDefaultPath(state),
        entryNotChanged: getEntryNotChanged(state),
        valid: getValid(state),
        entryCanBeSaved: getEntryCanBeSaved(state),
        connection: getConnection(state),
        extraSettings: getExtraSettings(state),
        redirectUrl: getRedirectUrl(state),
        previewData: getPreviewData(state),
    };
};

const mapDispatchToProps = {
    setEntry,
    updateChart,
    openNavigation,
    toggleTablePreview,
    setExtraSettings,
    drawPreview,
    reloadRevisionsOnSave,
    setQlChartActualRevision,
    openDialogSaveDraftChartAsActualConfirm,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<HeaderProps, HeaderOuterProps>(withRouter)(Header));
