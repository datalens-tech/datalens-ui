import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link} from 'react-router-dom';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';

import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {CollectionContentProps} from '../types';

import './CollectionContentTable.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-content-table');

const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';

export const CollectionContentTable = React.memo<CollectionContentProps>(
    ({
        contentItems,
        filters,
        setFilters,
        getWorkbookActions,
        getCollectionActions,
        onClickStopPropagation,
    }) => {
        return (
            <div className={b()}>
                <div className={b('table')}>
                    <div className={b('header')}>
                        <div className={b('header-row')}>
                            <div className={b('header-cell')}>{i18n('label_title')}</div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                        </div>
                    </div>
                    <div className={b('content')}>
                        {contentItems.map((item) => {
                            if ('workbookId' in item) {
                                const actions = getWorkbookActions(item);
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
                                                    <WorkbookIcon title={item.title} />
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={b('content-cell')}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).format(DATETIME_FORMAT)}
                                        </div>
                                        <div className={b('content-cell', {control: true})}>
                                            {actions.length > 0 && (
                                                <div onClick={onClickStopPropagation}>
                                                    <DropdownMenu size="s" items={actions} />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            } else {
                                const actions = getCollectionActions(item);
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
                                                    <CollectionIcon />
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={b('content-cell')}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).format(DATETIME_FORMAT)}
                                        </div>
                                        <div
                                            className={b('content-cell', {control: true})}
                                            onClick={onClickStopPropagation}
                                        >
                                            {actions.length > 0 ? (
                                                <div>
                                                    <DropdownMenu size="s" items={actions} />
                                                </div>
                                            ) : null}
                                        </div>
                                    </Link>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        );
    },
);

CollectionContentTable.displayName = 'CollectionContentTable';
