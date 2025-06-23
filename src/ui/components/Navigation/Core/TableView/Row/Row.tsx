import React from 'react';

import {Folder, Lock, Star, StarFill} from '@gravity-ui/icons';
import {Checkbox, Icon, Loader, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CheckboxWithEvent} from 'components/CheckboxWithEvent/CheckboxWithEvent';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {I18n} from 'i18n';
import moment from 'moment';
import {useHistory} from 'react-router-dom';
import {DlNavigationQA, PLACE} from 'shared';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry';
import {MOBILE_SIZE} from 'ui/utils/mobile';
import Utils from 'utils';

import type {NavigationEntry} from '../../../../../../shared/schema';
import {getPathDisplayName} from '../../../util';
import EntryContextButton from '../../EntryContextButton/EntryContextButton';
import {FavoritesNameWithAliasItem} from '../../FavoritesNameWithAliasItem/FavoritesNameWithAliasItem';
import type {HookBatchSelectResult, ParentFolderEntry, TableViewProps} from '../types';

import workbookIcon from '../../../../../assets/icons/collections/workbook.svg';

const b = block('dl-core-navigation-table-view');

const i18n = I18n.keyset('component.navigation.view');

const WorkbookItem: React.FC<{workbookId: string; workbookTitle?: string | null}> = ({
    workbookId,
    workbookTitle,
}) => {
    const history = useHistory();

    return (
        <div
            className={b('parent-folder')}
            onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                event.stopPropagation();
                event.preventDefault();
                history.push(`/workbooks/${workbookId}`);
                window.location.reload();
            }}
        >
            <Icon className={b('folder-inline')} data={workbookIcon} size={13} />
            <span className={b('parent-folder-name')}>{workbookTitle}</span>
        </div>
    );
};

type RowProps = Pick<
    TableViewProps,
    | 'mode'
    | 'place'
    | 'displayParentFolder'
    | 'onEntryContextClick'
    | 'onChangeFavorite'
    | 'currentEntryContext'
    | 'currentPageEntry'
    | 'clickableScope'
    | 'inactiveEntryKeys'
    | 'inactiveEntryIds'
    | 'checkEntryActivity'
    | 'onEntryClick'
    | 'onEntryParentClick'
    | 'linkWrapper'
    | 'onMenuClick'
    | 'isOnlyCollectionsMode'
> &
    Pick<HookBatchSelectResult, 'isBatchEnabled' | 'onEntrySelect' | 'selectedIds'> & {
        entry: NavigationEntry;
        index: number;
    };

export class Row extends React.Component<RowProps> {
    render() {
        const {
            entry,
            currentEntryContext,
            currentPageEntry,
            displayParentFolder,
            linkWrapper,
            mode,
            place,
            isBatchEnabled,
            isOnlyCollectionsMode,
            onMenuClick,
        } = this.props;
        const {name, displayAlias, entryId, hidden = false} = entry;

        const isLocked = this.isLockedEntry();
        const inactive = !this.isEntryActive();
        const hovered = currentEntryContext?.entryId === entry.entryId;
        const highlight = currentPageEntry?.entryId === entry.entryId;
        const checked = this.isCheckedEntry();

        const iconSize = DL.IS_MOBILE ? MOBILE_SIZE.NAVIGATION_ICON : 24;
        const entityIconSize = DL.IS_MOBILE ? MOBILE_SIZE.ENTITY_ICON : 's';

        const isFavoritesNameAliasesEnabled = place === PLACE.FAVORITES;

        const visible = Boolean(displayAlias);

        const nameElement = isFavoritesNameAliasesEnabled ? (
            <FavoritesNameWithAliasItem
                entryId={entryId}
                name={name}
                displayAlias={displayAlias}
                isLocked={isLocked}
                onMenuClick={onMenuClick}
                className={b('edit-favorites-alias-btn', {visible})}
            />
        ) : (
            <div title={name} className={b('name-line')}>
                <span>{name}</span>
                {isLocked ? <Icon data={Lock} className={b('lock')} /> : null}
            </div>
        );

        const node = (
            <div className={b('row-link-wrap')} onClick={this.onClick}>
                <EntryIcon
                    entry={entry}
                    className={b('icon')}
                    size={iconSize}
                    entityIconSize={entityIconSize}
                />
                <div className={b('info')}>
                    <div className={b('name')}>
                        {nameElement}
                        {displayParentFolder && this.renderParentFolder()}
                    </div>
                    {this.renderDetails()}
                </div>
            </div>
        );

        return (
            <div
                className={b('row', {
                    hovered,
                    mode,
                    highlight,
                    hidden,
                    inactive,
                    checked,
                    withParentFolder: displayParentFolder,
                    withCheckbox: isBatchEnabled && !isOnlyCollectionsMode,
                })}
                data-qa={DlNavigationQA.Row}
            >
                {!isOnlyCollectionsMode && isBatchEnabled && this.renderCheckBox()}
                {linkWrapper ? (
                    linkWrapper({entry, className: b('link'), children: node})
                ) : (
                    <div className={b('link')}>{node}</div>
                )}
            </div>
        );
    }

