import React from 'react';

import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema/types';
import {selectCollectionBreadcrumbs} from 'ui/units/collections-navigation/store/selectors';
import {isMobileView} from 'ui/utils/mobile';

import {COLLECTIONS_PATH, WORKBOOKS_PATH} from '../../../../collections-navigation/constants';
import {setCollectionBreadcrumbs} from '../../../../collections-navigation/store/actions';
import {setWorkbook} from '../../../../workbooks/store/actions';
import {setCollection} from '../../../store/actions';

import '../CollectionContentTable.scss';

const b = block('dl-collection-content-table');

type CollectionLinkRowProps = {
    item: WorkbookWithPermissions | CollectionWithPermissions;
};

export const CollectionLinkRow: React.FC<CollectionLinkRowProps> = ({children, item}) => {
    const dispatch = useDispatch();
    const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

    return (
        <Link
            to={
                'workbookId' in item
                    ? `${WORKBOOKS_PATH}/${item.workbookId}`
                    : `${COLLECTIONS_PATH}/${item.collectionId}`
            }
            className={b('content-row')}
            onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                    if ('workbookId' in item) {
                        dispatch(setWorkbook(item));
                    } else {
                        batch(() => {
                            dispatch(setCollection(item));
                            if (
                                !isMobileView &&
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
