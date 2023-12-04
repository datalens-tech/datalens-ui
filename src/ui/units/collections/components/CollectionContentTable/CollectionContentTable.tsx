import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link} from 'react-router-dom';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';

import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {CollectionContentProps} from '../types';
import {onClickStopPropagation} from '../utils';

import './CollectionContentTable.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-content-table');

export const CollectionContentTable = React.memo<CollectionContentProps>(
    ({
        contentItems,
        filters,
        setFilters,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckbox,
        selectedMap,
    }) => {
        return (
            <div className={b()}>
                <div className={b('table')}>
                    <div className={b('header')}>
                        <div className={b('header-row')}>
                            <div className={b('header-cell')}>
                                <Checkbox size="l" />
                            </div>
                            <div className={b('header-cell')}>{i18n('label_title')}</div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                        </div>
                    </div>
                    <div className={b('content')}>
                        {contentItems.map((item) => {
                            if ('workbookId' in item) {
                                const actions = getWorkbookActions(item);
                                const propsLink = {
                                    to: `/workbooks/${item.workbookId}`,
                                    onClick: () => {
                                        setFilters({...filters, filterString: undefined});
                                    },
                                };

                                return (
                                    <div key={item.workbookId} className={b('content-row')}>
                                        <div className={b('content-cell')}>
                                            <Checkbox
                                                size="l"
                                                onUpdate={(checked) => {
                                                    onUpdateCheckbox(
                                                        checked,
                                                        'workbook',
                                                        item.workbookId,
                                                    );
                                                }}
                                                checked={selectedMap[item.workbookId]?.checked}
                                            />
                                        </div>

                                        <Link
                                            {...propsLink}
                                            className={b('content-cell', {title: true})}
                                        >
                                            <div className={b('title-col')}>
                                                <div className={b('title-col-icon')}>
                                                    <WorkbookIcon title={item.title} />
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </Link>
                                        <Link {...propsLink} className={b('content-cell')}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).fromNow()}
                                        </Link>
                                        <Link
                                            {...propsLink}
                                            className={b('content-cell', {control: true})}
                                        >
                                            {actions.length > 0 && (
                                                <div onClick={onClickStopPropagation}>
                                                    <DropdownMenu size="s" items={actions} />
                                                </div>
                                            )}
                                        </Link>
                                    </div>
                                );
                            } else {
                                const actions = getCollectionActions(item);
                                const propsLink = {
                                    to: `/collections/${item.collectionId}`,
                                    onClick: () => {
                                        setFilters({...filters, filterString: undefined});
                                    },
                                };

                                return (
                                    <div key={item.collectionId} className={b('content-row')}>
                                        <div className={b('content-cell')}>
                                            <Checkbox
                                                size="l"
                                                onUpdate={(checked) => {
                                                    onUpdateCheckbox(
                                                        checked,
                                                        'collection',
                                                        item.collectionId,
                                                    );
                                                }}
                                                checked={selectedMap[item.collectionId]?.checked}
                                            />
                                        </div>
                                        <Link
                                            {...propsLink}
                                            className={b('content-cell', {title: true})}
                                        >
                                            <div className={b('title-col')}>
                                                <div className={b('title-col-icon')}>
                                                    <CollectionIcon />
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </Link>
                                        <Link {...propsLink} className={b('content-cell')}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).fromNow()}
                                        </Link>
                                        <Link
                                            {...propsLink}
                                            className={b('content-cell', {control: true})}
                                        >
                                            <div onClick={onClickStopPropagation}>
                                                {actions.length > 0 ? (
                                                    <div>
                                                        <DropdownMenu size="s" items={actions} />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Link>
                                    </div>
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
