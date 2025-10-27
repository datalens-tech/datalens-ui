import React from 'react';

import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import {Link, useHistory} from 'react-router-dom';
import {CollectionContentTableQa, CollectionItemEntities} from 'shared';
import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import type {StructureItem} from 'shared/schema/types';
import {DIALOG_CREATE_WORKBOOK} from 'ui/components/CollectionsStructure/CreateWorkbookDialog/CreateWorkbookDialog';
import {DL} from 'ui/constants/common';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {selectCollectionBreadcrumbs} from 'ui/units/collections-navigation/store/selectors';

import {WORKBOOKS_PATH} from '../../../../collections-navigation/constants';
import {setCollectionBreadcrumbs} from '../../../../collections-navigation/store/actions';
import {setWorkbook} from '../../../../workbooks/store/actions';
import type {RefreshPageAfterImport} from '../../../hooks/useRefreshPageAfterImport';
import {setCollection} from '../../../store/actions';
import {getItemLink} from '../../helpers';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionLinkRowProps = {
    item: StructureItem;
    isDisabled: boolean;
    refreshPageAfterImport: RefreshPageAfterImport;
};

export const CollectionLinkRow: React.FC<CollectionLinkRowProps> = ({
    children,
    item,
    isDisabled,
    refreshPageAfterImport,
}) => {
    const dispatch = useDispatch();

    const history = useHistory();

    const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

    const isWorkbookItem = item.entity === CollectionItemEntities.WORKBOOK;
    const isEntryItem = item.entity === CollectionItemEntities.ENTRY;

    if (isDisabled && isWorkbookItem) {
        const isImport = Boolean(item.status === WORKBOOK_STATUS.CREATING && item.meta.importId);

        const handleImportingWorkbookClick = () => {
            dispatch(
                openDialog({
                    id: DIALOG_CREATE_WORKBOOK,
                    props: {
                        open: true,
                        collectionId: item.collectionId,
                        defaultView: 'import',
                        onCreateWorkbook: ({workbookId}) => {
                            if (workbookId) {
                                history.push(`${WORKBOOKS_PATH}/${workbookId}`);
                            }
                        },
                        onClose: () => {
                            dispatch(closeDialog());
                            refreshPageAfterImport('pending');
                        },
                        importId: item.meta.importId,
                    },
                }),
            );
        };

        // possible statuses: interactive 'creating' and non-interactive 'deleting'
        return (
            <div
                role={isImport ? 'button' : undefined}
                className={b('content-row', {disabled: true})}
                onClick={isImport ? handleImportingWorkbookClick : undefined}
            >
                {children}
            </div>
        );
    }
    const dataQa = {
        [CollectionItemEntities.COLLECTION]: CollectionContentTableQa.CollectionLinkRow,
        [CollectionItemEntities.WORKBOOK]: CollectionContentTableQa.WorkbookLinkRow,
        [CollectionItemEntities.ENTRY]: CollectionContentTableQa.EntryLinkRow,
    }[item.entity];

    return (
        <Link
            data-qa={dataQa}
            to={getItemLink(item)}
            className={b('content-row')}
            onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                    if (isWorkbookItem) {
                        dispatch(setWorkbook(item));
                    } else if (!isEntryItem) {
                        batch(() => {
                            dispatch(setCollection(item));
                            if (
                                !DL.IS_MOBILE &&
                                !breadcrumbs.find(
                                    (breadcrumb) => breadcrumb.collectionId === item.collectionId,
                                )
                            ) {
                                dispatch(setCollectionBreadcrumbs([...breadcrumbs, item]));
                            }
                        });
                    }
                }
            }}
        >
            {children}
        </Link>
    );
};
