import React from 'react';

import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import {Link, useHistory} from 'react-router-dom';
import {CollectionContentTableQa} from 'shared';
import {WORKBOOK_STATUS} from 'shared/constants/workbooks';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema/types';
import {DIALOG_CREATE_WORKBOOK} from 'ui/components/CollectionsStructure/CreateWorkbookDialog/CreateWorkbookDialog';
import {DL} from 'ui/constants/common';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {selectCollectionBreadcrumbs} from 'ui/units/collections-navigation/store/selectors';

import {COLLECTIONS_PATH, WORKBOOKS_PATH} from '../../../../collections-navigation/constants';
import {setCollectionBreadcrumbs} from '../../../../collections-navigation/store/actions';
import {setWorkbook} from '../../../../workbooks/store/actions';
import {setCollection} from '../../../store/actions';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionLinkRowProps = {
    item: WorkbookWithPermissions | CollectionWithPermissions;
    isDisabled: boolean;
};

export const CollectionLinkRow: React.FC<CollectionLinkRowProps> = ({
    children,
    item,
    isDisabled,
}) => {
    const dispatch = useDispatch();

    const history = useHistory();

    const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

    const isWorkbookItem = 'workbookId' in item;

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

    return (
        <Link
            data-qa={
                isWorkbookItem
                    ? CollectionContentTableQa.WorkbookLinkRow
                    : CollectionContentTableQa.CollectionLinkRow
            }
            to={
                isWorkbookItem
                    ? `${WORKBOOKS_PATH}/${item.workbookId}`
                    : `${COLLECTIONS_PATH}/${item.collectionId}`
            }
            className={b('content-row')}
            onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                    if (isWorkbookItem) {
                        dispatch(setWorkbook(item));
                    } else {
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
