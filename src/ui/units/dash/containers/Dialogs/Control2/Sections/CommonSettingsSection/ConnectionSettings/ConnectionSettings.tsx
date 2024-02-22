import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
import {selectSelectorDialog} from '../../../../../../store/selectors/dashTypedSelectors';
import {ELEMENT_TYPE} from '../../../../Control/constants';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {getElementOptions} from '../helpers/input-type-select';

import {ConnectionSelector} from './components/ConnectionSelector/ConnectionSelector';
import {QueryTypeControl} from './components/QueryTypeControl/QueryTypeControl';

const i18n = I18n.keyset('dash.control-dialog.edit');
export const ConnectionSettings: React.FC = () => {
    const {connectionQueryTypes} = useSelector(selectSelectorDialog);

    const options = React.useMemo(() => {
        const allowedOptions: Record<string, boolean> = {
            [ELEMENT_TYPE.SELECT]: true,
            [ELEMENT_TYPE.INPUT]: true,
        };
        return getElementOptions().filter(({value}) => allowedOptions[value]);
    }, []);

    return (
        <SectionWrapper title={i18n('label_common-settings')}>
            <ConnectionSelector />
            {connectionQueryTypes?.length ? (
                <React.Fragment>
                    <QueryTypeControl connectionQueryTypes={connectionQueryTypes} />
                    <InputTypeSelector options={options} />
                    <ValueSelector />
                </React.Fragment>
            ) : null}
        </SectionWrapper>
    );
};
