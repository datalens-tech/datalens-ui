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
    className,
}: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    hideCommonFields?: boolean;
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
            return <InputSettings rowClassName={className} hideCommonFields={hideCommonFields} />;
        case DashTabItemControlSourceType.Connection:
            return (
                <ConnectionSettings
                    rowClassName={className}
                    hideCommonFields={hideCommonFields}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                />
            );
        default:
            return (
                <DatasetSettings
                    rowClassName={className}
                    hideCommonFields={hideCommonFields}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                />
            );
    }
};
