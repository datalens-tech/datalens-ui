import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';
import {Switch} from '@gravity-ui/uikit';

import type {EntitiesListProps} from './types';

import './EntitiesList.scss';

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

export const EntitiesList = ({scope, entities, isCurrent, hideTitle, enableHover, rightSectionSlot, rowClassName, className, updatedEntities, setUpdatedEntities}: EntitiesListProps) => {
    const title = isCurrent ? i18n('label_current-object') : getLabelByScope(scope);

    let checkedCount = 0;
    for (const key in entities) {
        const item = entities[key];
        if (item.entryId && updatedEntities?.[item.entryId]) {
            checkedCount++;
        }
    }

    const handleCheckAll = (value: boolean) => {
        const _updatedEntities: Record<string, boolean> = {}
        for (const key in entities) {
            const item = entities[key];
            if(item.entryId)
                _updatedEntities[item.entryId] = value
        }
        setUpdatedEntities({...updatedEntities, ..._updatedEntities});
    }

    const RightSectionSlot = rightSectionSlot;
    console.log(RightSectionSlot);

    return (
        <div className={b(null, className)}>
            {title && !hideTitle && <div className={b('title')}>
                <div className={b('title-wrapper')}>{title}</div>
                {isCurrent || !updatedEntities ? null : 
                    <Switch size="m" 
                        className={b('switch')}
                        checked={checkedCount == entities.length} 
                        onUpdate={(value)=>{
                            handleCheckAll(value);
                        }}>
                    </Switch>}
            </div>}
            {entities.map((entity) => (
                <EntryRow
                    className={b('row', rowClassName)}
                    key={entity.entryId}
                    entry={entity}
                    nonInteractive={isCurrent}
                    disableHover={true}
                    rightSectionSlot={isCurrent || !updatedEntities ? null : 
                        <Switch size="m" 
                            className={b('switch')}
                            checked={Boolean(entity.entryId && updatedEntities?.[entity.entryId])} 
                            onUpdate={(value)=>{
                                setUpdatedEntities({...updatedEntities, [entity.entryId || ""]: value})
                            }}>
                        </Switch>}
                    enableHover={enableHover}
                    // rightSectionSlot={
                    //     RightSectionSlot ? <RightSectionSlot entry={entity} /> : undefined
                    // }
                />
            ))}
        </div>
    );
};