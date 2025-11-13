import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DashTabItemControlSourceType} from 'shared';
import {selectSelectorDialog, selectSelectorsGroup} from 'ui/store/selectors/controlDialog';

import {ConnectionSettings} from './ConnectionSettings/ConnectionSettings';
import {DatasetSelectorSettings} from './DatasetSelectorSettings/DatasetSelectorSettings';
import {ParameterNameInput} from './ParameterNameInput/ParameterNameInput';
import {TabsScopeSelect} from './TabsScopeSelect/TabsScopeSelect';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const CommonGroupSettingsSection = ({
    navigationPath,
    changeNavigationPath,
    enableGlobalSelectors,
    className,
}: {
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    enableGlobalSelectors?: boolean;
    className?: string;
}) => {
    const {sourceType} = useSelector(selectSelectorDialog);
    const {group, scopeType, scopeTabsIds} = useSelector(selectSelectorsGroup);

    const hasMultipleSelectors = group.length > 1;

    switch (sourceType) {
        case DashTabItemControlSourceType.Manual:
            return (
                <React.Fragment>
                    <ParameterNameInput
                        label={i18n('field_field-name')}
                        note={i18n('field_field-name-note')}
                        className={className}
                    />
                    {enableGlobalSelectors && (
                        <TabsScopeSelect
                            groupTabsScope={scopeType}
                            groupSelectedTabs={scopeTabsIds}
                            hasMultipleSelectors={hasMultipleSelectors}
                        />
                    )}
                </React.Fragment>
            );
        case DashTabItemControlSourceType.Connection:
            return (
                <ConnectionSettings
                    rowClassName={className}
                    changeNavigationPath={changeNavigationPath}
                    navigationPath={navigationPath}
                    enableGlobalSelectors={enableGlobalSelectors}
                />
            );
        default:
            return (
                <DatasetSelectorSettings
                    rowClassName={className}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                    enableGlobalSelectors={enableGlobalSelectors}
                />
            );
    }
};
