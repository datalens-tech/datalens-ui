import React from 'react';

import {Breadcrumbs, FirstDisplayedItemsCount, LastDisplayedItemsCount} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {EntryBreadcrumbsProps} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';

import {BreadcrumbsItem, getWorkbookBreadcrumbsItems} from './helpers';

import './EntryBreadcrumbs.scss';

const b = block('entry-panel-breadcrumbs');

export const EntryBreadcrumbs = (props: EntryBreadcrumbsProps) => {
    const {renderRootContent, entry, workbookName, workbookBreadcrumbs} = props;

    const history = useHistory();
    const location = useLocation();

    let breadcrumbsItems: BreadcrumbsItem[] = [];

    if (entry?.workbookId) {
        breadcrumbsItems = getWorkbookBreadcrumbsItems({
            workbookBreadcrumbs,
            workbookName,
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
            renderRootContent={entry?.workbookId ? undefined : renderRootContent}
            renderItemContent={(item: BreadcrumbsItem) => {
                return item.path ? (
                    <Link
                        to={item.path}
                        className={b('item')}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {item.text}
                    </Link>
                ) : (
                    <div>{item.text}</div>
                );
            }}
        />
    );
};
