import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {I18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import {useDispatch, useSelector} from 'react-redux';
import type {Dataset} from 'shared';
import {
    DATASET_FIELD_TYPES,
    DATASET_IGNORED_DATA_TYPES,
    DashTabItemControlElementType,
    DatasetFieldType,
    EntryScope,
} from 'shared';
import logger from 'ui/libs/logger';
import {
    setLastUsedDatasetId,
    setSelectorDialogItem,
} from 'ui/store/actions/controlDialog/controlDialog';
import {
    selectOpenedItemMeta,
    selectSelectorDialog,
    selectSelectorsGroup,
} from 'ui/store/selectors/controlDialog';
import type {SelectorElementType, SetSelectorDialogItemArgs} from 'ui/store/typings/controlDialog';

import {DatasetField} from '../../Switchers/DatasetField/DatasetField';
import {EntrySelector} from '../EntrySelector/EntrySelector';
import {ImpactTypeSelect} from '../ImpactTypeSelect/ImpactTypeSelect';

const i18n = I18n.keyset('dash.control-dialog.edit');

const getDatasetLink = (entryId: string) => `/datasets/${entryId}`;

function DatasetSelectorSettings(props: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    rowClassName?: string;
    enableGlobalSelectors?: boolean;
}) {
    const dispatch = useDispatch();
    const {datasetId, datasetFieldId, isManualTitle, title, fieldType, validation} =
        useSelector(selectSelectorDialog);
    const {workbookId} = useSelector(selectOpenedItemMeta);
    const {impactType, impactTabsIds, group} = useSelector(selectSelectorsGroup);
    const [isInvalid, setIsInvalid] = React.useState(false);

    const fetchDataset = React.useCallback((entryId: string) => {
        setIsInvalid(false);

        getSdk()
            .sdk.bi.getDatasetByVersion({
                datasetId: entryId,
                workbookId,
            })
            .then((dataset: Dataset) => {
                dispatch(
                    setSelectorDialogItem({
                        dataset,
                    }),
                );
            })
            .catch((isInvalid) => {
                setIsInvalid(true);
                logger.logError('DatasetSelectorSettings: load dataset failed', isInvalid);
            });
    }, []);

    React.useEffect(() => {
        if (datasetId) {
            fetchDataset(datasetId);
        }
    }, []);

    const handleDatasetChange = React.useCallback(
        ({entryId}: {entryId: string}) => {
            if (entryId !== datasetId) {
                dispatch(setLastUsedDatasetId(entryId));

                fetchDataset(entryId);

                dispatch(
                    setSelectorDialogItem({
                        datasetId: entryId,
                        datasetFieldId: undefined,
                        elementType: DashTabItemControlElementType.Select,
                        defaultValue: undefined,
                        useDefaultValue: false,
                    }),
                );
            }
        },
        [datasetId],
    );

    const handleDatasetFieldChange = React.useCallback(
        (
            data: {
                fieldId: string;
                fieldType: DATASET_FIELD_TYPES;
                fieldName: string;
                datasetFieldType: DatasetFieldType;
            } | null,
        ) => {
            let elementType: SelectorElementType = DashTabItemControlElementType.Input;

            if (data === null) {
                const newItem: SetSelectorDialogItemArgs = {
                    datasetFieldId: undefined,
                    elementType,
                    fieldType: undefined,
                    datasetFieldType: undefined,
                };
                if (datasetFieldId) {
                    // show error if field was deleted from dataset
                    newItem.validation = {datasetFieldId: i18n('validation_field-not-found')};
                }

                dispatch(setSelectorDialogItem(newItem));
                return;
            }

            if (datasetFieldId === data.fieldId && fieldType === data.fieldType) {
                return;
            }

            if (
                data.fieldType === DATASET_FIELD_TYPES.DATE ||
                data.fieldType === DATASET_FIELD_TYPES.GENERICDATETIME
            ) {
                elementType = DashTabItemControlElementType.Date;
            } else if (data.fieldType === DATASET_FIELD_TYPES.STRING) {
                elementType = DashTabItemControlElementType.Select;
            }

            if (data.datasetFieldType === DatasetFieldType.Measure) {
                elementType = DashTabItemControlElementType.Input;
            }

            if (data.fieldType === DATASET_FIELD_TYPES.BOOLEAN) {
                elementType = DashTabItemControlElementType.Checkbox;
            }

            const args: SetSelectorDialogItemArgs = {
                datasetFieldId: data.fieldId,
                elementType,
                fieldType: data.fieldType,
                datasetFieldType: data.datasetFieldType,
            };

            if (!isManualTitle || !title) {
                args.title = data.fieldName;
            }

            dispatch(setSelectorDialogItem(args));
        },
        [datasetFieldId, isManualTitle, title],
    );

    return (
        <React.Fragment>
            <EntrySelector
                className={props.rowClassName}
                label={i18n('field_dataset')}
                entryId={datasetId}
                scope={EntryScope.Dataset}
                onChange={handleDatasetChange}
                isInvalid={isInvalid}
                workbookId={workbookId}
                getEntryLink={getDatasetLink}
                navigationPath={props.navigationPath}
                changeNavigationPath={props.changeNavigationPath}
            />
            <FormRow label={i18n('field_field')} className={props.rowClassName}>
                <FieldWrapper error={validation.datasetFieldId}>
                    <DatasetField
                        ignoredFieldTypes={[]}
                        ignoredDataTypes={DATASET_IGNORED_DATA_TYPES}
                        datasetId={datasetId}
                        workbookId={workbookId}
                        fieldId={datasetFieldId}
                        onChange={handleDatasetFieldChange}
                        hasValidationError={Boolean(validation.datasetFieldId)}
                    />
                </FieldWrapper>
            </FormRow>
            {props.enableGlobalSelectors && (
                <ImpactTypeSelect
                    hasMultipleSelectors={group.length > 1}
                    groupImpactType={impactType}
                    groupImpactTabsIds={impactTabsIds}
                ></ImpactTypeSelect>
            )}
        </React.Fragment>
    );
}

export {DatasetSelectorSettings};
