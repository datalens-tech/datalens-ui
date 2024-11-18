import React from 'react';

import {RadioButton, Select} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DashTabItemControlSourceType, DialogControlQa, Feature} from 'shared';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import Utils from 'ui/utils';

const i18n = I18n.keyset('dash.control-dialog.edit');

const CONTROL_SOURCE_TYPES = [
    {
        title: i18n('value_source-dataset'),
        value: DashTabItemControlSourceType.Dataset,
    },
    {
        title: i18n('value_source-connection'),
        value: DashTabItemControlSourceType.Connection,
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
    showExternalType?: boolean;
    mode?: 'radio-button' | 'select';
};

const SelectorTypeSelect = ({
    mode = 'radio-button',
    showExternalType = true,
}: SelectorTypeSelectProps) => {
    const dispatch = useDispatch();
    const {sourceType} = useSelector(selectSelectorDialog);

    const handleSourceTypeChange = React.useCallback(
        (value: string[] | string) => {
            const sourceTypeValue = (
                typeof value === 'string' ? value : value[0]
            ) as DashTabItemControlSourceType;
            dispatch(
                setSelectorDialogItem({
                    sourceType: sourceTypeValue,
                    fieldType: undefined,
                }),
            );
        },
        [dispatch],
    );

    const options = React.useMemo(() => {
        const availabilityMap = {
            [DashTabItemControlSourceType.Dataset]: true,
            [DashTabItemControlSourceType.Manual]: true,
            [DashTabItemControlSourceType.External]:
                Utils.isEnabledFeature(Feature.ExternalSelectors) && showExternalType,
            [DashTabItemControlSourceType.Connection]: Utils.isEnabledFeature(
                Feature.ConnectionBasedControl,
            ),
        };

        return CONTROL_SOURCE_TYPES.filter(({value}) => availabilityMap[value]);
    }, [showExternalType]);

    return (
        <React.Fragment>
            {mode === 'select' ? (
                <Select
                    value={[sourceType || DashTabItemControlSourceType.Dataset]}
                    onUpdate={handleSourceTypeChange}
                    width="max"
                    options={options.map((item) => ({
                        value: item.value,
                        content: item.title,
                        qa: item.value,
                    }))}
                    qa={DialogControlQa.seletSourceType}
                />
            ) : (
                <RadioButton
                    value={sourceType}
                    onUpdate={handleSourceTypeChange}
                    size="l"
                    width="max"
                    qa={DialogControlQa.radioSourceType}
                >
                    {options.map((item) => (
                        <RadioButton.Option key={item.value} value={item.value}>
                            {item.title}
                        </RadioButton.Option>
                    ))}
                </RadioButton>
            )}
        </React.Fragment>
    );
};

export {SelectorTypeSelect};
