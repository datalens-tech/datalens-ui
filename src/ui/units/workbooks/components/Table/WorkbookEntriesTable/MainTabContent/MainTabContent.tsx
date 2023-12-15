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
}) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const dispatch = useDispatch();

    const handleCreateEntity = () => {
        dispatch(setCreateWorkbookEntryType(actionType));
    };

    const getNoObjectsText = () =>
        isOpen && <div className={b('no-objects')}>{i18n('no_objects')}</div>;

    return (
        <>
            <div className={b()}>
                <div className={b('content-cell')}>
                    <div className={b('title')}>
                        <div className={b('visibility-btn')} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronDown /> : <ChevronUp />}
                        </div>
                        <div className={b('title-text')}>{title}</div>
                    </div>
                </div>
                <div className={b('content-cell')} />
                {workbook.permissions.update && (
                    <div className={b('content-cell')}>
                        <div className={b('create-btn')}>
                            <Button onClick={handleCreateEntity}>
                                <Icon data={Plus} />
                                {actionCreateText}
                            </Button>
                        </div>
                    </div>
                )}
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
        </>
    );
};

export {MainTabContent};
