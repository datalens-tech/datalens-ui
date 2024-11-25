import React from 'react';

import {useSelector} from 'react-redux';
import {DashTabItemControlSourceType} from 'shared';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import {ConnectionSettings} from './ConnectionSettings/ConnectionSettings';
import {DatasetSettings} from './DatasetSettings/DatasetSettings';
import {ExternalSelectorSettings} from './ExternalSelectorSettings/ExternalSelectorSettings';
import {InputSettings} from './InputSettings/InputSettings';

// TODO: Remove hideCommonFields and related fields after enabling DLPROJECTS-93
export const CommonSettingsSection = ({
    hideCommonFields,
    navigationPath,
    changeNavigationPath,
    enableAutoheightDefault,
}: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    hideCommonFields?: boolean;
    enableAutoheightDefault?: boolean;
}) => {
    const {sourceType} = useSelector(selectSelectorDialog);

    switch (sourceType) {
        case DashTabItemControlSourceType.External:
            return (
                <ExternalSelectorSettings
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                    enableAutoheightDefault={enableAutoheightDefault}
                />
            );
        case DashTabItemControlSourceType.Manual:
            return <InputSettings hideCommonFields={hideCommonFields} />;
        case DashTabItemControlSourceType.Connection:
            return (
                <ConnectionSettings
                    hideCommonFields={hideCommonFields}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                />
            );
        default:
            return (
                <DatasetSettings
                    hideCommonFields={hideCommonFields}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                />
            );
    }
};
