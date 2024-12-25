import React from 'react';

import {Button, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';

import type {RowEntryData} from '../EntryRow/EntryRow';

import './EntitiesList.scss';

type EntitiesListProps = {
    entities: RowEntryData[];
    hideTitle?: boolean;
    showLoadButton?: boolean;
    onLoadClick?: (scope?: string) => Promise<void> | null;
    error?: boolean;
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

export const EntitiesList = ({
    scope,
    entities,
    isCurrent,
    hideTitle,
    onLoadClick,
    showLoadButton,
    error,
}: EntitiesListProps) => {
    const title = isCurrent ? i18n('label_current-object') : getLabelByScope(scope);

    const [isButtonLoading, setIsButtonLoading] = React.useState(false);

    const handleLoadClick = () => {
        if (onLoadClick) {
            const loadPromise = onLoadClick(isCurrent ? undefined : scope);
            if (loadPromise) {
                setIsButtonLoading(true);
                loadPromise.finally(() => setIsButtonLoading(false));
            }
        }
    };

    const renderContent = () => {
        if (error) {
            return (
                <React.Fragment>
                    <Text color="danger">{i18n('label_request-error')}</Text>
                    {showLoadButton && (
                        <Button
                            view="outlined"
                            onClick={handleLoadClick}
                            loading={isButtonLoading}
                            className={b('button-retry')}
                        >
                            {i18n('button_retry')}
                        </Button>
                    )}
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                {entities.map((entity) => (
                    <EntryRow
                        className={b('row')}
                        key={entity.entryId}
                        entry={entity}
                        nonInteractive={isCurrent}
                    />
                ))}
                {showLoadButton && (
                    <Button view="outlined" onClick={handleLoadClick} loading={isButtonLoading}>
                        {i18n('button_load-more')}
                    </Button>
                )}
            </React.Fragment>
        );
    };

    return (
        <div className={b()}>
            {title && !hideTitle && <div className={b('title')}>{title}</div>}
            {renderContent()}
        </div>
    );
};
