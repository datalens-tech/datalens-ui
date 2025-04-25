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
interface UsersSuggestProps extends Partial<Omit<SelectProps, 'value' | 'onUpdate'>> {
    getSuggestItems: GetUsersSuggestItems;
    items: ListSuggestUser[];
    onItemsFetched: (items: ListSuggestUser[]) => void;
    selectedItems: ListSuggestUser[];
    onSelectedItemsUpdate: (items: ListSuggestUser[]) => void;
}

export function UsersSuggest({
    getSuggestItems,
    items,
    onItemsFetched,
    multiple = false,
    selectedItems,
    onSelectedItemsUpdate,
    ...props
}: UsersSuggestProps) {
    const [filter, setFilter] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedGetSuggestItems = React.useCallback(debounce(getSuggestItems, 300), [
        getSuggestItems,
    ]);

    const handleFilterUpdate = React.useCallback(
        (nextFilter: string) => {
            setLoading(true);
            setFilter(nextFilter);
            debouncedGetSuggestItems(nextFilter, onItemsFetched, () => setLoading(false));
        },
        [debouncedGetSuggestItems, onItemsFetched],
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
        <Select
            popupClassName={b('popup')}
            width="max"
            hasCounter={true}
            onOpenChange={handleOpenChange}
            multiple={multiple}
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
            onFilterChange={handleFilterUpdate}
            renderEmptyOptions={() => (
                <Flex alignItems="center" justifyContent="center">
                    {emptyPlaceholder}
                </Flex>
            )}
            getOptionHeight={getOptionHeight}
            renderOption={renderUser}
            renderSelectedOption={renderSelectedUser(selectedItems)}
            onUpdate={handleUpdate}
            {...props}
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
        return (
            <div className={b('selected-user', {hidden: index > 0})}>
                {user.data?.name ??
                    selectedItems.find((item) => item.id === user.value)?.name ??
                    user.value}
            </div>
        );
    };
}
