import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import {useDispatch, useSelector} from 'react-redux';
import type {CommonSharedExtraSettings} from 'shared';
import {EntryUpdateMode, Feature} from 'shared';
import type {QlConfig} from 'shared/types/config/ql';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {isDraftVersion} from 'ui/utils/revisions';

import type {DatalensGlobalState, EntryDialogues} from '../../../../../';
import {
    ActionPanel,
    DialogNoRights,
    EntryDialogName,
    EntryDialogResolveStatus,
    Utils,
} from '../../../../../';
import type {GetEntryResponse} from '../../../../../../shared/schema';
import {ChartSaveControls} from '../../../../../components/ActionPanel/components/ChartSaveControls/ChartSaveControl';
import type {EntryContextMenuItems} from '../../../../../components/EntryContextMenu/helpers';
import {registry} from '../../../../../registry';
import {openDialogSaveDraftChartAsActualConfirm} from '../../../../../store/actions/dialog';
import {addEditHistoryPoint, resetEditHistoryUnit} from '../../../../../store/actions/editHistory';
import {reloadRevisionsOnSave} from '../../../../../store/actions/entryContent';
import DialogSettings from '../../../components/Dialogs/Settings/Settings';
import {QL_EDIT_HISTORY_UNIT_ID} from '../../../constants';
import {prepareChartDataBeforeSave} from '../../../modules/helpers';
import {
    drawPreview,
    setEntry,
    setExtraSettings,
    setQlChartActualRevision,
    toggleTablePreview,
    updateChart,
} from '../../../store/actions/ql';
import {
    getConnection,
    getDefaultPath,
    getEntry,
    getEntryCanBeSaved,
    getEntryNotChanged,
    getExtraSettings,
    getPreviewData,
    getRedirectUrl,
    getValid,
} from '../../../store/reducers/ql';
import type {QLEntry} from '../../../store/typings/ql';

import {useQLActionPanel} from './useQLActionPanel';

import iconMonitoring from 'ui/assets/icons/monitoring.svg';

import './QLActionPanel.scss';

const b = block('ql-header');

type QLActionPanelProps = {
    entry: QLEntry | null;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    match: {
        isExact: boolean;
        path: string;
        url: string;
        params: Record<string, string>;
    };
};

