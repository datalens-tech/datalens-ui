import React from 'react';

import {ChevronDown, ChevronUp, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {DL} from 'ui/constants/common';
import type {CreateEntryActionType} from 'ui/units/workbooks/constants';
import {setCreateWorkbookEntryType} from 'ui/units/workbooks/store/actions';
import type {ChunkItem} from 'ui/units/workbooks/types';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {ChunkGroup} from '../ChunkGroup/ChunkGroup';
import {EmptyRow} from '../Row/Row';
import type {WorkbookEntriesTableProps} from '../types';

import './MainTabContent.scss';

const b = block('dl-main-tab-content');

const i18n = I18n.keyset('new-workbooks');

type MainTabContentProps = WorkbookEntriesTableProps & {
    actionCreateText: string;
    chunk: ChunkItem[];
    title: string;
    isErrorMessage?: boolean;
    isLoading?: boolean;
    actionType: CreateEntryActionType;
    isShowMoreBtn: boolean;
    loadMoreEntries: () => void;
    retryLoadEntries: () => void;
    createEntryBtn?: React.ReactNode;
    clearView?: boolean;
    hideCreateButton?: boolean;
};

const MainTabContent = ({
    workbook,
    chunk,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
    actionCreateText,
    hideCreateButton,
    title,
    actionType,
    isShowMoreBtn,
    loadMoreEntries,
    retryLoadEntries,
    isErrorMessage,
    isLoading,
    createEntryBtn,
    clearView,
    onShowRelatedClick,
    onCopyId,
}: MainTabContentProps) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const dispatch = useDispatch();

    const handleCreateEntity = () => {
        dispatch(setCreateWorkbookEntryType(actionType));
    };

    const getContentTab = () => {
        if (isErrorMessage) {
            return <div className={b('error-text')}>{i18n('label_error-load-entities')}</div>;
        }

        if (chunk && chunk.length > 0 && isOpen) {
            return (
                <ChunkGroup
                    key={chunk[0].key}
                    workbook={workbook}
                    chunk={chunk}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onDuplicateEntry={onDuplicateEntry}
                    onCopyEntry={onCopyEntry}
                    onShowRelatedClick={onShowRelatedClick}
                    onCopyId={onCopyId}
                />
            );
        }

        if (isOpen) {
            return <EmptyRow label={<div className={b('no-objects')}>{i18n('no_objects')}</div>} />;
        }

        return null;
    };

    const getActionBtn = () => {
        const buttonSize = DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : undefined;

        if (isErrorMessage) {
            return (
                <Button
                    onClick={retryLoadEntries}
                    size={buttonSize}
                    className={b('retry-btn')}
                    view="outlined"
                >
                    {i18n('action_retry')}
                </Button>
            );
        }

        if (isShowMoreBtn && isOpen) {
            return (
                <Button
                    onClick={loadMoreEntries}
                    size={buttonSize}
                    className={b('show-more-btn')}
                    view="outlined"
                >
                    {i18n('action_show-more')}
                </Button>
            );
        }

        return null;
    };

    const showCreateButton = workbook.permissions.update && !DL.IS_MOBILE;

    if (!isLoading && DL.IS_MOBILE && chunk.length === 0) {
        return null;
    }

    const renderCreateButton = () => {
        if (!showCreateButton || hideCreateButton) {
            return null;
        }

        return (
            <div className={b('content')}>
                <div className={b('create-btn')}>
                    {createEntryBtn ?? (
                        <Button onClick={handleCreateEntity}>
                            <Icon data={Plus} />
                            {actionCreateText}
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={b({mobile: DL.IS_MOBILE})}>
            {!clearView && (
                <div className={b('header', {closed: !isOpen})}>
                    <div className={b('content')}>
                        <div className={b('title')} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronDown /> : <ChevronUp />}

                            <div className={b('title-text')}>{title}</div>
                        </div>
                    </div>
                    {renderCreateButton()}
                </div>
            )}

            <div className={b('table')}>
                <div className={b('table-header')}>
                    <div className={b('table-header-cell', {title: true})} />
                    {!DL.IS_MOBILE && <div className={b('table-header-cell', {author: true})} />}
                    <div className={b('table-header-cell', {date: true})} />
                    {!DL.IS_MOBILE && <div className={b('table-header-cell', {controls: true})} />}
                </div>
                {!isLoading && getContentTab()}
            </div>

            {isLoading ? <SmartLoader size="m" showAfter={0} /> : getActionBtn()}
        </div>
    );
};

export {MainTabContent};
