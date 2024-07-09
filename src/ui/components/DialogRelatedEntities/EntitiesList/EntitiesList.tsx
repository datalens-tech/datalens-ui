import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import type {EntryRowProps} from 'ui/components/EntryRow/EntryRow';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';

import './EntitiesList.scss';

type EntitiesListProps = {
    entities: EntryRowProps['entry'][];
} & (CurrentEntity | ScopeEntities);

type CurrentEntity = {
    isCurrent: true;
    scope?: string;
};

type ScopeEntities = {
    isCurrent?: false;
    scope: string;
};

const i18n = I18n.keyset('component.dialog-related-entities.view');

const b = block('related-entities-list');

const getLabelByScope = (scope: string) => {
    switch (scope) {
        case EntryScope.Dash:
            return i18n('label_scope-dash');
        case EntryScope.Connection:
            return i18n('label_scope-connection');
        case EntryScope.Dataset:
            return i18n('label_scope-dataset');
        case EntryScope.Widget:
            return i18n('label_scope-chart');
        default:
            return i18n('label_scope-other');
    }
};

export const EntitiesList = ({scope, entities, isCurrent}: EntitiesListProps) => {
    const title = isCurrent ? i18n('label_current-object') : getLabelByScope(scope);

    return (
        <div className={b()}>
            {title && <div className={b('title')}>{title}</div>}
            {entities.map((entity) => (
                <EntryRow
                    clasName={b('row')}
                    key={entity.entryId}
                    entry={entity}
                    nonInteractive={isCurrent}
                    disableHover={true}
                />
            ))}
        </div>
    );
};
