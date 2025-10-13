import React from 'react';

import {TriangleExclamation} from '@gravity-ui/icons';
import {Button, Icon, List, Loader, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import {useDispatch, useSelector} from 'react-redux';
import {openDialogErrorWithTabs} from 'store/actions/dialog';

import {I18n} from '../../../../../i18n';
import type {DatasetSource} from '../../../../../shared/types';
import type {DataLensApiError} from '../../../../typings';
import DatasetUtils from '../../helpers/utils';
import {
    changeCurrentDbName,
    incrementSourcesPage,
    searchSources,
} from '../../store/actions/creators';
import {
    currentDbNameSelector,
    currentDbNamesSelector,
    optionsSelector,
    sourcesErrorSelector,
    sourcesPaginationSelector,
} from '../../store/selectors';
import Source from '../Source/Source';
import {withDragging} from '../hoc/AvatarDnD';

import {ICON_PLUS_SIZE, SEARCH_DELAY} from './constants';

import iconPlus from 'ui/assets/icons/plus.svg';

type AddSourceButtonProps = {
    onClick: () => void;
    disabled?: boolean;
};

type ErrorViewProps = {
    onRetry: () => void;
    error: DataLensApiError;
};

type SourcesTableProps = {
    onEdit: (source: DatasetSource) => void;
    onAdd: () => void;
    onDelete: () => void;
    onRetry: () => void;
    sources: DatasetSource[];
    error?: DataLensApiError;
    loading?: boolean;
    dragDisabled?: boolean;
    dropDisabled?: boolean;
    allowAddSource?: boolean;
};

const b = block('select-sources-prototypes');
const i18n = I18n.keyset('dataset.sources-tab.modify');
const SourceWithDragging = withDragging(Source);

const filterItem = (search: string) => {
    return (source: DatasetSource) => {
        return DatasetUtils.getSourceTitle(source).toLowerCase().includes(search.toLowerCase());
    };
};

const AddSourceButton: React.FC<AddSourceButtonProps> = ({onClick, disabled}) => (
    <div className={b('bottom-section')}>
        <Button className={b('btn-add-source')} view="flat" disabled={disabled} onClick={onClick}>
            <Icon className={b('btn-add-source-ic')} data={iconPlus} width={ICON_PLUS_SIZE} />
            {i18n('button_add-source')}
        </Button>
    </div>
);

const ErrorView: React.FC<ErrorViewProps> = ({error, onRetry}) => {
    const dispatch = useDispatch();

    return (
        <div className={b('sources-error')}>
            <div className={b('sources-error-container')}>
                <Icon data={TriangleExclamation} className={b('sources-error-icon')} />
                <div>
                    <div className={b('sources-error-row')}>
                        {i18n('label_sources-loading-error')}
                    </div>
                    <div className={b('sources-error-row')}>
                        <Button
                            className={b('sources-error-btn')}
                            view="outlined"
                            size="s"
                            onClick={() => {
                                dispatch(
                                    openDialogErrorWithTabs({
                                        error,
                                        title: i18n('label_sources-loading-error'),
                                    }),
                                );
                            }}
                        >
                            {i18n('button_details')}
                        </Button>
                        <Button size="s" onClick={onRetry}>
                            {i18n('button_retry')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SourcesTable: React.FC<SourcesTableProps> = ({
    error,
    sources,
    loading,
    dragDisabled,
    dropDisabled,
    allowAddSource,
    onEdit,
    onAdd,
    onDelete,
    onRetry,
}) => {
    const [search, setSearch] = React.useState('');
    const dispatch = useDispatch();
    const {source_listing} = useSelector(optionsSelector);
    const currentDbName = useSelector(currentDbNameSelector);
    const sourcesPagination = useSelector(sourcesPaginationSelector);
    const sourcesError = useSelector(sourcesErrorSelector);
    const dbNames = useSelector(currentDbNamesSelector);

    const serverPagination = source_listing?.supports_source_pagination;
    const serverSearch = source_listing?.supports_source_search;
    const canChangeSourceParent = source_listing?.supports_db_name_listing;
    const parentLabel = source_listing?.db_name_label ?? '';

    React.useEffect(() => {
        setSearch(sourcesPagination.searchValue);
    }, [sourcesPagination.searchValue]);

    const onChangeDbName = React.useCallback(
        (value) => {
            dispatch(changeCurrentDbName(value[0]));
        },
        [dispatch],
    );

    const onLoadMore = React.useCallback(() => {
        if (
            !sourcesPagination.isFetchingNextPage &&
            !loading &&
            !sourcesPagination.isFinished &&
            !sourcesError
        ) {
            dispatch(incrementSourcesPage());
        }
    }, [dispatch, loading, sourcesPagination, sourcesError]);

    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string) => {
                dispatch(searchSources(value));
            }, SEARCH_DELAY),
        [],
    );

    const onSearch = React.useCallback(
        (value: string) => {
            const currentValue = value.trim();
            setSearch(currentValue);
            debouncedSearch(currentValue);
        },
        [debouncedSearch],
    );

    return (
        <div className={b('sources')}>
            {error ? <ErrorView onRetry={onRetry} error={error} /> : null}
            <div className={b('top-section')}>
                {canChangeSourceParent && (
                    <>
                        <div className={b('header')}>
                            <span>{parentLabel}</span>
                        </div>
                        <Select
                            disabled={loading}
                            className={b('select-db-name')}
                            value={[currentDbName ? currentDbName : '']}
                            onUpdate={onChangeDbName}
                        >
                            {dbNames?.map((name: string) => (
                                <Select.Option key={name} value={name}>
                                    {name}
                                </Select.Option>
                            ))}
                        </Select>
                    </>
                )}
                <div className={b('header')}>
                    <span>{i18n('label_tables')}</span>
                </div>
                {serverSearch && (
                    <TextInput
                        className={b('input-search')}
                        placeholder={i18n('field_placeholder-title')}
                        value={search}
                        hasClear={true}
                        onUpdate={onSearch}
                        disabled={loading || sourcesError}
                    />
                )}
            </div>
            {loading ? (
                <div className={b('loader-sources')}>
                    <Loader size="s" />
                </div>
            ) : (
                <>
                    <List
                        className={b('list')}
                        items={sources}
                        itemClassName={b('source-item')}
                        itemHeight={32}
                        selectedItemIndex={-1}
                        filterPlaceholder={i18n('field_placeholder-title')}
                        filterable={!serverSearch && sources.length >= 10}
                        virtualized={true}
                        filterItem={filterItem}
                        onLoadMore={serverPagination ? onLoadMore : undefined}
                        loading={serverPagination && !sourcesPagination.isFinished && !sourcesError}
                        renderItem={(source) => (
                            <SourceWithDragging
                                dragDisabled={dragDisabled}
                                dropDisabled={dropDisabled}
                                avatar={source}
                                onClickEditBtn={onEdit}
                                onDeleteSource={onDelete}
                            />
                        )}
                    />
                    {allowAddSource && <AddSourceButton disabled={dragDisabled} onClick={onAdd} />}
                </>
            )}
        </div>
    );
};
