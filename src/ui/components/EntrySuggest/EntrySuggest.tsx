import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Flex, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import uniqBy from 'lodash/uniqBy';
import type {ValueOf} from 'shared';
import {makeUserId} from 'shared';
import type {GetEntriesEntryResponse} from 'shared/schema';
import {DL} from 'ui/constants';
import {getSdk} from 'ui/libs/schematic-sdk';

import {EntryIcon} from '../EntryIcon/EntryIcon';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';

import './EntrySuggest.scss';

const b = block('dl-entry-suggest');
const i18n = I18n.keyset('component.entry-suggest.view');

const getOptionHeight = () => 48;
const filterOption = () => true;
const defaultIsOptionDisabled = (_option: SuggestEntry) => false;

const OBJECT_TYPE_OPTIONS = {
    CONNECTIONS: 'connection',
    DATASETS: 'dataset',
    WIDGETS: 'widget',
} as const;

type ObjectTypeOption = ValueOf<typeof OBJECT_TYPE_OPTIONS>;
export type SuggestEntry = GetEntriesEntryResponse;

const objectTypeSelectOptions = [
    {value: OBJECT_TYPE_OPTIONS.CONNECTIONS, content: i18n('label_option-connections')},
    {value: OBJECT_TYPE_OPTIONS.DATASETS, content: i18n('label_option-datasets')},
    {value: OBJECT_TYPE_OPTIONS.WIDGETS, content: i18n('label_option-widgets')},
];

interface EntrySuggestProps extends Partial<Omit<SelectProps, 'value' | 'onUpdate'>> {
    showOnlyOwnedEntries?: boolean;
    selectedItems: SuggestEntry[];
    onSelectedItemsUpdate: (items: SuggestEntry[]) => void;
    isOptionDisabled?: (option: SuggestEntry) => boolean;
}

export function EntrySuggest({
    className,
    showOnlyOwnedEntries = true,
    selectedItems,
    onSelectedItemsUpdate,
    isOptionDisabled = defaultIsOptionDisabled,
    ...props
}: EntrySuggestProps) {
    const [paginationParams, setPaginationParams] = React.useState({page: 0, hasNextPage: false});
    const [filter, setFilter] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [entryType, setEntryType] = React.useState<ObjectTypeOption>(OBJECT_TYPE_OPTIONS.WIDGETS);

    const [items, setItems] = React.useState<SuggestEntry[]>([]);

    const fetchEntries = React.useMemo(
        () =>
            debounce(
                async ({
                    search,
                    page = 0,
                    entryType,
                }: {
                    search: string;
                    page?: number;
                    entryType: ObjectTypeOption;
                }) => {
                    setLoading(true);
                    if (page === 0) {
                        setItems([]);
                    }
                    try {
                        const {entries, hasNextPage} = await getSdk().sdk.us.getEntries(
                            {
                                scope: entryType,
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
                            {concurrentId: 'getNavigationList'},
                        );

                        setPaginationParams((prevPaginationParams) => ({
                            ...prevPaginationParams,
                            hasNextPage,
                        }));

                        setItems((prevItems) =>
                            page === 0 ? entries : [...prevItems, ...entries],
                        );
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
        setPaginationParams((prevPaginationParams) => {
            const nextPage = prevPaginationParams.page + 1;
            fetchEntries({search: filter, page: nextPage, entryType});

            return {page: nextPage, hasNextPage: false};
        });
    }, [entryType, fetchEntries, filter]);

    const handleFilterSearchUpdate = React.useCallback(
        (nextFilter: string) => {
            setPaginationParams({page: 0, hasNextPage: false});
            setFilter(nextFilter);
            fetchEntries({search: nextFilter, entryType});
        },
        [entryType, fetchEntries],
    );

    const handleFilterEntryTypeUpdate = React.useCallback(
        (nextEntryType: string[]) => {
            const nextEntry = nextEntryType[0] as ObjectTypeOption;
            setEntryType(nextEntry);
            setItems([]);
            fetchEntries({search: filter, page: 0, entryType: nextEntry});
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
        onSelectedItemsUpdate(
            uniqBy(
                selectedItems.concat(items).filter((item) => nextValue.includes(item.entryId)),
                'entryId',
            ),
        );
    };

    const resultItems = filter ? items : selectedItems;

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
                        value={[entryType]}
                        onUpdate={handleFilterEntryTypeUpdate}
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

function renderEntryOption({data, value, content, disabled}: SelectOption<SuggestEntry>) {
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
