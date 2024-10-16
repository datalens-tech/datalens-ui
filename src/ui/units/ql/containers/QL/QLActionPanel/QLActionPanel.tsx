import React, {useCallback, useMemo, useState} from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _isEqual from 'lodash/isEqual';
import {useDispatch, useSelector} from 'react-redux';
import type {CommonSharedExtraSettings} from 'shared';
import {EntryUpdateMode, Feature} from 'shared';
import type {QlConfig} from 'shared/types/config/ql';
import type {EntryDialogues} from 'ui';
import {
    ActionPanel,
    DialogNoRights,
    EntryDialogName,
    EntryDialogResolveStatus,
    Utils,
    useEffectOnce,
} from 'ui';

import type {GetEntryResponse} from '../../../../../../shared/schema';
import {ChartSaveControls} from '../../../../../components/ActionPanel/components/ChartSaveControls/ChartSaveControl';
import type {EntryContextMenuItems} from '../../../../../components/EntryContextMenu/helpers';
import {isDraftVersion} from '../../../../../components/Revisions/helpers';
import {registry} from '../../../../../registry';
import {openDialogSaveDraftChartAsActualConfirm} from '../../../../../store/actions/dialog';
import {reloadRevisionsOnSave} from '../../../../../store/actions/entryContent';
import DialogSettings from '../../../components/Dialogs/Settings/Settings';
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

    const enablePublish =
        entry && Utils.isEnabledFeature(Feature.EnablePublishEntry) && !entry.fake;

    const dispatch = useDispatch();

    const [dialogNoRightsVisible, setDialogNoRightsVisible] = useState(false);
    const [dialogSettingsVisible, setDialogSettingsVisible] = useState(false);

    useEffectOnce(() => {
        window.addEventListener('beforeunload', (event) => {
            if (!entryNotChanged) {
                event.returnValue = true;
            }
        });
    });

    const handleSetActualRevision = useCallback(() => {
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

    const additionalEntryItems = useMemo(() => {
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

    const getDefaultChartName = useCallback(() => {
        if (connection === null) {
            return '';
        }

        const name = connection.name ? connection.name : Utils.getEntryNameFromKey(connection.key);

        return `${name} - ${i18n('sql', 'text_default-name')}`;
    }, [connection]);

    const openSaveAsWidgetDialog = useCallback(
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
                    : getDefaultChartName();

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
        },
        [connection, defaultPath, dispatch, entry, entryDialoguesRef, getDefaultChartName],
    );

    const onClickButtonSave = useCallback(
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
            }
        },
        [dispatch, entry, openSaveAsWidgetDialog, previewData],
    );

    const openNoRightsDialog = useCallback(() => {
        setDialogNoRightsVisible(true);
    }, []);

    const onClickButtonToggleTablePreview = useCallback(() => {
        dispatch(toggleTablePreview());
    }, [dispatch]);

    const saveAsDraftClick = useCallback(() => {
        onClickButtonSave(EntryUpdateMode.Save);
    }, [onClickButtonSave]);

    const saveAsPublishedClick = useCallback(() => {
        onClickButtonSave(EntryUpdateMode.Publish);
    }, [onClickButtonSave]);

    const saveAsAction = useCallback(() => {
        if (!previewData) {
            return;
        }

        const preparedChartData = prepareChartDataBeforeSave(previewData);

        openSaveAsWidgetDialog(preparedChartData);
    }, [openSaveAsWidgetDialog, previewData]);

    const openRequestWidgetAccessRightsDialog = useCallback(() => {
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

    const additionalButtons = useQLActionPanel({
        onClickButtonToggleTablePreview,
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
                        onClickButtonSave={onClickButtonSave}
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
                onClose={() => {
                    setDialogNoRightsVisible(false);
                }}
                onAccessRights={openRequestWidgetAccessRightsDialog}
                onSaveAs={() => {
                    if (previewData) {
                        const preparedChartData = prepareChartDataBeforeSave(previewData);

                        openSaveAsWidgetDialog(preparedChartData);
                    }
                }}
            />
            {entry && (
                <DialogSettings
                    entry={entry}
                    extraSettings={extraSettings}
                    visible={dialogSettingsVisible}
                    onCancel={() => {
                        setDialogSettingsVisible(false);
                    }}
                    onApply={({
                        extraSettings: newExtraSettings,
                    }: {
                        extraSettings: CommonSharedExtraSettings;
                    }) => {
                        setDialogSettingsVisible(false);

                        if (!_isEqual(extraSettings, newExtraSettings)) {
                            dispatch(setExtraSettings({extraSettings: newExtraSettings}));

                            dispatch(
                                drawPreview({
                                    withoutTable: true,
                                }),
                            );
                        }
                    }}
                />
            )}
        </React.Fragment>
    );
};
