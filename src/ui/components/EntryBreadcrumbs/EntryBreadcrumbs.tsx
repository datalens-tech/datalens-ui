import React from 'react';

import {Breadcrumbs} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Link, useHistory, useLocation} from 'react-router-dom';
import type {EntryBreadcrumbsProps} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';

import {getWorkbookBreadcrumbsItems} from './helpers';

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
            renderRootContent={entry?.workbookId ? undefined : renderRootContent}
            renderItemContent={(item: BreadcrumbsItem, isCurrent: boolean) => {
                if (isCurrent) {
                    return item.text;
                }

                return item.path ? (
                    <Link
                        to={item.path}
                        className={b('item', {link: true})}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {item.text}
                    </Link>
                ) : (
                    <div className={b('item')}>{item.text}</div>
                );
            }}
        />
    );
};
