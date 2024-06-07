import React from 'react';

import {OperationSelector} from '../../OperationSelector/OperationSelector';
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
                    <ValueSelector />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export {DatasetSettings};
