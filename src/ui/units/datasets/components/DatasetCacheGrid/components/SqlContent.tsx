import React from 'react';

import {getEarlyInvalidationCacheMockText} from 'ui/units/datasets/helpers/mockTexts';

import {CacheParameterRow} from './CacheParameterRow';
import {LastResultRow} from './LastResultRow';

type SqlContentProps = {
    readonly: boolean;
};

export const SqlContent = ({readonly}: SqlContentProps) => {
    return (
        <React.Fragment>
            <CacheParameterRow
                readonly={readonly}
                label={getEarlyInvalidationCacheMockText('sql-row-label')}
                onAdd={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                parameterExist={false}
            />
            <LastResultRow readonly={readonly} />
        </React.Fragment>
    );
};
