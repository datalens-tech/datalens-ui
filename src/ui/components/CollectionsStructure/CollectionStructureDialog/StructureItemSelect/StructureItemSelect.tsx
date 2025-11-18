import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Card, Icon, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Waypoint} from 'react-waypoint';
import type {WorkbookId} from 'shared';
import {CollectionItemEntities} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import type {
    GetCollectionBreadcrumbsResponse,
    GetStructureItemsArgs,
    GetStructureItemsResponse,
    StructureItem,
} from '../../../../../shared/schema/us/types/collections';
import {CollectionsStructureBreadcrumbs} from '../../../Breadcrumbs/CollectionsStructureBreadcrumbs/CollectionsStructureBreadcrumbs';
import {SmartLoader} from '../../../SmartLoader/SmartLoader';

import {Item} from './Item';

import infoIcon from '../../../../assets/icons/info.svg';

import './StructureItemSelect.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-collections-structure-structure-item-select');

export type Props = {
    collectionId: string | null;
    workbookId: WorkbookId;
    contentIsLoading: boolean;
    contentError: Error | null;
    breadcrumbs: GetCollectionBreadcrumbsResponse;
    items: StructureItem[];
    nextPageToken: string | null;
    pageSize: number;
    isSelectionAllowed: boolean;
    operationDeniedMessage?: string;
    canSelectWorkbook: boolean;
    disabled?: boolean;
    getStructureItemsRecursively: (
        args: GetStructureItemsArgs,
    ) => CancellablePromise<GetStructureItemsResponse | null>;
    onChangeCollection: (newValue: string | null) => void;
    onChangeWorkbook?: (newValue: string) => void;
    onSelectEntry?: (entry: StructureItem) => void;
    getIsInactiveItem?: (item: StructureItem) => boolean;
};

export const StructureItemSelect = React.memo<Props>(
    ({
        collectionId,
        workbookId,
        contentIsLoading,
        contentError,
        breadcrumbs,
        items,
        nextPageToken,
        pageSize,
        isSelectionAllowed,
        operationDeniedMessage,
        canSelectWorkbook,
        disabled,
        getStructureItemsRecursively,
        onChangeCollection,
        getIsInactiveItem,
        onChangeWorkbook = () => {},
        onSelectEntry = () => {},
    }) => {
        const [waypointDisabled, setWaypointDisabled] = React.useState(false);

        React.useEffect(() => {
            if (contentError) {
                setWaypointDisabled(true);
            }
        }, [contentError]);

        const onWaypointEnter = React.useCallback(() => {
            if (nextPageToken) {
                getStructureItemsRecursively({
                    collectionId,
                    page: nextPageToken,
                    pageSize,
                }).then((res) => {
                    if (res?.nextPageToken && res?.nextPageToken === nextPageToken) {
                        setWaypointDisabled(true);
                    }
                    return res;
                });
            }
        }, [collectionId, getStructureItemsRecursively, nextPageToken, pageSize]);

        return (
            <div
                className={b({
                    disabled,
                    'denied-and-empty': !isSelectionAllowed && !items.length,
                })}
            >
                {contentIsLoading && items.length === 0 ? (
                    <div className={b('main-loader')}>
                        <SmartLoader size="m" showAfter={0} />
                    </div>
                ) : (
                    <React.Fragment>
                        <div className={b('breadcrumbs')}>
                            <CollectionsStructureBreadcrumbs
                                items={breadcrumbs}
                                onChange={onChangeCollection}
                            />
                        </div>
                        {!isSelectionAllowed && (
                            <div className={b('denied-message-wrapper')}>
                                <Card theme="info" type="container" view="filled">
                                    <div className={b('denied-message')}>
                                        <div className={b('denied-message-icon')}>
                                            <Icon data={infoIcon} size={15} />
                                        </div>
                                        <div className={b('denied-message-text')}>
                                            {operationDeniedMessage}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                        {items.length > 0 ? (
                            <React.Fragment>
                                <div className={b('items')}>
                                    {items.map((item) => {
                                        const isInactive = getIsInactiveItem?.(item) ?? false;
                                        return (
                                            <Item
                                                key={
                                                    'workbookId' in item
                                                        ? item.workbookId
                                                        : item.collectionId
                                                }
                                                inactive={isInactive}
                                                item={item}
                                                active={
                                                    'workbookId' in item &&
                                                    canSelectWorkbook &&
                                                    item.workbookId === workbookId
                                                }
                                                canSelectWorkbook={canSelectWorkbook}
                                                onSelect={(selectedItem) => {
                                                    switch (selectedItem.entity) {
                                                        case CollectionItemEntities.WORKBOOK:
                                                            if (canSelectWorkbook) {
                                                                onChangeWorkbook(
                                                                    selectedItem.workbookId,
                                                                );
                                                            }
                                                            break;
                                                        case CollectionItemEntities.COLLECTION:
                                                            onChangeCollection(
                                                                selectedItem.collectionId,
                                                            );
                                                            break;
                                                        case CollectionItemEntities.ENTRY:
                                                            if (!isInactive) {
                                                                onSelectEntry(selectedItem);
                                                            }
                                                            break;
                                                    }
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                {contentIsLoading && (
                                    <div className={b('page-loader')}>
                                        <Loader size="m" />
                                    </div>
                                )}
                                {!contentIsLoading && !waypointDisabled && (
                                    <Waypoint onEnter={onWaypointEnter} />
                                )}
                            </React.Fragment>
                        ) : (
                            <PlaceholderIllustration
                                title={i18n('label_empty-collection')}
                                name="emptyDirectory"
                                direction="column"
                            />
                        )}
                    </React.Fragment>
                )}
            </div>
        );
    },
);

StructureItemSelect.displayName = 'StructureItemSelect';
