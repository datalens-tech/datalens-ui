import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import type {EntryRowProps} from 'ui/components/EntryRow/EntryRow';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';
import {Switch} from '@gravity-ui/uikit';

import './EntitiesList.scss';

type EntitiesListProps = {
    entities: EntryRowProps['entry'][];
    hideTitle?: boolean;
    updatedEntities?: Record<string, boolean>;
    setUpdatedEntities?: any;
} & (CurrentEntity | ScopeEntities);

type CurrentEntity = {
    isCurrent: true;
    scope?: string;
};

type ScopeEntities = {
    isCurrent?: false;
    scope: string;
    updatedEntities?: Record<string, boolean>;
    setUpdatedEntities?: any;
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

export const EntitiesList = ({scope, entities, isCurrent, hideTitle, updatedEntities, setUpdatedEntities}: EntitiesListProps) => {
    const title = isCurrent ? i18n('label_current-object') : getLabelByScope(scope);

    let checkedCount = 0;
    for (const key in entities) {
        const item = entities[key];
        if (updatedEntities?.[item.entryId]) {
            checkedCount++;
        }
    }

    const handleCheckAll = (value: boolean) => {
        const _updatedEntities: Record<string, boolean> = {}
        for (const key in entities) {
            const item = entities[key];
            _updatedEntities[item.entryId] = value
        }
        setUpdatedEntities({...updatedEntities, ..._updatedEntities});
    }

    return (
        <div className={b()}>
            <div className={b('title-wrapper')}>
            {title && !hideTitle && <div className={b('title')}>{title}</div>}
            {isCurrent || !updatedEntities ? null : 
                <Switch size="m" 
                    className={b('switch')}
                    checked={checkedCount == entities.length} 
                    onUpdate={(value)=>{
                        handleCheckAll(value);
                    }}>
                </Switch>}
            </div>
            {entities.map((entity) => (
                <EntryRow
                    className={b('row')}
                    key={entity.entryId}
                    entry={entity}
                    nonInteractive={isCurrent}
                    disableHover={true}
                    rightSectionSlot={isCurrent || !updatedEntities ? null : 
                        <Switch size="m" 
                            className={b('switch')}
                            checked={Boolean(updatedEntities?.[entity.entryId])} 
                            onUpdate={(value)=>{
                                setUpdatedEntities({...updatedEntities, [entity.entryId]: value})
                            }}>
                        </Switch>}
                />
            ))}
        </div>
    );
};