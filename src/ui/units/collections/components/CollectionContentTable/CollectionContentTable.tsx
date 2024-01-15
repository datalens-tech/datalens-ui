import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link} from 'react-router-dom';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';

import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {CollectionContentTableProps} from '../types';
import {onClickStopPropagation} from '../utils';

import './CollectionContentTable.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-content-table');

export const CollectionContentTable = React.memo<CollectionContentTableProps>(
    ({
        contentItems,
        filters,
        setFilters,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckbox,
        onSelectAll,
        selectedMap,
        countSelected,
        isСanMove,
    }) => {
        const checkboxPropsSelected = React.useMemo(() => {
            if (isСanMove) {
                if (countSelected > 0) {
                    if (countSelected === contentItems.length) {
                        return {checked: true};
                    } else {
                        return {indeterminate: true};
                    }
                } else {
                    return {checked: false};
                }
            } else {
                return {disabled: true};
            }
        }, [contentItems.length, countSelected, isСanMove]);

        return (
            <div className={b()}>
                <div className={b('table')}>
                    <div className={b('header')}>
                        <div className={b('header-row')}>
                            <div className={b('header-cell')}>
                                <Checkbox
                                    size="l"
                                    onUpdate={() => {
                                        onSelectAll(countSelected !== contentItems.length);
                                    }}
                                    {...checkboxPropsSelected}
                                />
                            </div>
                            <div className={b('header-cell')}>{i18n('label_title')}</div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                        </div>
                    </div>
                    <div className={b('content')}>
                        {contentItems.map((item) => {
                            const canMove = item.permissions.move;

                            if ('workbookId' in item) {
                                const actions = getWorkbookActions(item);

                                return (
                                    <Link
                                        to={`/workbooks/${item.workbookId}`}
                                        onClick={() => {
                                            setFilters({...filters, filterString: undefined});
                                        }}
                                        key={item.workbookId}
                                        className={b('content-row')}
                                    >
                                        <div
                                            className={b('content-cell')}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Checkbox
                                                size="l"
                                                onUpdate={(checked) => {
                                                    onUpdateCheckbox(
                                                        checked,
                                                        'workbook',
                                                        item.workbookId,
                                                    );
                                                }}
                                                disabled={!canMove}
                                                checked={Boolean(
                                                    selectedMap[item.workbookId]?.checked &&
                                                        canMove,
                                                )}
                                            />
                                        </div>

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
                                            }).fromNow()}
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
                                        to={`/collections/${item.collectionId}`}
                                        key={item.collectionId}
                                        onClick={() => {
                                            setFilters({...filters, filterString: undefined});
                                        }}
                                        className={b('content-row')}
                                    >
                                        <div
                                            className={b('content-cell')}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Checkbox
                                                size="l"
                                                onUpdate={(checked) => {
                                                    onUpdateCheckbox(
                                                        checked,
                                                        'collection',
                                                        item.collectionId,
                                                    );
                                                }}
                                                disabled={!canMove}
                                                checked={Boolean(
                                                    selectedMap[item.collectionId]?.checked &&
                                                        canMove,
                                                )}
                                            />
                                        </div>
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
                                            }).fromNow()}
                                        </div>
                                        <div className={b('content-cell', {control: true})}>
                                            <div onClick={onClickStopPropagation}>
                                                {actions.length > 0 ? (
                                                    <div>
                                                        <DropdownMenu size="s" items={actions} />
                                                    </div>
                                                ) : null}
                                            </div>
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
