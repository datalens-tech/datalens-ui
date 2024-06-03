import React from 'react';

import type {BreadcrumbsItem} from '@gravity-ui/uikit';
import {
    FirstDisplayedItemsCount,
    LastDisplayedItemsCount,
    Breadcrumbs as UIKitBreadcrumbs,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {GetCollectionBreadcrumbsResponse} from '../../../../shared/schema';

import './CollectionsStructureBreadcrumbs.scss';

const i18n = I18n.keyset('component.collection-breadcrumbs');

const b = block('dl-breadcrumbs-collections-structure-breadcrumbs');

export type Props = {
    items: GetCollectionBreadcrumbsResponse;
    onChange: (collectionId: string | null) => void;
};

export const CollectionsStructureBreadcrumbs: React.FC<Props> = ({items, onChange}) => {
    const preparedItems: BreadcrumbsItem[] = [
        {
            text: i18n('label_root-title'),
            action: () => {
                onChange(null);
            },
        },
    ];

    if (items.length > 0) {
        items.forEach((item) => {
            preparedItems.push({
                text: item.title,
                action: () => {
                    onChange(item.collectionId);
                },
            });
        });
    }

    return (
        <div className={b()}>
            <UIKitBreadcrumbs
                items={preparedItems}
                firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
                lastDisplayedItemsCount={LastDisplayedItemsCount.One}
                renderItemContent={(item: BreadcrumbsItem) => {
                    return (
                        <div className={b('item')} onClick={item.action}>
                            {item.text}
                        </div>
                    );
                }}
            />
        </div>
    );
};
