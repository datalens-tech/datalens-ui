import React from 'react';

import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {List, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {RowEntityData} from '../EntityRow/EntityRow';
import {EntityRow} from '../EntityRow/EntityRow';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import type {ListSearchProps} from './ListSearch';
import {ListSearch} from './ListSearch';

import './SharedBindingsList.scss';

const b = block('shared-entities-list');

interface SharedBindingsListProps {
    title?: string;
    searchProps?: ListSearchProps;
    entities: RowEntityData[];
    isLoading?: boolean;
}

const dropdownItems: DropdownMenuItem[] = [
    {
        text: 'Отвязать',
        action: () => {},
    },
    {
        text: 'Поменять права',
        action: () => {},
    },
];

// TODO texts in CHARTS-11999
export const SharedBindingsList: React.FC<SharedBindingsListProps> = ({
    entities,
    searchProps,
    isLoading,
    title = 'Привязанные объекты',
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
                    title="Биндинги отсутствуют"
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
                    return <EntityRow entity={item} actions={dropdownItems} />;
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