export const QLActionPanel: React.FC<QLActionPanelProps> = (props: QLActionPanelProps) => {
    const {entryDialoguesRef} = props;

    const defaultPath = useSelector(getDefaultPath);
    const entryNotChanged = useSelector(getEntryNotChanged);
    const valid = useSelector(getValid);
    const entryCanBeSaved = useSelector(getEntryCanBeSaved);
    const connection = useSelector(getConnection);
    const extraSettings = useSelector(getExtraSettings);
    const redirectUrl = useSelector(getRedirectUrl);
    const previewData = useSelector(getPreviewData);
    const entry = useSelector(getEntry);

    const entryLocked = entry && entry.permissions && entry.permissions.edit === false;

    const isCurrentRevisionActual = entry?.revId && entry?.revId === entry?.publishedId;
    const isNewChart = typeof entry?.fake !== 'undefined' && entry?.fake;

    const isSaveButtonDisabled = !entryCanBeSaved;

    const {QlActionPanelExtension} = registry.ql.components.getAll();

    const enablePublish = entry && isEnabledFeature(Feature.EnablePublishEntry) && !entry.fake;

    const dispatch = useDispatch();

    const [dialogNoRightsVisible, setDialogNoRightsVisible] = React.useState(false);
    const [dialogSettingsVisible, setDialogSettingsVisible] = React.useState(false);

    // Note, that QL uses QL store and Wizard store, because QL and Wizard use same visualization section
    const qlState = useSelector((state: DatalensGlobalState) => state.ql);
    const wizardState = useSelector((state: DatalensGlobalState) => state.wizard);

    const handleBeforeunload = React.useCallback(
        (event: BeforeUnloadEvent) => {
            if (!entryNotChanged) {
                event.returnValue = true;
            }
        },
        [entryNotChanged],
    );

    React.useEffect(() => {
        window.removeEventListener('beforeunload', handleBeforeunload);
        window.addEventListener('beforeunload', handleBeforeunload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeunload);
        };
    }, [handleBeforeunload]);

    const handleSetActualRevision = React.useCallback(() => {
        if (!entry) {
            return;
        }

        const isDraft = isDraftVersion(entry);

        if (isDraft) {
            dispatch(setQlChartActualRevision(true));
        } else {
            dispatch(
                openDialogSaveDraftChartAsActualConfirm({
                    onApply: () => dispatch(setQlChartActualRevision()),
                }),
            );
        }
    }, [dispatch, entry]);

    const additionalEntryItems = React.useMemo(() => {
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
    }, [redirectUrl]);

    const defaultChartName = React.useMemo(() => {
        if (connection === null) {
            return '';
        }

        const name = connection.name ? connection.name : Utils.getEntryNameFromKey(connection.key);

        return `${name} - ${i18n('sql', 'text_default-name')}`;
    }, [connection]);

    const openSaveAsWidgetDialog = React.useCallback(
        async (preparedChartData: QlConfig) => {
            if (!entryDialoguesRef || !connection) {
                return;
            }

            const path = entry && !entry.fake ? entry.key.replace(/[^/]+$/, '') : defaultPath;

            const initName =
                entry && !entry.fake
                    ? i18n('wizard', 'label_widget-name-copy', {
                          name: Utils.getEntryNameFromKey(entry.key, true),
                      })
                    : defaultChartName;

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

            window.history.replaceState({}, document.title, `/ql/${result.data.entryId}`);

            result.data.data = {
                shared: JSON.parse(result.data.data.shared),
            };

            dispatch(setEntry({entry: result.data as QLEntry}));

            dispatch(
                resetEditHistoryUnit({
                    unitId: QL_EDIT_HISTORY_UNIT_ID,
                }),
            );

            dispatch(
                addEditHistoryPoint({
                    newState: {ql: qlState, wizard: wizardState},
                    unitId: QL_EDIT_HISTORY_UNIT_ID,
                }),
            );
        },
        [
            connection,
            defaultPath,
            dispatch,
            entry,
            entryDialoguesRef,
            defaultChartName,
            qlState,
            wizardState,
        ],
    );

    const handleClickButtonSave = React.useCallback(
        (mode) => {
            if (!previewData || !entry) {
                return;
            }

            const preparedChartData = prepareChartDataBeforeSave(previewData);

            // Updating an existing one or saving a new one?
            if (entry.fake) {
                // Saving a new one
                openSaveAsWidgetDialog(preparedChartData);
            } else {
                // Updating an existing one
                dispatch(updateChart(preparedChartData, mode));
                dispatch(reloadRevisionsOnSave(true));

                dispatch(
                    addEditHistoryPoint({
                        newState: {ql: qlState, wizard: wizardState},
                        unitId: QL_EDIT_HISTORY_UNIT_ID,
                    }),
                );
            }
        },
        [dispatch, entry, openSaveAsWidgetDialog, previewData, qlState, wizardState],
    );

    const handleClickButtonSaveAs = React.useCallback(() => {
        if (previewData) {
            const preparedChartData = prepareChartDataBeforeSave(previewData);

            openSaveAsWidgetDialog(preparedChartData);
        }
    }, [openSaveAsWidgetDialog, previewData]);

    const openNoRightsDialog = React.useCallback(() => {
        setDialogNoRightsVisible(true);
    }, []);

    const handleClickButtonToggleTablePreview = React.useCallback(() => {
        dispatch(toggleTablePreview());
    }, [dispatch]);

    const saveAsDraftClick = React.useCallback(() => {
        handleClickButtonSave(EntryUpdateMode.Save);
    }, [handleClickButtonSave]);

    const saveAsPublishedClick = React.useCallback(() => {
        handleClickButtonSave(EntryUpdateMode.Publish);
    }, [handleClickButtonSave]);

    const saveAsAction = React.useCallback(() => {
        if (!previewData) {
            return;
        }

        const preparedChartData = prepareChartDataBeforeSave(previewData);

        openSaveAsWidgetDialog(preparedChartData);
    }, [openSaveAsWidgetDialog, previewData]);

    const openRequestWidgetAccessRightsDialog = React.useCallback(() => {
        if (entry) {
            entryDialoguesRef.current?.open({
                dialog: EntryDialogName.Unlock,
                dialogProps: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    entry: entry as any,
                },
            });
        }
    }, [entry, entryDialoguesRef]);

    const handleCloseDialogNoRights = React.useCallback(() => {
        setDialogNoRightsVisible(false);
    }, []);

    const handleCancelDialogSettings = React.useCallback(() => {
        setDialogSettingsVisible(false);
    }, []);

    const handleApplyDialogSettings = React.useCallback(
        ({extraSettings: newExtraSettings}: {extraSettings: CommonSharedExtraSettings}) => {
            setDialogSettingsVisible(false);

            if (!isEqual(extraSettings, newExtraSettings)) {
                dispatch(setExtraSettings({extraSettings: newExtraSettings}));

                dispatch(
                    drawPreview({
                        withoutTable: true,
                    }),
                );
            }
        },
        [dispatch, extraSettings],
    );

    const additionalButtons = useQLActionPanel({
        entryLocked,
        handleClickButtonToggleTablePreview,
    });

    return (
        <React.Fragment>
            <ActionPanel
                entry={entry as GetEntryResponse}
                enablePublish={enablePublish || undefined}
                className={b()}
                setActualVersion={handleSetActualRevision}
                additionalEntryItems={additionalEntryItems}
                rightItems={[
                    <QlActionPanelExtension key="ql-action-panel-extension" />,
                    <ChartSaveControls
                        key="header-right-controls"
                        onClickButtonSave={handleClickButtonSave}
                        onOpenNoRightsDialog={openNoRightsDialog}
                        isLocked={Boolean(entryLocked)}
                        isSaveButtonDisabled={isSaveButtonDisabled}
                        isDropdownDisabled={!valid || isNewChart}
                        isCurrentRevisionActual={Boolean(isCurrentRevisionActual)}
                        isNewChart={isNewChart}
                        needSplitMainAndAdditionalButtons={true}
                        additionalControls={additionalButtons}
                        onSaveAndPublishClick={saveAsPublishedClick}
                        onSaveAsDraftClick={saveAsDraftClick}
                        onSaveAsNewClick={saveAsAction}
                    />,
                ]}
            />
            <DialogNoRights
                visible={dialogNoRightsVisible}
                onClose={handleCloseDialogNoRights}
                onAccessRights={openRequestWidgetAccessRightsDialog}
                onSaveAs={handleClickButtonSaveAs}
            />
            {entry && (
                <DialogSettings
                    entry={entry}
                    extraSettings={extraSettings}
                    visible={dialogSettingsVisible}
                    onCancel={handleCancelDialogSettings}
                    onApply={handleApplyDialogSettings}
                />
            )}
        </React.Fragment>
    );
};
