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
    DatasetFieldType,
    EntryScope,
} from 'shared';
import logger from 'ui/libs/logger';
import {setLastUsedDatasetId, setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {ELEMENT_TYPE} from 'ui/store/constants/controlDialog';
import {selectOpenedItemMeta, selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import type {SelectorElementType, SetSelectorDialogItemArgs} from 'ui/store/typings/controlDialog';

import {DatasetField} from '../../Switchers/DatasetField/DatasetField';
import {EntrySelector} from '../EntrySelector/EntrySelector';

const i18n = I18n.keyset('dash.control-dialog.edit');

const getDatasetLink = (entryId: string) => `/datasets/${entryId}`;

function DatasetSelector(props: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
}) {
    const dispatch = useDispatch();
    const {datasetId, datasetFieldId, isManualTitle, title, fieldType, validation} =
        useSelector(selectSelectorDialog);
    const {workbookId} = useSelector(selectOpenedItemMeta);
    const [isInvalid, setIsInvalid] = React.useState(false);

    const fetchDataset = React.useCallback((entryId: string) => {
        setIsInvalid(false);

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
            })
            .catch((isInvalid) => {
                setIsInvalid(true);
                logger.logError('DatasetSelector: load dataset failed', isInvalid);
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
                onChange={handleDatasetChange}
                isInvalid={isInvalid}
                workbookId={workbookId}
                getEntryLink={getDatasetLink}
                navigationPath={props.navigationPath}
                changeNavigationPath={props.changeNavigationPath}
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
