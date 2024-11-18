import React from 'react';

import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {RequiredValueCheckbox} from '../../ValueSelector/RequiredValueCheckbox/RequiredValueCheckbox';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {DatasetSelector} from '../DatasetSelector/DatasetSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';

const DatasetSettings = ({hideCommonFields}: {hideCommonFields?: boolean}) => {
    return (
        <React.Fragment>
            <DatasetSelector />
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
