import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {I18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import {useDispatch, useSelector} from 'react-redux';
import {
    DATASET_FIELD_TYPES,
    DATASET_IGNORED_DATA_TYPES,
    Dataset,
    DatasetFieldType,
    EntryScope,
} from 'shared';
import logger from 'ui/libs/logger';
import {
    SelectorElementType,
    SetSelectorDialogItemArgs,
    setLastUsedDatasetId,
    setSelectorDialogItem,
} from 'units/dash/store/actions/dashTyped';
import {
    selectDashWorkbookId,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

import {DatasetField} from '../../../../Control/Switchers/DatasetField/DatasetField';
import {ELEMENT_TYPE} from '../../../../Control/constants';
import {EntrySelector} from '../EntrySelector/EntrySelector';

const i18n = I18n.keyset('dash.control-dialog.edit');

const getDatasetLink = (entryId: string) => `/datasets/${entryId}`;

function DatasetSelector() {
    const dispatch = useDispatch();
    const {datasetId, datasetFieldId, isManualTitle, title, fieldType, validation} =
        useSelector(selectSelectorDialog);
    const workbookId = useSelector(selectDashWorkbookId);
    const [isValidDataset, setIsValidDataset] = React.useState(false);

    const fetchDataset = React.useCallback((entryId: string) => {
        getSdk()
            .bi.getDatasetByVersion({
                datasetId: entryId,
                workbookId,
                version: 'draft',
            })
            .then((dataset: Dataset) => {
                dispatch(
                    setSelectorDialogItem({
                        dataset,
                    }),
                );
                setIsValidDataset(true);
            })
            .catch((error) => {
                setIsValidDataset(false);
                logger.logError('DatasetSelector: load dataset failed', error);
            });
    }, []);

    React.useEffect(() => {
        if (datasetId) {
            fetchDataset(datasetId);
        }
    }, []);

    const handleDatasetChange = React.useCallback(
        (args: any) => {
            const entryId = args.entry.entryId as string;

            if (entryId !== datasetId) {
                dispatch(setLastUsedDatasetId(entryId));

                fetchDataset(entryId);

                dispatch(
                    setSelectorDialogItem({
                        datasetId: entryId,
                        datasetFieldId: undefined,
                        elementType: ELEMENT_TYPE.SELECT,
                        defaultValue: undefined,
                        useDefaultValue: false,
                    }),
                );
            }
        },
        [datasetId],
    );

    const handleDatasetFieldChange = React.useCallback(
        (data: {
            fieldId: string;
            fieldType: DATASET_FIELD_TYPES;
            fieldName: string;
            datasetFieldType: DatasetFieldType;
        }) => {
            let elementType: SelectorElementType = ELEMENT_TYPE.INPUT;

            if (datasetFieldId === data.fieldId && fieldType === data.fieldType) {
                return;
            }

            if (
                data.fieldType === DATASET_FIELD_TYPES.DATE ||
                data.fieldType === DATASET_FIELD_TYPES.GENERICDATETIME
            ) {
                elementType = ELEMENT_TYPE.DATE;
            } else if (data.fieldType === DATASET_FIELD_TYPES.STRING) {
                elementType = ELEMENT_TYPE.SELECT;
            }

            if (data.datasetFieldType === DatasetFieldType.Measure) {
                elementType = ELEMENT_TYPE.INPUT;
            }

            if (data.fieldType === DATASET_FIELD_TYPES.BOOLEAN) {
                elementType = ELEMENT_TYPE.CHECKBOX;
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
                label={i18n('field_dataset')}
                entryId={datasetId}
                scope={EntryScope.Dataset}
                handleEntryChange={handleDatasetChange}
                isValidEntry={isValidDataset}
                getEntryLink={getDatasetLink}
            />
            <FormRow label={i18n('field_field')}>
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
        </React.Fragment>
    );
}

export {DatasetSelector};
