import React from 'react';

import {Person} from '@gravity-ui/icons';
import type {ListItemData, SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Flex, Select, User} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import uniqBy from 'lodash/uniqBy';

import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import type {GetUsersSuggestItems, ListSuggestUser} from './types';

import './UsersSuggest.scss';

const b = block('dl-users-suggest');
const i18n = I18n.keyset('component.users-suggest.view');

const getOptionHeight = () => 48;
const filterOption = () => true;
interface UsersSuggestProps extends Partial<Omit<SelectProps, 'value' | 'onUpdate'>> {
    getSuggestItems: GetUsersSuggestItems;
    selectedItems: ListSuggestUser[];
    onSelectedItemsUpdate: (items: ListSuggestUser[]) => void;
}

export function UsersSuggest({
    getSuggestItems,
    selectedItems,
    onSelectedItemsUpdate,
    ...props
}: UsersSuggestProps) {
    const [filter, setFilter] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [items, setItems] = React.useState<ListSuggestUser[]>([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedGetSuggestItems = React.useCallback(debounce(getSuggestItems, 300), [
        getSuggestItems,
    ]);

    const handleFilterUpdate = React.useCallback(
        (nextFilter: string) => {
            setLoading(true);
            setFilter(nextFilter);
            debouncedGetSuggestItems(nextFilter, setItems, () => setLoading(false));
        },
        [debouncedGetSuggestItems],
    );

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setFilter('');
            setLoading(false);
        }
    };

    const handleUpdate = (nextValue: string[]) => {
        onSelectedItemsUpdate(
            uniqBy(
                selectedItems.concat(items).filter((item) => nextValue.includes(item.id)),
                'id',
            ),
        );
    };

    let resultItems: ListItemData<ListSuggestUser>[] = [];
    if (!loading) {
        resultItems = filter ? items : selectedItems;
    }

    return (
        <Select
            {...props}
            popupClassName={b('popup')}
            hasCounter={true}
            onOpenChange={handleOpenChange}
            options={resultItems.map((item) => ({
                value: item.id,
                content: item.name,
                data: item,
            }))}
            value={selectedItems.map((item) => item.id)}
            hasClear
            loading={loading}
            filterable
            filter={filter}
            filterPlaceholder={i18n('label_filter-placeholder')}
            filterOption={filterOption}
            onFilterChange={handleFilterUpdate}
            renderEmptyOptions={() => getEmptyStatePlaceholder({loading, filter})}
            getOptionHeight={getOptionHeight}
            renderOption={renderUser}
            renderSelectedOption={renderSelectedUser(selectedItems)}
            onUpdate={handleUpdate}
        />
    );
}

function renderUser(user: SelectOption<ListSuggestUser>) {
    return (
        <User
            avatar={
                user.data?.avatarUrl ? (
                    <img
                        src={user.data.avatarUrl}
                        alt={user.data?.name || user.value}
                        className={b('user-avatar')}
                    />
                ) : (
                    {icon: Person}
                )
            }
            className={b('user')}
            name={user.data?.name}
        />
    );
}

function renderSelectedUser(selectedItems: ListSuggestUser[]) {
    return function SelectedUser(user: SelectOption<ListSuggestUser>, index: number) {
        const userNameFromSelectedItems = selectedItems.find(
            (item) => item.id === user.value,
        )?.name;
        return (
            <div className={b('selected-user', {hidden: index > 0})}>
                {user.data?.name ?? userNameFromSelectedItems ?? user.value}
            </div>
        );
    };
}

function getEmptyStatePlaceholder({loading, filter}: {loading: boolean; filter: string}) {
    let emptyPlaceholder: React.ReactNode = null;

    if (!loading && !filter) {
        emptyPlaceholder = (
            <PlaceholderIllustration
                name="template"
                size="s"
                direction="column"
                className={b('placeholder')}
                title={i18n('label_empty-state-template-title')}
                description={i18n('label_empty-state-template-description')}
            />
        );
    } else if (!loading && filter) {
        emptyPlaceholder = (
            <PlaceholderIllustration
                name="notFound"
                size="s"
                direction="column"
                className={b('placeholder')}
                title={i18n('label_empty-state-not-found-title')}
                description={i18n('label_empty-state-not-found-description')}
            />
        );
    }

    return (
        <Flex alignItems="center" justifyContent="center">
            {emptyPlaceholder}
        </Flex>
    );
}
