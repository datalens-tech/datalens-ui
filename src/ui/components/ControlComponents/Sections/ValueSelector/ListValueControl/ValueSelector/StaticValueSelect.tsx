import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {ControlQA} from 'shared';
import {SelectFeatured} from 'ui/components/Select/wrappers/SelectFeatured';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {useSetSelectorDialogItem} from './hooks';
import type {StaticValueSelectorProps} from './types';
import {convertDefaultValue} from './utils';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const StaticValueSelect = ({hasValidationError, hasClear}: StaticValueSelectorProps) => {
    const {
        acceptableValues = [],
        defaultValue,
        multiselectable,
    } = useSelector(selectSelectorDialog);
    const {setSelectorDialogItem} = useSetSelectorDialogItem();

    const handleUpdate = React.useCallback(
        (val) => {
            //TODO: tradeoff to bring deselect for single select
            const newValue = !multiselectable && val[0] === defaultValue?.[0] ? [] : val;
            setSelectorDialogItem({defaultValue: newValue});
        },
        [setSelectorDialogItem, multiselectable, defaultValue],
    );

    const value = convertDefaultValue(defaultValue);

    const options = acceptableValues
        ?.filter((opt) => opt.value !== null && opt.value !== '')
        .map((opt) => {
            return {
                value: opt.value,
                content: opt.title,
            };
        });

    return (
        <SelectFeatured
            qa={ControlQA.selectDefaultAcceptable}
            disabled={!acceptableValues || !acceptableValues.length}
            multiple={multiselectable}
            filterPlaceholder={i18n('placeholder_search')}
            width="max"
            popupWidth={'fit'}
            value={value}
            options={options}
            onUpdate={handleUpdate}
            placeholder={i18n('value_undefined')}
            hasValidationError={hasValidationError}
            hasClear={hasClear}
        />
    );
};
