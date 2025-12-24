import React from 'react';

import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {List, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {SharedEntryBindingsItem} from 'shared/schema';

import {EntityRow} from '../EntityRow/EntityRow';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import type {ListSearchProps} from './ListSearch';
import {ListSearch} from './ListSearch';

import './SharedBindingsList.scss';

const i18n = I18n.keyset('component.dialog-shared-entry-bindings.view');
const b = block('shared-entities-list');

interface SharedBindingsListProps {
    title?: string;
    searchProps?: ListSearchProps;
    entities: SharedEntryBindingsItem[];
    isLoading?: boolean;
    getListItemActions?: (item: SharedEntryBindingsItem) => DropdownMenuItem[];
    onClickRelationButton?: (entry: SharedEntryBindingsItem) => void;
}

export const SharedBindingsList: React.FC<SharedBindingsListProps> = ({
    entities,
    searchProps,
    isLoading,
    title,
    onClickRelationButton,
    getListItemActions,
}) => {
    const renderList = () => {
        if (isLoading) {
            return (
                <div className={b('loader')}>
                    <Loader />
                </div>
            );
        }

        if (entities.length === 0) {
            return (
                <PlaceholderIllustration
                    direction="column"
                    name="emptyDirectory"
                    title={i18n('list-empty')}
                />
            );
        }

        return (
            <List
                className={b('list')}
                itemClassName={b('row')}
                filterable={false}
                items={entities}
                itemHeight={28}
                virtualized
                selectedItemIndex={-1}
                renderItem={(item) => {
                    const actions = getListItemActions?.(item) ?? [];
                    const onClick = onClickRelationButton
                        ? () => onClickRelationButton?.(item)
                        : undefined;
                    return (
                        <EntityRow
                            onClickRelationButton={onClick}
                            entity={item}
                            actions={actions}
                        />
                    );
                }}
            />
        );
    };

    return (
        <div className={b()}>
            <div className={b('title')}>{title}</div>
            {searchProps && <ListSearch className={b('search')} {...searchProps} />}
            {renderList()}
        </div>
    );
};
