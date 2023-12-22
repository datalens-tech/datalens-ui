import React from 'react';

import {RadioButton, RadioButtonSize} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DashTabItemControlSourceType, DialogControlQa, Feature} from 'shared';
import Utils from 'ui/utils';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

const i18n = I18n.keyset('dash.control-dialog.edit');

const CONTROL_SOURCE_TYPES = [
    {
        title: i18n('value_source-dataset'),
        value: DashTabItemControlSourceType.Dataset,
    },
    {
        title: i18n('value_source-manual'),
        value: DashTabItemControlSourceType.Manual,
    },
    {
        title: i18n('value_source-external'),
        value: DashTabItemControlSourceType.External,
    },
];

type SelectorTypeSelectProps = {
    size?: RadioButtonSize;
    showExternalType?: boolean;
};

const SelectorTypeSelect = ({size = 'l', showExternalType = true}: SelectorTypeSelectProps) => {
    const dispatch = useDispatch();
    const {sourceType} = useSelector(selectSelectorDialog);

    const handleSourceTypeChange = React.useCallback((value: string) => {
        dispatch(
            setSelectorDialogItem({
                sourceType: value as DashTabItemControlSourceType,
                fieldType: undefined,
            }),
        );
    }, []);

    let options;

    if (Utils.isEnabledFeature(Feature.ExternalSelectors) && showExternalType) {
        options = CONTROL_SOURCE_TYPES;
    } else {
        options = CONTROL_SOURCE_TYPES.filter(
            (item) => item.value !== DashTabItemControlSourceType.External,
        );
    }

    return (
        <RadioButton
            value={sourceType}
            onUpdate={handleSourceTypeChange}
            size={size}
            width="max"
            qa={DialogControlQa.radioSourceType}
        >
            {options.map((item) => (
                <RadioButton.Option key={item.value} value={item.value}>
                    {item.title}
                </RadioButton.Option>
            ))}
        </RadioButton>
    );
};

export {SelectorTypeSelect};
