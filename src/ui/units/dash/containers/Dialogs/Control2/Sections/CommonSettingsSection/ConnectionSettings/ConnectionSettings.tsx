import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

import {selectWorkbookId} from '../../../../../../../workbooks/store/selectors';
import {selectSelectorDialog} from '../../../../../../store/selectors/dashTypedSelectors';
import {ELEMENT_TYPE} from '../../../../Control/constants';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import type {ValueSelectorControlProps} from '../../ValueSelector/types';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {ParameterNameInput} from '../ParameterNameInput/ParameterNameInput';
import {getElementOptions} from '../helpers/input-type-select';

import {ConnectionSelector} from './components/ConnectionSelector/ConnectionSelector';
import {QueryTypeControl} from './components/QueryTypeControl/QueryTypeControl';
import {getDistinctsByTypedQuery} from './helpers/get-distincts-by-typed-query';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const ConnectionSettings: React.FC = () => {
    const {
        connectionQueryTypes,
        connectionId,
        connectionQueryContent,
        connectionQueryType,
        selectorParameters,
    } = useSelector(selectSelectorDialog);
    const workbookId = useSelector(selectWorkbookId);

    const options = React.useMemo(() => {
        const allowedOptions: Record<string, boolean> = {
            [ELEMENT_TYPE.SELECT]: true,
            [ELEMENT_TYPE.INPUT]: true,
        };
        return getElementOptions().filter(({value}) => allowedOptions[value]);
    }, []);

    const fetcher = React.useCallback(
        () =>
            getDistinctsByTypedQuery({
                workbookId,
                connectionId,
                connectionQueryContent,
                connectionQueryType,
                parameters: selectorParameters || {},
            }),
        [connectionId, connectionQueryContent, connectionQueryType, workbookId, selectorParameters],
    );

    const controlProps: ValueSelectorControlProps = React.useMemo((): ValueSelectorControlProps => {
        return {
            select: {
                type: 'dynamic',
                custom: {
                    fetcher,
                    disabled: !connectionId || !connectionQueryContent || !connectionQueryType,
                    filterable: false,
                    onRetry: fetcher,
                },
                hasMultiselect: false,
            },
        };
    }, [connectionId, connectionQueryContent, connectionQueryType, fetcher]);

    return (
        <React.Fragment>
            <ConnectionSelector />
            {connectionQueryTypes && connectionQueryTypes.length > 0 && (
                <React.Fragment>
                    <ParameterNameInput
                        // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
                        label={i18n('field_parameter-name')}
                    />
                    <QueryTypeControl connectionQueryTypes={connectionQueryTypes} />
                    <InputTypeSelector options={options} />
                    <ValueSelector controlProps={controlProps} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
