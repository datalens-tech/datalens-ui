import React from 'react';

import {TriangleExclamation} from '@gravity-ui/icons';
import {Button, Icon, List, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {openDialogErrorWithTabs} from 'store/actions/dialog';

import {I18n} from '../../../../../i18n';
import type {DatasetSource} from '../../../../../shared/types';
import type {DataLensApiError} from '../../../../typings';
import DatasetUtils from '../../helpers/utils';
import Source from '../Source/Source';
import {withDragging} from '../hoc/AvatarDnD';

import {ICON_PLUS_SIZE} from './constants';

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
    if (loading) {
        return (
            <div className={b('loader-sources')}>
                <Loader size="s" />
            </div>
        );
    }

    return (
        <div className={b('sources')}>
            {error ? <ErrorView onRetry={onRetry} error={error} /> : null}
            <div className={b('top-section')}>
                <div className={b('header')}>
                    <span>{i18n('label_tables')}</span>
                </div>
            </div>
            <List
                className={b('list')}
                items={sources}
                itemClassName={b('source-item')}
                itemHeight={32}
                selectedItemIndex={-1}
                filterPlaceholder={i18n('field_placeholder-title')}
                filterable={sources.length >= 10}
                virtualized={true}
                filterItem={filterItem}
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
        </div>
    );
};
