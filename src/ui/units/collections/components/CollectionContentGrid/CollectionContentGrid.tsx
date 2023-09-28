import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';

import {CollectionContentFilters} from '../../../../components/CollectionFilters/CollectionFilters';
import {IconById} from '../../../../components/IconById/IconById';
import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';

import './CollectionContentGrid.scss';

const b = block('dl-collection-content-grid');

type Props = {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
};

export const CollectionContentGrid = React.memo<Props>(({contentItems, filters, setFilters}) => {
    return (
        <div className={b()}>
            <div className={b('grid')}>
                {contentItems.map((item) => {
                    if ('workbookId' in item) {
                        return (
                            <Link
                                key={item.workbookId}
                                to={`/workbooks/${item.workbookId}`}
                                className={b('content-row')}
                                onClick={() => {
                                    setFilters({...filters, filterString: undefined});
                                }}
                            >
                                <div className={b('content-cell', {title: true})}>
                                    <div className={b('title-col')}>
                                        <div className={b('title-col-icon')}>
                                            <WorkbookIcon title={item.title} size={125} />
                                        </div>
                                        <div className={b('title-col-text')}>{item.title}</div>
                                    </div>
                                </div>
                                <div className={b('content-date')}>
                                    {dateTime({
                                        input: item.updatedAt,
                                    }).fromNow()}
                                </div>
                            </Link>
                        );
                    } else {
                        return (
                            <Link
                                key={item.collectionId}
                                to={`/collections/${item.collectionId}`}
                                className={b('content-row')}
                                onClick={() => {
                                    setFilters({...filters, filterString: undefined});
                                }}
                            >
                                <div className={b('content-cell', {title: true})}>
                                    <div className={b('title-col')}>
                                        <div className={b('title-col-icon')}>
                                            <IconById id="collectionColoredNew" size={125} />
                                        </div>
                                        <div className={b('title-col-text')}>{item.title}</div>
                                    </div>
                                </div>
                                <div className={b('content-date')}>
                                    {dateTime({
                                        input: item.updatedAt,
                                    }).fromNow()}
                                </div>
                            </Link>
                        );
                    }
                })}
            </div>
        </div>
    );
});

CollectionContentGrid.displayName = 'CollectionContentGrid';
