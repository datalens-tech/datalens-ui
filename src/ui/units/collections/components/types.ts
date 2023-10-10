import React from 'react';

import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';

import {CollectionContentFilters} from '../../../components/CollectionFilters/CollectionFilters';

type CollectionContentProps = {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
    getWorkbookActions: any;
    getCollectionActions: any;
    onClickStopPropagation: React.MouseEventHandler;
};

export {CollectionContentProps};
