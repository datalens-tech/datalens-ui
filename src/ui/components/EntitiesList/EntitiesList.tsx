import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';

import type {RowEntryData} from '../EntryRow/EntryRow';

import './EntitiesList.scss';

type EntitiesListProps = {
    entities: RowEntryData[];
    hideTitle?: boolean;
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

export const EntitiesList = ({scope, entities, isCurrent, hideTitle}: EntitiesListProps) => {
    const title = isCurrent ? i18n('label_current-object') : getLabelByScope(scope);

    return (
        <div className={b()}>
            {title && !hideTitle && <div className={b('title')}>{title}</div>}
            {entities.map((entity) => (
                <EntryRow
                    className={b('row')}
                    key={entity.entryId}
                    entry={entity}
                    nonInteractive={isCurrent}
                />
            ))}
        </div>
    );
};
