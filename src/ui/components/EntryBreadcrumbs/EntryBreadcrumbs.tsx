import React from 'react';

import {
    Breadcrumbs,
    BreadcrumbsProps,
    FirstDisplayedItemsCount,
    LastDisplayedItemsCount,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHistory, useLocation} from 'react-router-dom';
import {EntryBreadcrumbsProps} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';

import {getWorkbookBreadcrumbsItems} from './helpers';

import './EntryBreadcrumbs.scss';

const b = block('entry-panel-breadcrumbs');

export const EntryBreadcrumbs = (props: EntryBreadcrumbsProps) => {
    const {renderRootContent, entry, workbookName} = props;

    const history = useHistory();
    const location = useLocation();

    const breadcrumbsItems: BreadcrumbsProps['items'] = getWorkbookBreadcrumbsItems({
        entry,
        workbookName,
        history,
        location,
    });

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
