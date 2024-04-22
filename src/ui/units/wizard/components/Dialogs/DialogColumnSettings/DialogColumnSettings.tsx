import React from 'react';

import {Button, Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import {DialogColumnSettingsQa, Feature, Field, WizardVisualizationId} from 'shared';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import Utils from '../../../../../utils';
import {DialogRow} from '../components/DialogRow/DialogRow';

import {ColumnWidthSettingsSection} from './components/ColumnWidthSettingsSection/ColumnWidthSettingsSection';
import {Subheader} from './components/Subheader/Subheader';
import {
    ColumnSettingsState,
    useDialogColumnSettingsState,
} from './hooks/useDialogColumnSettingsState';

import './DialogColumnSettings.scss';

export type DialogColumnSettingsFields = {
    columns: Field[];
    rows: Field[];
};

type OnApplyArgs = {
    fields: {columns: ColumnSettingsState; rows: ColumnSettingsState};
    pinnedColumns?: number;
};

type DialogColumnSettingsProps = {
    fields: DialogColumnSettingsFields;
    onClose: () => void;
    onApply: (args: OnApplyArgs) => void;
    visualizationId: WizardVisualizationId;
    pinnedColumns?: number;
};

export type OpenDialogColumnSettingsArgs = {
    id: typeof DIALOG_COLUMN_SETTINGS;
    props: DialogColumnSettingsProps;
};

export const DIALOG_COLUMN_SETTINGS = Symbol('DIALOG_COLUMN_SETTINGS');

const b = block('dialog-column-settings');

export const DialogColumnSettings: React.FC<DialogColumnSettingsProps> = (
    props: DialogColumnSettingsProps,
) => {
    const {onClose, onApply, visualizationId} = props;

    const {
        handleOnResetClick,
        fields,
        handleWidthUpdate,
        errors,
        handleErrorOccurred,
        pinnedColumns,
        handleChangeFrozenColumnsNumber,
    } = useDialogColumnSettingsState({
        initialFields: props.fields,
        pinnedColumns: props.pinnedColumns,
    });

    const isPivotTableDialog = visualizationId === WizardVisualizationId.PivotTable;
    const dialogTitle = isPivotTableDialog
        ? i18n('wizard', 'label_pivot-table-title-dialog-column-settings')
        : i18n('wizard', 'label_title-dialog-column-settings');
    const canPinColumns = !isPivotTableDialog && Utils.isEnabledFeature(Feature.PinnedColumns);

    return (
        <Dialog
            onClose={() => onClose()}
            qa={DialogColumnSettingsQa.Dialog}
            open={true}
            className={b()}
        >
            <Dialog.Header
                className={b('header')}
                caption={
                    <div className={b('title')}>
                        <span className={b('dialog-title')}>{dialogTitle}</span>
                        {isPivotTableDialog && (
                            <span className={b('subtitle')}>
                                {i18n('wizard', 'label_dialog-column-info-text')}
                            </span>
                        )}
                    </div>
                }
            />
            <Dialog.Body className={b('content')}>
                {canPinColumns && (
                    <div className={b('freeze-settings')}>
                        <DialogRow
                            title={
                                <Subheader
                                    title={i18n('wizard', 'label_column-freeze')}
                                    tooltip={i18n('wizard', 'label_column-freeze-tooltip')}
                                />
                            }
                            customGapBetweenTitleAndSetting="16px"
                            titleCustomWidth="178px"
                            setting={
                                <TextInput
                                    type={'number'}
                                    hasClear={Boolean(pinnedColumns)}
                                    value={String(pinnedColumns)}
                                    onChange={handleChangeFrozenColumnsNumber}
                                    controlProps={{min: 0}}
                                    className={b('frozen-columns-input')}
                                />
                            }
                        />
                    </div>
                )}
                {!isEmpty(fields.columns) && (
                    <React.Fragment>
                        {!isPivotTableDialog && (
                            <DialogRow
                                title={
                                    <Subheader
                                        title={i18n('wizard', 'label_column-width')}
                                        tooltip={i18n('wizard', 'label_dialog-column-info-text')}
                                    />
                                }
                                setting={''}
                            />
                        )}
                        <ColumnWidthSettingsSection
                            fields={fields.columns}
                            onError={(fieldId, error) => {
                                handleErrorOccurred(fieldId, error);
                            }}
                            onUpdate={handleWidthUpdate}
                            withCollapse={isPivotTableDialog}
                            fieldPlaceholder="columns"
                            title={i18n('wizard', 'section_columns')}
                        />
                    </React.Fragment>
                )}
                {!isEmpty(fields.rows) && (
                    <ColumnWidthSettingsSection
                        fields={fields.rows}
                        onError={(fieldId, error) => {
                            handleErrorOccurred(fieldId, error);
                        }}
                        onUpdate={handleWidthUpdate}
                        withCollapse={isPivotTableDialog}
                        fieldPlaceholder="rows"
                        title={i18n('wizard', 'section_rows')}
                    />
                )}
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                showError={false}
                listenKeyEnter={true}
                onClickButtonApply={() => onApply({fields, pinnedColumns})}
                onClickButtonCancel={() => onClose()}
                propsButtonApply={{
                    qa: DialogColumnSettingsQa.ApplyButton,
                    disabled: Object.keys(errors).some((fieldId) => errors[fieldId]),
                }}
                propsButtonCancel={{qa: DialogColumnSettingsQa.CancelButton}}
                textButtonApply={i18n('wizard', 'button_apply')}
                textButtonCancel={i18n('wizard', 'button_cancel')}
            >
                <Button
                    type="button"
                    size="l"
                    view="outlined"
                    onClick={handleOnResetClick}
                    qa={DialogColumnSettingsQa.ResetButton}
                >
                    {i18n('wizard', 'button_reset')}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_COLUMN_SETTINGS, DialogColumnSettings);
