import React from 'react';

import {useSelector} from 'react-redux';
import {DashTabItemControlSourceType} from 'shared';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import {ConnectionSettings} from './ConnectionSettings/ConnectionSettings';
import {DatasetSettings} from './DatasetSettings/DatasetSettings';
import {ExternalSelectorSettings} from './ExternalSelectorSettings/ExternalSelectorSettings';
import {InputSettings} from './InputSettings/InputSettings';

type CommonSettingsProps = {
    isSectionHidden?: boolean;
};

const CommonSettingsSection = ({isSectionHidden}: CommonSettingsProps) => {
    const {sourceType} = useSelector(selectSelectorDialog);

    switch (sourceType) {
        case DashTabItemControlSourceType.External:
            return <ExternalSelectorSettings />;
        case DashTabItemControlSourceType.Manual:
            return <InputSettings isSectionHidden={isSectionHidden} />;
        case DashTabItemControlSourceType.Connection:
            return <ConnectionSettings />;
        default:
            return <DatasetSettings isSectionHidden={isSectionHidden} />;
    }
};

export {CommonSettingsSection};
