import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DialogControlQa} from 'shared';
import {SelectFeaturedAsync} from 'ui/components/Select/wrappers/SelectFeaturedAsync';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {useSetSelectorDialogItem} from './hooks';
import type {DynamicValueSelectorProps} from './types';
import {convertDefaultValue} from './utils';

const i18n = I18n.keyset('dash.control-dialog.edit');

export type PaginationType = {
    pageNumber: number;
    pageSize: number;
};

export const DynamicValueSelect = ({
    hasValidationError,
    hasClear,
    fetcher,
    disabled,
    onFilterChange,
    filterable,
    onRetry,
}: DynamicValueSelectorProps) => {
    const selectorDialogState = useSelector(selectSelectorDialog);
    const {multiselectable} = selectorDialogState;
    const defaultValue = convertDefaultValue(selectorDialogState.defaultValue);

    const {setSelectorDialogItem} = useSetSelectorDialogItem();

    const handleUpdate = React.useCallback(
        (val) => {
            setSelectorDialogItem({defaultValue: val});
        },
        [setSelectorDialogItem],
    );

    return (
        <SelectFeaturedAsync<any, PaginationType>
            onRetry={onRetry}
            multiple={multiselectable}
            width="max"
            popupWidth={'fit'}
            disabled={disabled}
            value={defaultValue}
            onUpdate={handleUpdate}
            fetcher={fetcher}
            onFilterChange={onFilterChange}
            placeholder={i18n('value_undefined')}
            qa={DialogControlQa.valueSelect}
            hasValidationError={hasValidationError}
            hasClear={hasClear}
            filterable={filterable}
        />
    );
};
