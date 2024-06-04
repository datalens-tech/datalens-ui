import React from 'react';

import {
    FirstDisplayedItemsCount,
    LastDisplayedItemsCount,
    Skeleton,
    Breadcrumbs as UIKitBreadcrumbs,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link, useHistory} from 'react-router-dom';

import type {
    GetCollectionBreadcrumbsResponse,
    GetWorkbookResponse,
} from '../../../../../shared/schema';
import {COLLECTIONS_PATH, WORKBOOKS_PATH} from '../../constants';

import './CollectionBreadcrumbs.scss';

const i18n = I18n.keyset('component.collection-breadcrumbs');

const b = block('dl-collection-breadcrumbs');

const LOADING_ITEM_ID = '__loading';

type BreadcrumbsItem = {
    id: string | null;
    text: string;
    action: (event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => void;
    path: string;
};

type Props = {
    className?: string;
    isLoading?: boolean;
    collections: GetCollectionBreadcrumbsResponse;
    workbook: GetWorkbookResponse | null;
    onItemClick?: (args: {id: string | null; isCurrent: boolean}) => void;
};

export const CollectionBreadcrumbs = React.memo<Props>(
    ({className, isLoading = false, collections, workbook, onItemClick}) => {
        const history = useHistory();

        const items = React.useMemo<BreadcrumbsItem[]>(() => {
            const result: BreadcrumbsItem[] = [
                {
                    id: null,
                    text: i18n('label_root-title'),
                    action: () => {
                        history.push(COLLECTIONS_PATH);
                    },
                    path: COLLECTIONS_PATH,
                },
            ];

            if (isLoading) {
                result.push({
                    id: LOADING_ITEM_ID,
                    text: '',
                    action: () => {},
                    path: '',
                });
            } else {
                if (collections.length > 0) {
                    collections.forEach((item) => {
                        result.push({
                            id: item.collectionId,
                            text: item.title,
                            action: () => {
                                history.push(`${COLLECTIONS_PATH}/${item.collectionId}`);
                            },
                            path: `${COLLECTIONS_PATH}/${item.collectionId}`,
                        });
                    });
                }

                if (workbook) {
                    result.push({
                        id: workbook.workbookId,
                        text: workbook.title,
                        action: () => {
                            history.push(`${WORKBOOKS_PATH}/${workbook.workbookId}`);
                        },
                        path: `${WORKBOOKS_PATH}/${workbook.workbookId}`,
                    });
                }
            }

            return result;
        }, [isLoading, history, collections, workbook]);

        return (
            <div className={b(null, className)}>
                <UIKitBreadcrumbs
                    items={items}
                    firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
                    lastDisplayedItemsCount={LastDisplayedItemsCount.One}
                    className={b('container')}
                    renderItemContent={(item: BreadcrumbsItem, isCurrent: boolean) => {
                        if (item.id === LOADING_ITEM_ID) {
                            return <Skeleton className={b('skeleton')} />;
                        }

                        return (
                            <Link
                                className={b('item', {last: isCurrent, link: true})}
                                to={item.path}
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (!e.metaKey && onItemClick) {
                                        onItemClick({id: item.id, isCurrent});
                                    }
                                }}
                            >
                                {item.text}
                            </Link>
                        );
                    }}
                />
            </div>
        );
    },
);

CollectionBreadcrumbs.displayName = 'CollectionBreadcrumbs';
