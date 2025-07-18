import React from 'react';

import {Breadcrumbs} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHistory, useLocation} from 'react-router-dom';
import type {
    BreadcrumbsItem,
    EntryBreadcrumbsProps,
} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';

import {getWorkbookBreadcrumbsItems} from './helpers';

import './EntryBreadcrumbs.scss';

const b = block('entry-panel-breadcrumbs');

export const EntryBreadcrumbs = (props: EntryBreadcrumbsProps) => {
    const {renderRootContent, entry, workbookName, workbookBreadcrumbs, endContent} = props;

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
        <Breadcrumbs showRoot className={b()} endContent={endContent}>
            {breadcrumbsItems.map((item, index) => {
                const last = index === breadcrumbsItems.length - 1;
                let content: React.ReactNode = null;

                if (index === 0 && !entry?.workbookId && renderRootContent) {
                    content = renderRootContent(item);
                }

                content = item.text;

                return (
                    <Breadcrumbs.Item
                        key={index}
                        onClick={(event) => {
                            if (!event.metaKey && item.action) {
                                event.preventDefault();

                                item.action(event);
                            }
                        }}
                        className={b('item', {link: Boolean(item.path)})}
                        disabled={last}
                        href={item.path}
                    >
                        {content}
                    </Breadcrumbs.Item>
                );
            })}
        </Breadcrumbs>
    );
};
