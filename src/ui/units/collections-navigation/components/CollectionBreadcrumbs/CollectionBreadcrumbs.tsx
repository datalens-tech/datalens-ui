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
    GetCollectionBreadcrumb,
    GetCollectionBreadcrumbsResponse,
} from '../../../../../shared/schema';

import './CollectionBreadcrumbs.scss';

const i18n = I18n.keyset('component.collection-breadcrumbs');

const b = block('dl-collection-breadcrumbs');

type BreadcrumbsItem = {
    id: string | null;
    text: string;
    action: (event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => void;
    path: string;
};

const LOADING_ITEM_ID = '__loading';

const collectionsPath = '/collections';
const workbooksPath = '/workbooks';

export type CollectionBreadcrumbsProps = {
    className?: string;
    isLoading?: boolean;
    collectionBreadcrumbs: GetCollectionBreadcrumbsResponse;
    workbook?: {
        workbookId: string;
        title: string;
    };
    onItemClick?: (item: GetCollectionBreadcrumb) => void;
    onCurrentItemClick?: () => void;
};

export const CollectionBreadcrumbs = React.memo<CollectionBreadcrumbsProps>(
    ({
        className,
        isLoading = false,
        collectionBreadcrumbs,
        workbook,
        onItemClick,
        onCurrentItemClick,
    }) => {
        const history = useHistory();

        const items = React.useMemo<BreadcrumbsItem[]>(() => {
            const result: BreadcrumbsItem[] = [
                {
                    id: null,
                    text: i18n('label_root-title'),
                    action: () => {
                        history.push(collectionsPath);
                    },
                    path: collectionsPath,
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
                if (collectionBreadcrumbs.length > 0) {
                    collectionBreadcrumbs.forEach((item) => {
                        result.push({
                            id: item.collectionId,
                            text: item.title,
                            action: () => {
                                history.push(`${collectionsPath}/${item.collectionId}`);
                            },
                            path: `${collectionsPath}/${item.collectionId}`,
                        });
                    });
                }

                if (workbook) {
                    result.push({
                        id: workbook.workbookId,
                        text: workbook.title,
                        action: () => {
                            history.push(`${workbooksPath}/${workbook.workbookId}`);
                        },
                        path: `${workbooksPath}/${workbook.workbookId}`,
                    });
                }
            }

            return result;
        }, [isLoading, history, collectionBreadcrumbs, workbook]);

        return (
            <div className={b(null, className)}>
                <UIKitBreadcrumbs<BreadcrumbsItem>
                    items={items}
                    firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
                    lastDisplayedItemsCount={LastDisplayedItemsCount.One}
                    renderItemContent={(item: BreadcrumbsItem, isCurrent: boolean) => {
                        if (item.id === LOADING_ITEM_ID) {
                            return <Skeleton className={b('skeleton')} />;
                        }
                        return (
                            <Link
                                className={b('item', {last: isCurrent})}
                                to={item.path}
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (!e.metaKey) {
                                        if (isCurrent && onCurrentItemClick) {
                                            onCurrentItemClick();
                                        } else if (onItemClick && item.id) {
                                            onItemClick({
                                                collectionId: item.id,
                                                title: item.text,
                                            });
                                        }
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
