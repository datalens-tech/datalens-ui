import React from 'react';

import {useSelector} from 'react-redux';
import {DashTabItemControlSourceType} from 'shared';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import {ConnectionSettings} from './ConnectionSettings/ConnectionSettings';
import {DatasetSettings} from './DatasetSettings/DatasetSettings';
import {ExternalSelectorSettings} from './ExternalSelectorSettings/ExternalSelectorSettings';
import {InputSettings} from './InputSettings/InputSettings';

const CommonSettingsSection = () => {
    const {sourceType} = useSelector(selectSelectorDialog);

    switch (sourceType) {
        case DashTabItemControlSourceType.External:
            return <ExternalSelectorSettings />;
        case DashTabItemControlSourceType.Manual:
            return <InputSettings />;
        case DashTabItemControlSourceType.Connection:
            return <ConnectionSettings />;
        default:
            return <DatasetSettings />;
    }
};

export {CommonSettingsSection};
