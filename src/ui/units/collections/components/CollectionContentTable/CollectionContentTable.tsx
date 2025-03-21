import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {Checkbox, DropdownMenu, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {CollectionContentTableQa, DEFAULT_DATE_FORMAT} from 'shared/constants';
import {DL} from 'ui/constants/common';
import {selectDateTimeFormat} from 'ui/store/selectors/user';

import type {
    CollectionWithPermissions,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {AnimateBlock} from '../../../../components/AnimateBlock';
import {selectStructureItems} from '../../store/selectors';
import type {SelectedMap, UpdateCheckboxArgs} from '../CollectionPage/hooks';

import {CollectionCheckboxCell} from './TableComponents/CollectionCheckboxCell';
import {CollectionLinkRow} from './TableComponents/CollectionLinkRow';
import {CollectionTitleCell} from './TableComponents/CollectionTitleCell';

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
        const items = useSelector(selectStructureItems);

        const selectedCount = React.useMemo(() => Object.keys(selectedMap).length, [selectedMap]);

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

        const dateTimeFormat = useSelector(selectDateTimeFormat);

        if (DL.IS_MOBILE) {
            return (
                <div className={b({mobile: true})} data-qa={CollectionContentTableQa.Table}>
                    <AnimateBlock>
                        <div className={b('table')}>
                            <div className={b('content')}>
                                {items.map((item) => (
                                    <CollectionLinkRow
                                        key={
                                            'workbookId' in item
                                                ? item.workbookId
                                                : item.collectionId
                                        }
                                        item={item}
                                    >
                                        <CollectionTitleCell
                                            isWorkbook={'workbookId' in item}
                                            title={item.title}
                                            collectionId={item.collectionId}
                                        />
                                        <div className={b('content-cell', {date: true})}>
                                            {dateTime({
                                                input: item.updatedAt,
                                            }).format(DEFAULT_DATE_FORMAT)}
                                        </div>
                                    </CollectionLinkRow>
                                ))}
                            </div>
                        </div>
                    </AnimateBlock>
                </div>
            );
        }

        return (
            <div className={b()} data-qa={CollectionContentTableQa.Table}>
                <AnimateBlock>
                    <div className={b('table')}>
                        <div className={b('header')}>
                            <div className={b('header-row')}>
                                <div className={b('header-cell', {checkbox: true})}>
                                    <Checkbox
                                        size="l"
                                        onUpdate={() => {
                                            onUpdateAllCheckboxesClick(
                                                selectedCount !== itemsAvailableForSelectionCount,
                                            );
                                        }}
                                        checked={false}
                                        indeterminate={false}
                                        disabled={false}
                                        {...checkboxPropsSelected}
                                    />
                                </div>
                                <div className={b('header-cell', {title: true})}>
                                    {i18n('label_title')}
                                </div>
                                <div className={b('header-cell')}>
                                    {i18n('label_last-modified')}
                                </div>
                                <div className={b('header-cell', {controls: true})} />
                            </div>
                        </div>

                        <div className={b('content')}>
                            {items.map((item) => {
                                const actions =
                                    'workbookId' in item
                                        ? getWorkbookActions(item)
                                        : getCollectionActions(item);

                                return (
                                    <CollectionLinkRow
                                        key={
                                            'workbookId' in item
                                                ? item.workbookId
                                                : item.collectionId
                                        }
                                        item={item}
                                    >
                                        <CollectionCheckboxCell
                                            item={item}
                                            onUpdateCheckboxClick={onUpdateCheckboxClick}
                                            selectedMap={selectedMap}
                                        />
                                        <CollectionTitleCell
                                            isWorkbook={'workbookId' in item}
                                            title={item.title}
                                            collectionId={item.collectionId}
                                        />
                                        <div className={b('content-cell', {date: true})}>
                                            <Tooltip
                                                content={dateTime({input: item.updatedAt}).format(
                                                    dateTimeFormat,
                                                )}
                                            >
                                                <span>
                                                    {dateTime({
                                                        input: item.updatedAt,
                                                    }).fromNow()}
                                                </span>
                                            </Tooltip>
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
                                    </CollectionLinkRow>
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
