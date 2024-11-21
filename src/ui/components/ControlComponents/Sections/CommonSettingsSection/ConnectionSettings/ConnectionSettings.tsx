import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {RequiredValueCheckbox} from '../../ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {ParameterNameInput} from '../ParameterNameInput/ParameterNameInput';

import {ConnectionSelector} from './components/ConnectionSelector/ConnectionSelector';
import {QueryTypeControl} from './components/QueryTypeControl/QueryTypeControl';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const ConnectionSettings = ({
    hideCommonFields,
    navigationPath,
    changeNavigationPath,
}: {
    hideCommonFields?: boolean;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
}) => {
    const {connectionQueryTypes} = useSelector(selectSelectorDialog);

    return (
        <React.Fragment>
            <ConnectionSelector
                navigationPath={navigationPath}
                changeNavigationPath={changeNavigationPath}
            />
            {connectionQueryTypes && connectionQueryTypes.length > 0 && (
                <React.Fragment>
                    <ParameterNameInput label={i18n('field_parameter-name')} />
                    <QueryTypeControl connectionQueryTypes={connectionQueryTypes} />
                    {!hideCommonFields && (
                        <React.Fragment>
                            <InputTypeSelector />
                            <RequiredValueCheckbox />
                            <ValueSelector />
                        </React.Fragment>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
