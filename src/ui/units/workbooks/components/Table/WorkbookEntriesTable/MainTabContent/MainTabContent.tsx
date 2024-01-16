import React from 'react';

import {ChevronDown, ChevronUp, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {CreateEntryActionType} from 'ui/units/workbooks/constants';
import {setCreateWorkbookEntryType} from 'ui/units/workbooks/store/actions';

import {ChunkGroup} from '../ChunkGroup/ChunkGroup';
import {WorkbookEntriesTableProps} from '../types';
import {ChunkItem} from '../useChunkedEntries';

import './MainTabContent.scss';

const b = block('dl-main-tab-content');

const i18n = I18n.keyset('new-workbooks');

interface MainTabContentProps extends WorkbookEntriesTableProps {
    chunk: ChunkItem[];
    actionCreateText: string;
    title: string;
    actionType: CreateEntryActionType;
    isShowMoreBtn: boolean;
    loadMoreEntries: () => void;
}

const MainTabContent: React.FC<MainTabContentProps> = ({
    workbook,
    chunk,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
    actionCreateText,
    title,
    actionType,
    isShowMoreBtn,
    loadMoreEntries,
}) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const dispatch = useDispatch();

    const handleCreateEntity = () => {
        dispatch(setCreateWorkbookEntryType(actionType));
    };

    const getNoObjectsText = () =>
        isOpen && <div className={b('no-objects')}>{i18n('no_objects')}</div>;

    return (
        <div className={b()}>
            <div className={b('header', {closed: !isOpen})}>
                <div className={b('content')}>
                    <div className={b('title')}>
                        <div className={b('visibility-btn')} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronDown /> : <ChevronUp />}
                        </div>
                        <div className={b('title-text')}>{title}</div>
                    </div>
                </div>
                {workbook.permissions.update && (
                    <div className={b('content')}>
                        <div className={b('create-btn')}>
                            <Button onClick={handleCreateEntity}>
                                <Icon data={Plus} />
                                {actionCreateText}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className={b('table')}>
                <div className={b('table-header')}>
                    <div className={b('table-header-cell', {title: true})} />
                    <div className={b('table-header-cell', {author: true})} />
                    <div className={b('table-header-cell', {date: true})} />
                    <div className={b('table-header-cell')} />
                    <div className={b('table-header-cell')} />
                </div>
                {chunk.length > 0 && isOpen ? (
                    <ChunkGroup
                        key={chunk[0].key}
                        workbook={workbook}
                        chunk={chunk}
                        onRenameEntry={onRenameEntry}
                        onDeleteEntry={onDeleteEntry}
                        onDuplicateEntry={onDuplicateEntry}
                        onCopyEntry={onCopyEntry}
                    />
                ) : (
                    getNoObjectsText()
                )}
            </div>

            {isShowMoreBtn && isOpen && (
                <Button onClick={loadMoreEntries} className={b('show-more-btn')} view="outlined">
                    {i18n('action_show-more')}
                </Button>
            )}
        </div>
    );
};

export {MainTabContent};
