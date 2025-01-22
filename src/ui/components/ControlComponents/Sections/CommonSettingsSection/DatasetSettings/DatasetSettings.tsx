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
    rowClassName,
}: {
    hideCommonFields?: boolean;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
    rowClassName?: string;
}) => {
    return (
        <React.Fragment>
            <DatasetSelector
                rowClassName={rowClassName}
                navigationPath={navigationPath}
                changeNavigationPath={changeNavigationPath}
            />
            {!hideCommonFields && (
                <React.Fragment>
                    <InputTypeSelector className={rowClassName} />
                    <OperationSelector className={rowClassName} />
                    <RequiredValueCheckbox className={rowClassName} />
                    <ValueSelector rowClassName={rowClassName} />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export {DatasetSettings};
