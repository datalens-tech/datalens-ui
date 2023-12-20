import {DL} from 'constants/common';

import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Star, StarFill} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';
import {WorkbookPage} from 'shared/constants/qa/workbooks';
import {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import {registry} from 'ui/registry/index';
import {AppDispatch} from 'ui/store';
import {changeFavoriteEntry} from 'ui/units/workbooks/store/actions';
import {WorkbookEntry} from 'ui/units/workbooks/types/index';

import {EntryActions} from '../../../EntryActions/EntryActions';
import {defaultRowStyle} from '../constants';

import './Row.scss';

const i18n = I18n.keyset('new-workbooks');

type RowProps = {
    item: WorkbookEntry;
    workbook: WorkbookWithPermissions;
    isOpen?: boolean;
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
    onCopyEntry: (data: WorkbookEntry) => void;
};

const onClickStopPropogation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
};

const b = block('dl-content-row');

const Row: React.FC<RowProps> = ({
    item,
    workbook,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
}) => {
    const [isFavoriteBtn, setIsFavoriteBtn] = React.useState(true);
    const {getWorkbookEntryUrl} = registry.workbooks.functions.getAll();
    const {getLoginById} = registry.common.functions.getAll();

    const dispatch: AppDispatch = useDispatch();

    const url = getWorkbookEntryUrl(item, workbook);

    const LoginById = getLoginById();

    const isShowLogin = LoginById && item.createdBy;

    const onChangeFavorite = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        event.stopPropagation();

        const {entryId, isFavorite} = item;

        dispatch(
            changeFavoriteEntry({
                entryId,
                isFavorite,
                updateInline: true,
            }),
        );
    };

    const getFavoriteIcon = () => {
        if (isFavoriteBtn) {
            if (item.isFavorite) {
                return <Icon className={b('icon-star-fill')} data={StarFill} />;
            }

            return <Icon className={b('icon-star-stroke')} data={Star} />;
        }

        return null;
    };

    return (
        <Link
            to={url}
            className={b()}
            style={defaultRowStyle}
            data-qa={WorkbookPage.ListItem}
            onMouseEnter={() => setIsFavoriteBtn(true)}
            onMouseLeave={() => setIsFavoriteBtn(false)}
        >
            <div className={b('content-cell', {title: true})} data-qa={item.entryId}>
                <div className={b('title-col', {'is-mobile': DL.IS_MOBILE})}>
                    <EntryIcon entry={item} className={b('icon')} width="24" height="24" />
                    <div className={b('title-col-text')} title={item.name}>
                        {item.name}
                    </div>
                </div>
            </div>
            <div className={b('content-cell')}>
                {isShowLogin && (
                    <LoginById
                        className={b('author-text')}
                        loginOrId={item.createdBy}
                        view="secondary"
                    />
                )}
            </div>
            <div className={b('content-cell')}>
                {dateTime({
                    input: item.updatedAt,
                }).fromNow()}
            </div>
            <div className={b('content-cell')}>
                <div
                    className={b('btn-favorite', {isFavorite: item.isFavorite})}
                    onClick={onChangeFavorite}
                >
                    {getFavoriteIcon()}
                </div>
            </div>
            {workbook.permissions.update && (
                <div className={b('content-cell')} onClick={onClickStopPropogation}>
                    <div className={b('control-col')}>
                        <div>
                            <EntryActions
                                workbook={workbook}
                                entry={item}
                                onRenameClick={() => {
                                    onRenameEntry(item);
                                }}
                                onDeleteClick={() => {
                                    onDeleteEntry(item);
                                }}
                                onDuplicateEntry={() => {
                                    onDuplicateEntry(item);
                                }}
                                onCopyEntry={() => {
                                    onCopyEntry(item);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Link>
    );
};

const EmptyRow = () => {
    return (
        <div className={b('empty-row')} style={defaultRowStyle}>
            <div className={b('empty-cell')}>{i18n('label_no-data')}</div>
            <div className={b('empty-cell')} />
            <div className={b('empty-cell')} />
        </div>
    );
};

export {Row, EmptyRow};
