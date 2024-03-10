import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

import {CollectionIcon} from '../../../../components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {AnimateBlock} from '../../../collections-navigation/components/AnimateBlock';
import {setCollectionBreadcrumbs} from '../../../collections-navigation/store/actions';
import {selectCollectionBreadcrumbs} from '../../../collections-navigation/store/selectors';
import {setWorkbook} from '../../../workbooks/store/actions';
import {setCollection} from '../../store/actions';
import {CollectionContentTableProps} from '../types';
import {onClickStopPropagation} from '../utils';

import './CollectionContentTable.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-content-table');

export const CollectionContentTable = React.memo<CollectionContentTableProps>(
    ({
        contentItems,
        countItemsWithPermissionMove,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckbox,
        onSelectAll,
        selectedMap,
        countSelected,
        canMove,
    }) => {
        const dispatch = useDispatch();

        const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

        const checkboxPropsSelected = React.useMemo(() => {
            if (canMove) {
                if (countSelected > 0) {
                    if (countSelected === countItemsWithPermissionMove) {
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
        }, [countSelected, canMove, countItemsWithPermissionMove]);

        return (
            <div className={b()}>
                <AnimateBlock>
                    <div className={b('table')}>
                        <div className={b('header')}>
                            <div className={b('header-row')}>
                                <div className={b('header-cell')}>
                                    <Checkbox
                                        size="l"
                                        onUpdate={() => {
                                            onSelectAll(
                                                countSelected !== countItemsWithPermissionMove,
                                            );
                                        }}
                                        {...checkboxPropsSelected}
                                    />
                                </div>
                                <div className={b('header-cell')}>{i18n('label_title')}</div>
                                <div className={b('header-cell')}>
                                    {i18n('label_last-modified')}
                                </div>
                                <div className={b('header-cell')} />
                            </div>
                        </div>

                        <div className={b('content')}>
                            {contentItems.map((item) => {
                                const canMoveItem = item.permissions.move;

                                const actions =
                                    'workbookId' in item
                                        ? getWorkbookActions(item)
                                        : getCollectionActions(item);

                                return (
                                    <Link
                                        to={
                                            'workbookId' in item
                                                ? `/workbooks/${item.workbookId}`
                                                : `/collections/${item.collectionId}`
                                        }
                                        key={
                                            'workbookId' in item
                                                ? item.workbookId
                                                : item.collectionId
                                        }
                                        className={b('content-row')}
                                        onClick={(e) => {
                                            if (!e.metaKey) {
                                                if ('workbookId' in item) {
                                                    dispatch(setWorkbook(item));
                                                } else {
                                                    dispatch(setCollection(item));
                                                    dispatch(
                                                        setCollectionBreadcrumbs([
                                                            ...breadcrumbs,
                                                            {
                                                                collectionId: item.collectionId,
                                                                title: item.title,
                                                            },
                                                        ]),
                                                    );
                                                }
                                            }
                                        }}
                                    >
                                        <div
                                            className={b('content-cell', {
                                                disabled: !canMoveItem,
                                            })}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Checkbox
                                                size="l"
                                                onUpdate={(checked) => {
                                                    if ('workbookId' in item) {
                                                        onUpdateCheckbox(
                                                            checked,
                                                            'workbook',
                                                            item.workbookId,
                                                        );
                                                    } else {
                                                        onUpdateCheckbox(
                                                            checked,
                                                            'collection',
                                                            item.collectionId,
                                                        );
                                                    }
                                                }}
                                                disabled={!canMoveItem}
                                                checked={Boolean(
                                                    selectedMap[
                                                        'workbookId' in item
                                                            ? item.workbookId
                                                            : item.collectionId
                                                    ]?.checked && canMoveItem,
                                                )}
                                            />
                                        </div>

                                        <div className={b('content-cell', {title: true})}>
                                            <div className={b('title-col')}>
                                                <div className={b('title-col-icon')}>
                                                    {'workbookId' in item ? (
                                                        <WorkbookIcon title={item.title} />
                                                    ) : (
                                                        <CollectionIcon />
                                                    )}
                                                </div>
                                                <div className={b('title-col-text')}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={b('content-cell', {date: true})}>
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
                            })}
                        </div>
                    </div>
                </AnimateBlock>
            </div>
        );
    },
);

CollectionContentTable.displayName = 'CollectionContentTable';
