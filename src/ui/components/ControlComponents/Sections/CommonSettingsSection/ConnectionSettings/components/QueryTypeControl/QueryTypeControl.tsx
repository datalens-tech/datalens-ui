import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {StringParams} from '@gravity-ui/dashkit';
import {Select} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
    type ConnectionQueryTypeOptions,
    ConnectionQueryTypeValues,
    type ConnectionRequiredParameter,
} from 'shared';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {EditLabelControl} from './components/EditLabelControl/EditLabelControl';
import {EditQueryControl} from './components/EditQueryControl/EditQueryControl';
import {prepareQueryTypeSelectorOptions} from './helpers';
const i18n = I18n.keyset('dash.control-dialog.edit');

const renderQueryContentControl = (connectionQueryType: ConnectionQueryTypeValues | undefined) => {
    switch (connectionQueryType) {
        case ConnectionQueryTypeValues.GenericQuery:
            return <EditQueryControl />;
        case ConnectionQueryTypeValues.GenericLabelValues:
            return <EditLabelControl />;
        default:
            return null;
    }
};

type QueryTypeControlProps = {
    connectionQueryTypes: ConnectionQueryTypeOptions[];
};

const prepareRequiredParameters = (params: ConnectionRequiredParameter[]): StringParams =>
    params.reduce((acc, param) => Object.assign(acc, {[param.name]: ''}), {} as StringParams);

export const QueryTypeControl: React.FC<QueryTypeControlProps> = (props: QueryTypeControlProps) => {
    const dispatch = useDispatch();

    const {connectionQueryType, connectionId} = useSelector(selectSelectorDialog);

    const {connectionQueryTypes} = props;

    React.useEffect(() => {
        if (!connectionQueryType && connectionQueryTypes.length === 1) {
            const {query_type, required_parameters} = connectionQueryTypes[0];
            dispatch(
                setSelectorDialogItem({
                    connectionQueryType: query_type,
                    selectorParameters: prepareRequiredParameters(required_parameters),
                }),
            );
        }
    }, [connectionId]);

    const options = prepareQueryTypeSelectorOptions(connectionQueryTypes);

    const handleQueryTypeUpdate = React.useCallback(
        (selected: string[]) => {
            const value = selected[0] as ConnectionQueryTypeValues;

            const selectedQueryType = connectionQueryTypes.find((f) => f.query_type === value);

            if (!selectedQueryType) {
                throw new Error(`Unsupported query type value selected, ${value}`);
            }

            const {query_type, required_parameters} = selectedQueryType;

            dispatch(
                setSelectorDialogItem({
                    connectionQueryType: query_type,
                    selectorParameters: prepareRequiredParameters(required_parameters),
                }),
            );
        },
        [dispatch],
    );

    return (
        <React.Fragment>
            {options.length > 1 && (
                <FormRow label={i18n('field_query-type')}>
                    <Select
                        width="max"
                        options={options}
                        value={connectionQueryType ? [connectionQueryType] : []}
                        onUpdate={handleQueryTypeUpdate}
                        placeholder={i18n('value_undefined')}
                    />
                </FormRow>
            )}
            {renderQueryContentControl(connectionQueryType)}
        </React.Fragment>
    );
};
