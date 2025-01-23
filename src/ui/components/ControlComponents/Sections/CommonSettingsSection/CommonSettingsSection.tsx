import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DashTabItemControlSourceType} from 'shared';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {ConnectionSettings} from './ConnectionSettings/ConnectionSettings';
import {DatasetSelector} from './DatasetSelector/DatasetSelector';
import {ExternalSelectorSettings} from './ExternalSelectorSettings/ExternalSelectorSettings';
import {ParameterNameInput} from './ParameterNameInput/ParameterNameInput';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const CommonSettingsSection = ({
    navigationPath,
    changeNavigationPath,
    enableAutoheightDefault,
    className,
}: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    enableAutoheightDefault?: boolean;
    className?: string;
}) => {
    const {sourceType} = useSelector(selectSelectorDialog);

    switch (sourceType) {
        case DashTabItemControlSourceType.External:
            return (
                <ExternalSelectorSettings
                    rowClassName={className}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                    enableAutoheightDefault={enableAutoheightDefault}
                />
            );
        case DashTabItemControlSourceType.Manual:
            return (
                <ParameterNameInput
                    label={i18n('field_field-name')}
                    note={i18n('field_field-name-note')}
                    className={className}
                />
            );
        case DashTabItemControlSourceType.Connection:
            return (
                <ConnectionSettings
                    rowClassName={className}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                />
            );
        default:
            return (
                <DatasetSelector
                    rowClassName={className}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                />
            );
    }
};
