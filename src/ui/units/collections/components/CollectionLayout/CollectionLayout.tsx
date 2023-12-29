import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {CollectionPageViewMode} from 'ui/components/CollectionFilters';

import './CollectionLayout.scss';

const b = block('dl-collection-layout');

type Props = {
    title: string;
    description?: string | null;
    controls?: React.ReactNode;
    content: React.ReactNode;
    editBtn: React.ReactNode | null;
    countSelected: number;
    isOpenSelectionMode: boolean;
    collectionPageViewMode: CollectionPageViewMode;
    onOpenSelectionMode: () => void;
    onCancelSelectionMode: () => void;
    onSelectAll: (checked: boolean) => void;
};

const i18n = I18n.keyset('collections');

export const CollectionLayout = React.memo<Props>(
    ({
        title,
        description,
        controls,
        content,
        editBtn,
        countSelected,
        collectionPageViewMode,
        isOpenSelectionMode,
        onOpenSelectionMode,
        onCancelSelectionMode,
        onSelectAll,
    }) => {
        const selectBtn = React.useMemo(() => {
            if (countSelected === 0 && !isOpenSelectionMode) {
                return (
                    <Button view="outlined" onClick={onOpenSelectionMode}>
                        {i18n('action_select')}
                    </Button>
                );
            }

            if (countSelected > 0) {
                return (
                    <Button view="outlined" onClick={() => onSelectAll(false)}>
                        {i18n('action_reset-all')}
                    </Button>
                );
            } else {
                return (
                    <Button view="outlined" onClick={() => onSelectAll(true)}>
                        {i18n('action_select-all')}
                    </Button>
                );
            }
        }, [countSelected, isOpenSelectionMode, onOpenSelectionMode, onSelectAll]);

        return (
            <div className={b()}>
                <div className={b('container')}>
                    <div className={b('title-content')}>
                        <h1 className={b('title')}>{title}</h1>
                        {editBtn}
                        <div className={b('select-actions')}>
                            {collectionPageViewMode === CollectionPageViewMode.Grid && (
                                <>
                                    {selectBtn}
                                    {(isOpenSelectionMode || Boolean(countSelected)) && (
                                        <Button
                                            className={b('cancel-btn')}
                                            view="outlined-danger"
                                            onClick={onCancelSelectionMode}
                                        >
                                            {i18n('action_cancel')}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {description && <div className={b('description')}>{description}</div>}
                    {controls && <div className={b('controls')}>{controls}</div>}
                    <div className={b('content')}>{content}</div>
                </div>
            </div>
        );
    },
);

CollectionLayout.displayName = 'CollectionLayout';
