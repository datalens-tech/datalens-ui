import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {Waypoint} from 'react-waypoint';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import type {
    CollectionWithPermissions,
    GetCollectionContentResponse,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {CollectionContentFilters} from '../../../../components/CollectionFilters/CollectionFilters';
import {GetCollectionContentArgs} from '../../types';
import {CollectionContentGrid} from '../CollectionContentGrid/CollectionContentGrid';

import './CollectionContent.scss';

const b = block('dl-collection-content');
const i18n = I18n.keyset('collections');

type Props = {
    collectionId: string | null;
    pageSize: number;
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
    isDefaultFilters: boolean;
    isContentLoading: boolean;
    contentLoadingError: Error | null;
    canCreateWorkbook: boolean;
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    nextPageTokens: {
        collectionsNextPageToken?: string | null;
        workbooksNextPageToken?: string | null;
    };
    refreshContent?: () => void;
    getCollectionContentRecursively: (
        args: GetCollectionContentArgs,
    ) => CancellablePromise<GetCollectionContentResponse | null>;
    onCreateWorkbookClick: () => void;
    onClearFiltersClick: () => void;
};

export const CollectionContent = React.memo<Props>(
    ({
        collectionId,
        pageSize,
        filters,
        setFilters,
        isDefaultFilters,
        canCreateWorkbook,
        isContentLoading,
        contentLoadingError,
        contentItems,
        nextPageTokens,
        getCollectionContentRecursively,
        onCreateWorkbookClick,
        onClearFiltersClick,
    }) => {
        const [waypointDisabled, setWaypointDisabled] = React.useState(false);

        React.useEffect(() => {
            if (contentLoadingError) {
                setWaypointDisabled(true);
            }
        }, [contentLoadingError]);

        const onWaypointEnter = React.useCallback(() => {
            if (nextPageTokens.collectionsNextPageToken || nextPageTokens.workbooksNextPageToken) {
                getCollectionContentRecursively({
                    collectionId,
                    collectionsPage: nextPageTokens.collectionsNextPageToken,
                    workbooksPage: nextPageTokens.workbooksNextPageToken,
                    pageSize,
                    ...filters,
                }).then((res) => {
                    if (
                        (res?.collectionsNextPageToken &&
                            res?.collectionsNextPageToken ===
                                nextPageTokens.collectionsNextPageToken) ||
                        (res?.workbooksNextPageToken &&
                            res?.workbooksNextPageToken === nextPageTokens.workbooksNextPageToken)
                    ) {
                        setWaypointDisabled(true);
                    }
                    return res;
                });
            }
        }, [
            collectionId,
            filters,
            getCollectionContentRecursively,
            nextPageTokens.collectionsNextPageToken,
            nextPageTokens.workbooksNextPageToken,
            pageSize,
        ]);

        const renderCreateWorkbookAction = () => {
            if (canCreateWorkbook) {
                return (
                    <Button className={b('controls')} onClick={onCreateWorkbookClick}>
                        {i18n('action_create-workbook')}
                    </Button>
                );
            }
            return null;
        };

        const renderClearFiltersAction = () => {
            if (canCreateWorkbook) {
                return (
                    <Button className={b('controls')} onClick={onClearFiltersClick}>
                        {i18n('action_clear-filters')}
                    </Button>
                );
            }
            return null;
        };

        if (isContentLoading && contentItems.length === 0) {
            return <SmartLoader size="l" />;
        }

        if (contentItems.length === 0) {
            if (isDefaultFilters) {
                return (
                    <div className={b('empty-state')}>
                        <PlaceholderIllustration
                            name="template"
                            title={i18n('label_empty-list')}
                            description={
                                canCreateWorkbook ? i18n('section_create-first') : undefined
                            }
                            renderAction={renderCreateWorkbookAction}
                        />
                    </div>
                );
            }
            return (
                <div className={b('empty-state')}>
                    <PlaceholderIllustration
                        name="notFound"
                        title={i18n('label_not-found')}
                        description={i18n('section_incorrect-filters')}
                        renderAction={renderClearFiltersAction}
                    />
                </div>
            );
        }

        return (
            <React.Fragment>
                <CollectionContentGrid
                    contentItems={contentItems}
                    filters={filters}
                    setFilters={setFilters}
                />
                {isContentLoading && <SmartLoader size="m" showAfter={0} />}
                {!isContentLoading && !waypointDisabled && <Waypoint onEnter={onWaypointEnter} />}
            </React.Fragment>
        );
    },
);

CollectionContent.displayName = 'CollectionContent';
