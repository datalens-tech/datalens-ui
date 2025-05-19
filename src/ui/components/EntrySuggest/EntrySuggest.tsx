import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Flex, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import {makeUserId} from 'shared';
import {DL} from 'ui/constants';
import {getSdk} from 'ui/libs/schematic-sdk';

import {EntryIcon} from '../EntryIcon/EntryIcon';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import type {EntryOptionScope, EntrySuggestItem} from './types';
import {ENTRY_SCOPE_OPTIONS, isEntryOptionScope} from './types';

import './EntrySuggest.scss';

const b = block('dl-entry-suggest');
const i18n = I18n.keyset('component.entry-suggest.view');

const getOptionHeight = () => 48;
const filterOption = () => true;
const defaultIsOptionDisabled = (_option: EntrySuggestItem) => false;

const objectTypeSelectOptions = [
    {value: ENTRY_SCOPE_OPTIONS.CONNECTIONS, content: i18n('label_option-connections')},
    {value: ENTRY_SCOPE_OPTIONS.DATASETS, content: i18n('label_option-datasets')},
    {value: ENTRY_SCOPE_OPTIONS.WIDGETS, content: i18n('label_option-widgets')},
];

interface EntrySuggestProps extends Partial<Omit<SelectProps, 'value' | 'onUpdate'>> {
    showOnlyOwnedEntries?: boolean;
    selectedItem?: EntrySuggestItem;
    onSelectedItemUpdate: (item: EntrySuggestItem | undefined) => void;
    isOptionDisabled?: (option: EntrySuggestItem) => boolean;
}

export function EntrySuggest({
    className,
    showOnlyOwnedEntries = true,
    selectedItem,
    onSelectedItemUpdate,
    isOptionDisabled = defaultIsOptionDisabled,
    ...props
}: EntrySuggestProps) {
    const [paginationParams, setPaginationParams] = React.useState({page: 0, hasNextPage: false});
    const [filter, setFilter] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [entryScope, setEntryScope] = React.useState<EntryOptionScope>(
        selectedItem && isEntryOptionScope(selectedItem.scope)
            ? selectedItem.scope
            : ENTRY_SCOPE_OPTIONS.WIDGETS,
    );

    const [items, setItems] = React.useState<EntrySuggestItem[]>([]);

    const selectedItemMemo = React.useMemo(
        () => (selectedItem ? [selectedItem] : []),
        [selectedItem],
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchEntries = React.useCallback(
        debounce(
            async ({
                search,
                page = 0,
                scope,
            }: {
                search: string;
                page?: number;
                scope: EntryOptionScope;
            }) => {
                if (!search) {
                    return;
                }
                setLoading(true);
                if (page === 0) {
                    setItems([]);
                }
                try {
                    const {entries, hasNextPage} = await getSdk().sdk.us.getEntries(
                        {
                            scope,
                            orderBy: {field: 'createdAt', direction: 'desc'},
                            createdBy: showOnlyOwnedEntries
                                ? [DL.USER_LOGIN, makeUserId(DL.USER_ID)]
                                : undefined,
                            pageSize: 20,
                            page,
                            filters: {
                                name: search,
                            },
                            includePermissionsInfo: true,
                            excludeLocked: true,
                        },
                        {concurrentId: 'getEntries'},
                    );

                    setPaginationParams({
                        page,
                        hasNextPage,
                    });

                    setItems((prevItems) => (page === 0 ? entries : [...prevItems, ...entries]));
                } catch (_e) {
                } finally {
                    setLoading(false);
                }
            },
            300,
        ),
        [showOnlyOwnedEntries],
    );

    const handleLoadMore = React.useCallback(() => {
        const nextPage = paginationParams.page + 1;
        fetchEntries({search: filter, page: nextPage, scope: entryScope});
    }, [entryScope, fetchEntries, filter, paginationParams]);

    const handleFilterSearchUpdate = React.useCallback(
        (nextFilter: string) => {
            setPaginationParams({page: 0, hasNextPage: false});
            setFilter(nextFilter);
            fetchEntries({search: nextFilter, scope: entryScope});
        },
        [entryScope, fetchEntries],
    );

    const handleFilterEntryScopeUpdate = React.useCallback(
        (nextEntryType: string[]) => {
            const nextEntry = nextEntryType[0] as EntryOptionScope;
            setEntryScope(nextEntry);
            fetchEntries({search: filter, page: 0, scope: nextEntry});
        },
        [fetchEntries, filter],
    );

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setFilter('');
            setLoading(false);
            setPaginationParams({page: 0, hasNextPage: false});
        }
    };

    const handleUpdate = (nextValue: string[]) => {
        onSelectedItemUpdate(
            selectedItemMemo.concat(items).find((item) => nextValue.includes(item.entryId)),
        );
    };

    const resultItems = filter ? items : selectedItemMemo;

    return (
        <Select
            {...props}
            className={b(null, className)}
            popupClassName={b('popup')}
            multiple={false}
            onOpenChange={handleOpenChange}
            options={resultItems.map((item) => ({
                value: item.entryId,
                content: item.name,
                disabled: isOptionDisabled(item),
                data: item,
            }))}
            value={selectedItemMemo.map((item) => item.entryId)}
            hasClear
            loading={loading || paginationParams.hasNextPage}
            filterable
            filter={filter}
            filterPlaceholder={i18n('label_search-filter-placeholder')}
            filterOption={filterOption}
            onFilterChange={handleFilterSearchUpdate}
            renderFilter={({inputProps: {size: _, ...inputProps}}) => (
                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                    className={b('filter')}
                >
                    <TextInput {...inputProps} />
                    <Select
                        className={b('type-select')}
                        value={[entryScope]}
                        onUpdate={handleFilterEntryScopeUpdate}
                        placeholder={i18n('label_type-select-placeholder')}
                        options={objectTypeSelectOptions}
                    />
                </Flex>
            )}
            renderEmptyOptions={() => getEmptyStatePlaceholder({loading, filter})}
            getOptionHeight={getOptionHeight}
            renderOption={renderEntryOption}
            onUpdate={handleUpdate}
            onLoadMore={paginationParams.hasNextPage ? handleLoadMore : undefined}
        />
    );
}

function renderEntryOption({data, value, content, disabled}: SelectOption<EntrySuggestItem>) {
    return (
        <Flex alignItems="center" gap={2} className={b('entry-option', {disabled})}>
            {data ? (
                <React.Fragment>
                    <EntryIcon entry={data} size={24} />
                    {data.name}
                </React.Fragment>
            ) : (
                content ?? value
            )}
        </Flex>
    );
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
