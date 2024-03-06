import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link} from 'react-router-dom';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';

import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {LayoutContext} from '../../../collections-navigation/contexts/LayoutContext';
import {AnimateBlock} from '../AnimateBlock';
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
        const {setLayout} = React.useContext(LayoutContext);

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

                                if ('workbookId' in item) {
                                    const actions = getWorkbookActions(item);

                                    return (
                                        <Link
                                            to={`/workbooks/${item.workbookId}`}
                                            key={item.workbookId}
                                            className={b('content-row')}
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
                                                        onUpdateCheckbox(
                                                            checked,
                                                            'workbook',
                                                            item.workbookId,
                                                        );
                                                    }}
                                                    disabled={!canMoveItem}
                                                    checked={Boolean(
                                                        selectedMap[item.workbookId]?.checked &&
                                                            canMoveItem,
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
                                            className={b('content-row')}
                                            onClick={() => {
                                                setLayout({
                                                    title: {content: item.title},
                                                    description: {content: item.description},
                                                });
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
                                                        onUpdateCheckbox(
                                                            checked,
                                                            'collection',
                                                            item.collectionId,
                                                        );
                                                    }}
                                                    disabled={!canMoveItem}
                                                    checked={Boolean(
                                                        selectedMap[item.collectionId]?.checked &&
                                                            canMoveItem,
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
                                                            <DropdownMenu
                                                                size="s"
                                                                items={actions}
                                                            />
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
                </AnimateBlock>
            </div>
        );
    },
);

CollectionContentTable.displayName = 'CollectionContentTable';
