import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Alert, Dialog, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DATASET_FIELD_TYPES, DatasetFieldAggregation} from 'shared';
import DialogManager from 'ui/components/DialogManager/DialogManager';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';
import {getTypeSelectOptions} from 'ui/utils/getTypeSelectOptions';
import {getDatasetLabelValue} from 'ui/utils/helpers';

import type {BatchUpdateFields} from '../../../../types';

import './DialogChangeDatasetFields.scss';

const b = block('dl-dataset-dialog-change-fields');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

export const DIALOG_CHANGE_DATASET_FIELDS = Symbol('DIALOG_CHANGE_DATASET_FIELDS');

export type OpenDialogChangeDatasetFieldsArgs = {
    id: typeof DIALOG_CHANGE_DATASET_FIELDS;
    props: DialogChangeDatasetFieldsProps;
};

export interface DialogChangeDatasetFieldsProps {
    open: boolean;
    onClose: () => void;
    label: string;
    warningMessage: React.ReactNode;
    title: string;
    fieldsGuids: string[];
    batchUpdateFields: BatchUpdateFields;
    onApply: () => void;
    types?: DATASET_FIELD_TYPES[];
    aggregations?: DatasetFieldAggregation[];
}

export const DialogChangeDatasetFields = ({
    open,
    onClose,
    warningMessage,
    label,
    title,
    fieldsGuids,
    batchUpdateFields,
    onApply,
    types = [],
    aggregations = [],
}: DialogChangeDatasetFieldsProps) => {
    const typeItems = getTypeSelectOptions(types);
    const aggregationsItems: SelectOption[] = aggregations.map((aggr) => ({
        value: aggr,
        content: getDatasetLabelValue(aggr),
    }));
    const isAggregationsDialog = Boolean(aggregationsItems.length);

    const [selectedType, setSelectedType] = React.useState(
        typeItems.length ? typeItems[0].value : '',
    );
    const [selectedAggregation, setSelectedAggregation] = React.useState(
        aggregationsItems.length ? aggregationsItems[0].value : '',
    );

    const handleApply = () => {
        batchUpdateFields({
            updatePreview: true,
            fields: fieldsGuids.map((guid) => ({
                guid,
                ...(selectedType && {cast: selectedType as DATASET_FIELD_TYPES}),
                ...(selectedAggregation && {
                    aggregation: selectedAggregation as DatasetFieldAggregation,
                }),
            })),
        });
        onClose();
        onApply();
    };

    const renderTypeOption = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

    const handleTypeSelect = (value: string[]) => {
        setSelectedType(value[0] as DATASET_FIELD_TYPES);
    };

    const handleAggregationSelect = (value: string[]) => {
        setSelectedAggregation(value[0] as DatasetFieldAggregation);
    };

    return (
        <Dialog open={open} onClose={onClose} size="s">
            <Dialog.Header caption={title} />
            <Dialog.Body>
                <Alert theme="info" message={<div>{warningMessage}</div>} layout="horizontal" />
                <div className={b('content')}>
                    <span>{label}</span>
                    {Boolean(typeItems.length) && (
                        <Select
                            options={typeItems}
                            className={b('select')}
                            onUpdate={handleTypeSelect}
                            value={[selectedType]}
                            renderSelectedOption={renderTypeOption}
                            renderOption={renderTypeOption}
                        />
                    )}
                    {isAggregationsDialog && (
                        <Select
                            options={aggregationsItems}
                            className={b('select')}
                            onUpdate={handleAggregationSelect}
                            value={[selectedAggregation]}
                        />
                    )}
                </div>
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel={i18n('button_batch-cancel')}
                textButtonApply={i18n('button_batch-apply')}
                onClickButtonApply={handleApply}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_CHANGE_DATASET_FIELDS, DialogChangeDatasetFields);
