import React from 'react';

import {
    Breadcrumbs,
    BreadcrumbsItem,
    FirstDisplayedItemsCount,
    LastDisplayedItemsCount,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {EntryBreadcrumbsProps} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';
import {getWorkbookBreadcrumbs} from 'ui/units/workbooks/store/actions';
import {selectBreadcrumbs} from 'ui/units/workbooks/store/selectors';

import {getWorkbookBreadcrumbsItems} from './helpers';

import './EntryBreadcrumbs.scss';

const b = block('entry-panel-breadcrumbs');

export const EntryBreadcrumbs = (props: EntryBreadcrumbsProps) => {
    const {renderRootContent, entry, workbook} = props;
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    let breadcrumbsItems: BreadcrumbsItem[] = [];

    const workbookBreadcrumbs = useSelector(selectBreadcrumbs);

    React.useEffect(() => {
        if (entry?.workbookId && workbook?.collectionId) {
            dispatch(getWorkbookBreadcrumbs({collectionId: workbook.collectionId}));
        }
    }, [dispatch, entry?.workbookId, workbook]);

    if (entry?.workbookId) {
        breadcrumbsItems = getWorkbookBreadcrumbsItems({
            workbookBreadcrumbs,
            workbook,
            entry,
            history,
            location,
        });
    }

    return (
        <Breadcrumbs
            className={b()}
            items={breadcrumbsItems}
            firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
            lastDisplayedItemsCount={LastDisplayedItemsCount.One}
            renderRootContent={renderRootContent}
        />
    );
};
