import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Select} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {type ConnectionQueryTypeOptions, ConnectionQueryTypeValues} from 'shared';

import {setSelectorDialogItem} from '../../../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../../../store/selectors/dashTypedSelectors';

import {EditLabelControl} from './components/EditLabelControl/EditLabelControl';
import {EditQueryControl} from './components/EditQueryControl/EditQueryControl';
import {prepareQueryTypeSelectorOptions} from './helpers';
// @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
const i18n = I18n.keyset('dash.edit-query-dialog');

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

export const QueryTypeControl: React.FC<QueryTypeControlProps> = (props: QueryTypeControlProps) => {
    const dispatch = useDispatch();

    const {connectionQueryType, connectionId} = useSelector(selectSelectorDialog);

    const {connectionQueryTypes} = props;

    React.useEffect(() => {
        if (!connectionQueryType && connectionQueryTypes.length === 1) {
            dispatch(
                setSelectorDialogItem({connectionQueryType: connectionQueryTypes[0].query_type}),
            );
        }
    }, [connectionId]);

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
            {options.length > 1 && (
                // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
                <FormRow label={i18n('field_query-type')}>
                    <Select
                        width="max"
                        options={options}
                        value={connectionQueryType ? [connectionQueryType] : []}
                        onUpdate={handleQueryTypeUpdate}
                        // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
                        placeholder={i18n('placeholder_not-defined')}
                    />
                </FormRow>
            )}
            {renderQueryContentControl(connectionQueryType)}
        </React.Fragment>
    );
};
