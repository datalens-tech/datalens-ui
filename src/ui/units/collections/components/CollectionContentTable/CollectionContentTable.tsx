import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu, DropdownMenuItem} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {batch, useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

import type {
    CollectionWithPermissions,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {AnimateBlock} from '../../../../components/AnimateBlock';
import {CollectionIcon} from '../../../../components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {COLLECTIONS_PATH, WORKBOOKS_PATH} from '../../../collections-navigation/constants';
import {setCollectionBreadcrumbs} from '../../../collections-navigation/store/actions';
import {selectCollectionBreadcrumbs} from '../../../collections-navigation/store/selectors';
import {setWorkbook} from '../../../workbooks/store/actions';
import {setCollection} from '../../store/actions';
import {selectCollectionContentItems} from '../../store/selectors';
import type {SelectedMap, UpdateCheckboxArgs} from '../CollectionPage/hooks';

import './CollectionContentTable.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-content-table');

type Props = {
    selectedMap: SelectedMap;
    itemsAvailableForSelectionCount: number;
    getWorkbookActions: (
        item: WorkbookWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    getCollectionActions: (
        item: CollectionWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
    onUpdateAllCheckboxesClick: (checked: boolean) => void;
};

export const CollectionContentTable = React.memo<Props>(
    ({
        selectedMap,
        itemsAvailableForSelectionCount,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckboxClick,
        onUpdateAllCheckboxesClick,
    }) => {
        const dispatch = useDispatch();

        const items = useSelector(selectCollectionContentItems);
        const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

        const selectedCount = Object.keys(selectedMap).length;

        const checkboxPropsSelected = React.useMemo(() => {
            if (itemsAvailableForSelectionCount > 0) {
                if (selectedCount > 0) {
                    if (selectedCount === itemsAvailableForSelectionCount) {
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
        }, [selectedCount, itemsAvailableForSelectionCount]);

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
                                            onUpdateAllCheckboxesClick(
                                                selectedCount !== itemsAvailableForSelectionCount,
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
                            {items.map((item) => {
                                const canMoveItem = item.permissions.move;

                                const actions =
                                    'workbookId' in item
                                        ? getWorkbookActions(item)
                                        : getCollectionActions(item);

                                return (
                                    <Link
                                        to={
                                            'workbookId' in item
                                                ? `${WORKBOOKS_PATH}/${item.workbookId}`
                                                : `${COLLECTIONS_PATH}/${item.collectionId}`
                                        }
                                        key={
                                            'workbookId' in item
                                                ? item.workbookId
                                                : item.collectionId
                                        }
                                        className={b('content-row')}
                                        onClick={(e) => {
                                            if (!e.metaKey && !e.ctrlKey) {
                                                if ('workbookId' in item) {
                                                    dispatch(setWorkbook(item));
                                                } else {
                                                    batch(() => {
                                                        dispatch(setCollection(item));
                                                        if (
                                                            !breadcrumbs.find(
                                                                (breadcrumb) =>
                                                                    breadcrumb.collectionId ===
                                                                    item.collectionId,
                                                            )
                                                        ) {
                                                            dispatch(
                                                                setCollectionBreadcrumbs([
                                                                    ...breadcrumbs,
                                                                    item,
                                                                ]),
                                                            );
                                                        }
                                                    });
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
                                                        onUpdateCheckboxClick({
                                                            entityId: item.workbookId,
                                                            type: 'workbook',
                                                            checked,
                                                        });
                                                    } else {
                                                        onUpdateCheckboxClick({
                                                            entityId: item.collectionId,
                                                            type: 'collection',
                                                            checked,
                                                        });
                                                    }
                                                }}
                                                disabled={!canMoveItem}
                                                checked={
                                                    Boolean(
                                                        selectedMap[
                                                            'workbookId' in item
                                                                ? item.workbookId
                                                                : item.collectionId
                                                        ],
                                                    ) && canMoveItem
                                                }
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
                                        <div
                                            className={b('content-cell', {control: true})}
                                            onClick={(e) => {
                                                if (actions.length > 0) {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            {actions.length > 0 && (
                                                <DropdownMenu size="s" items={actions} />
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
