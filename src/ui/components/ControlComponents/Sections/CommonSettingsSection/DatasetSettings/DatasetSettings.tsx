import React from 'react';

import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {RequiredValueCheckbox} from '../../ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {DatasetSelector} from '../DatasetSelector/DatasetSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';

const DatasetSettings = ({
    hideCommonFields,
    navigationPath,
    changeNavigationPath,
}: {
    hideCommonFields?: boolean;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
}) => {
    return (
        <React.Fragment>
            <DatasetSelector
                navigationPath={navigationPath}
                changeNavigationPath={changeNavigationPath}
            />
            {!hideCommonFields && (
                <React.Fragment>
                    <InputTypeSelector />
                    <OperationSelector />
                    <RequiredValueCheckbox />
                    <ValueSelector />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export {DatasetSettings};
