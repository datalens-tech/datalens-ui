import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {ParameterNameInput} from '../ParameterNameInput/ParameterNameInput';

import {ConnectionSelector} from './components/ConnectionSelector/ConnectionSelector';
import {QueryTypeControl} from './components/QueryTypeControl/QueryTypeControl';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const ConnectionSettings = ({
    navigationPath,
    changeNavigationPath,
    rowClassName,
}: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    rowClassName?: string;
}) => {
    const {connectionQueryTypes} = useSelector(selectSelectorDialog);

    return (
        <React.Fragment>
            <ConnectionSelector
                className={rowClassName}
                navigationPath={navigationPath}
                changeNavigationPath={changeNavigationPath}
            />
            {connectionQueryTypes && connectionQueryTypes.length > 0 && (
                <React.Fragment>
                    <ParameterNameInput
                        label={i18n('field_parameter-name')}
                        className={rowClassName}
                    />
                    <QueryTypeControl connectionQueryTypes={connectionQueryTypes} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
