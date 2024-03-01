import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
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
const i18nConnectionBasedControlFake = (str: string) => str;

export const ConnectionSettings: React.FC = () => {
    const {connectionQueryTypes, connectionId, connectionQueryContent, connectionQueryType} =
        useSelector(selectSelectorDialog);
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
                parameters: [],
            }),
        [connectionId, connectionQueryContent, connectionQueryType, workbookId],
    );

    const controlProps: ValueSelectorControlProps = React.useMemo((): ValueSelectorControlProps => {
        return {
            select: {
                type: 'dynamic',
                custom: {
                    fetcher,
                    disabled: !connectionId || !connectionQueryContent || !connectionQueryType,
                    filterable: false,
                },
                hasMultiselect: false,
            },
        };
    }, [connectionId, connectionQueryContent, connectionQueryType, fetcher]);

    return (
        <SectionWrapper title={i18n('label_common-settings')}>
            <ConnectionSelector />
            {connectionQueryTypes?.length && connectionQueryTypes.length > 0 && (
                <React.Fragment>
                    <ParameterNameInput
                        label={i18nConnectionBasedControlFake('field_parameter-name')}
                    />
                    <QueryTypeControl connectionQueryTypes={connectionQueryTypes} />
                    <InputTypeSelector options={options} />
                    <ValueSelector controlProps={controlProps} />
                </React.Fragment>
            )}
        </SectionWrapper>
    );
};
