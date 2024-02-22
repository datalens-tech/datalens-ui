import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {type ConnectionQueryType, ConnectionQueryTypeValues} from 'shared';

import {setSelectorDialogItem} from '../../../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../../../store/selectors/dashTypedSelectors';

import {EditQueryControl} from './components/EditQueryControl/EditQueryControl';
import {prepareQueryTypeSelectorOptions} from './helpers';

const i18nConnectionBasedControlFake = (str: string) => str;

const renderQueryContentControl = (connectionQueryType: ConnectionQueryTypeValues | undefined) => {
    switch (connectionQueryType) {
        case ConnectionQueryTypeValues.GenericQuery:
            return <EditQueryControl />;
        default:
            return null;
    }
};

type QueryTypeControlProps = {
    connectionQueryTypes: ConnectionQueryType[];
};

export const QueryTypeControl: React.FC<QueryTypeControlProps> = (props: QueryTypeControlProps) => {
    const dispatch = useDispatch();

    const {connectionQueryType} = useSelector(selectSelectorDialog);
    const {connectionQueryTypes} = props;

    const options = prepareQueryTypeSelectorOptions(connectionQueryTypes);

    const handleQueryTypeUpdate = React.useCallback(
        (selected: string[]) => {
            const value = selected[0] as ConnectionQueryTypeValues;
            dispatch(setSelectorDialogItem({connectionQueryType: value}));
        },
        [dispatch],
    );

    return (
        <React.Fragment>
            <FormRow label={i18nConnectionBasedControlFake('field_query-type')}>
                <Select
                    width="max"
                    options={options}
                    value={connectionQueryType ? [connectionQueryType] : []}
                    onUpdate={handleQueryTypeUpdate}
                    placeholder={i18nConnectionBasedControlFake('placeholder_not-defined')}
                />
            </FormRow>
            {renderQueryContentControl(connectionQueryType)}
        </React.Fragment>
    );
};