    private renderCheckBox() {
        return (
            <div className={b('selection-checkbox')} onClick={this.onClickCheckBox}>
                {this.isWorkbookEntry() ? (
                    <Tooltip content={i18n('tooltip_table-move-denied')}>
                        <div>
                            <Checkbox size="l" disabled />
                        </div>
                    </Tooltip>
                ) : (
                    <CheckboxWithEvent
                        size="l"
                        checked={this.isCheckedEntry()}
                        disabled={this.isLockedEntry()}
                        onUpdateWithEvent={this.onChangeCheckBox}
                    />
                )}
            </div>
        );
    }

    private renderDetails() {
        const {entry, onEntryContextClick, currentEntryContext, mode} = this.props;
        const {createdBy, createdAt, isFavorite} = entry;

        const isLocked = this.isLockedEntry();
        const inactive = !this.isEntryActive();
        const visibleBtn = !inactive && !isLocked;
        const hovered = currentEntryContext?.entryId === entry.entryId;

        const {getLoginById} = registry.common.functions.getAll();
        const LoginById = getLoginById();

        switch (mode) {
            case 'minimal': {
                const date = moment(createdAt).format('DD.MM.YY');
                return (
                    <div title={date} className={b('date')}>
                        <span>{date}</span>
                    </div>
                );
            }
            case 'modal':
            case 'full': {
                const dateFormat = mode === 'full' ? 'DD MMMM YYYY' : 'DD.MM.YY';
                const date = moment(createdAt).format(dateFormat);
                return (
                    <React.Fragment>
                        {LoginById && (
                            <div className={b('createdBy')}>
                                <LoginById loginOrId={createdBy} view="secondary" />
                            </div>
                        )}
                        <div title={date} className={b('date')}>
                            <span>{date}</span>
                        </div>
                        <div className={b('row-btns')}>
                            {(!isLocked || isFavorite) && (
                                <div
                                    className={b('row-btn', b('btn-change-favorite', {isFavorite}))}
                                    onClick={this.onChangeFavorite}
                                >
                                    <Icon className={b('icon-star-fill')} data={StarFill} />
                                    <Icon className={b('icon-star-stroke')} data={Star} />
                                </div>
                            )}
                            {visibleBtn && (
                                <EntryContextButton
                                    className={b('row-btn', {hovered})}
                                    entry={entry}
                                    onClick={onEntryContextClick}
                                />
                            )}
                        </div>
                    </React.Fragment>
                );
            }
            default:
                return null;
        }
    }

    private onChangeCheckBox = (_: boolean, event: React.MouseEvent | null) => {
        this.props.onEntrySelect(this.props.entry.entryId, this.props.index, {
            shiftKey: Boolean(event?.shiftKey),
        });
    };

    private onClickCheckBox = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!this.isLockedEntry()) {
            if (event.target === event.currentTarget) {
                event.preventDefault();
            }
            event.stopPropagation();
        }
    };

    private onChangeFavorite = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.onChangeFavorite(this.props.entry);
    };

    private onEntryParentClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        event.preventDefault();
        this.props.onEntryParentClick?.(this.getParentFolderEntry(), event);
    };

    private onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.props.onEntryClick?.(this.props.entry, event);
    };

    private getParentFolderEntry(): ParentFolderEntry {
        const {entry} = this.props;
        const path = Utils.getPathBefore({path: entry.key});
        return {
            scope: 'folder',
            key: path,
            name: getPathDisplayName({path}),
            parent: true,
        };
    }

    private renderParentFolder() {
        if (this.props.entry.workbookId) {
            return (
                <WorkbookItem
                    workbookId={this.props.entry.workbookId}
                    workbookTitle={this.props.entry.workbookTitle}
                />
            );
        }

        const parentEntry = this.getParentFolderEntry();
        return (
            <div
                className={b('parent-folder')}
                onClick={this.onEntryParentClick}
                title={this.props.entry.key}
            >
                <Icon className={b('folder-inline')} data={Folder} size={13} />
                <span className={b('parent-folder-name')}>{parentEntry.name}</span>
            </div>
        );
    }

    private isEntryActive() {
        const {entry, clickableScope, inactiveEntryKeys, inactiveEntryIds, checkEntryActivity} =
            this.props;

        if (Array.isArray(inactiveEntryIds) && inactiveEntryIds.includes(entry.entryId)) {
            return false;
        }
        if (checkEntryActivity) {
            return checkEntryActivity(entry);
        }
        if (
            Array.isArray(inactiveEntryKeys) &&
            inactiveEntryKeys.some((inactiveKey) =>
                entry.key.toLowerCase().startsWith(inactiveKey.toLowerCase()),
            )
        ) {
            return false;
        }
        if (clickableScope) {
            return entry.scope === 'folder' || clickableScope === entry.scope;
        }
        return true;
    }

    private isLockedEntry() {
        return Boolean(this.props.entry.isLocked);
    }

    private isWorkbookEntry() {
        return Boolean(this.props.entry.workbookId);
    }

    private isCheckedEntry() {
        return this.props.selectedIds.has(this.props.entry.entryId);
    }
}

export const RowLoaderMore = () => {
    return (
        <div className={b('row-loader-more')}>
            <Loader size="m" />
        </div>
    );
};
