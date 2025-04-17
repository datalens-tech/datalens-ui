import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ENTRY_CONTEXT_MENU_ACTION, EntryContextMenuBase} from 'components/EntryContextMenu';
import type {EntryDialogues} from 'components/EntryDialogues';
import {EntryDialogName, EntryDialogResolveStatus} from 'components/EntryDialogues';
import navigateHelper from 'libs/navigateHelper';
import {PLACE} from 'shared';
import {EntryScope} from 'shared/types/common';
import {DL} from 'ui/constants/common';
import {registry} from 'ui/registry';
import {copyTextWithToast} from 'ui/utils/copyText';
import Utils from 'utils';

import {I18n} from '../../../../../i18n/index';
import type {
    EntryFields,
    GetEntryResponse,
    ListDirectoryBreadCrumb,
} from '../../../../../shared/schema';
import type {ChangeLocation, CurrentPageEntry} from '../../types';

import './BreadcrumbMenu.scss';

const contextMenuI18n = I18n.keyset('component.entry-context-menu.view');

const b = block('dl-core-navigation-breadcrumb-menu');
const placement = ['bottom', 'bottom-start', 'bottom-end'];

type Props = {
    breadCrumbs: ListDirectoryBreadCrumb[];
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    getContextMenuItems: (data: {entry: unknown}) => unknown;
    currentPageEntry?: CurrentPageEntry;
    refresh?: () => void;
    onChangeLocation?: ChangeLocation;
};

type BreadCrumbEntry = Pick<ListDirectoryBreadCrumb, 'entryId' | 'permissions' | 'isLocked'> &
    Pick<EntryFields, 'scope' | 'type' | 'key' | 'workbookId'> & {
        name: string;
    };

export const BreadcrumbMenu = ({
    breadCrumbs,
    getContextMenuItems,
    entryDialoguesRef,
    currentPageEntry,
    refresh,
    onChangeLocation,
}: Props) => {
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const [show, setShow] = React.useState(false);

    const breadCrumbEntry: BreadCrumbEntry = React.useMemo(() => {
        const breadCrumb = breadCrumbs[breadCrumbs.length - 1];
        return {
            scope: EntryScope.Folder,
            entryId: breadCrumb.entryId,
            permissions: breadCrumb.permissions,
            type: '',
            key: breadCrumb.path,
            name: breadCrumb.title,
            isLocked: breadCrumb.isLocked,
            workbookId: null,
        };
    }, [breadCrumbs]);

    // eslint-disable-next-line complexity
    const handleMenuClick = async ({entry, action}: {entry: BreadCrumbEntry; action: string}) => {
        if (!entryDialoguesRef.current) {
            return;
        }
        const isCurrentPageEntryInside = currentPageEntry?.key
            .toLowerCase()
            .startsWith(entry.key.toLowerCase());

        const setEntryKey = registry.common.functions.get('setEntryKey');

        switch (action) {
            case ENTRY_CONTEXT_MENU_ACTION.RENAME: {
                const response = await entryDialoguesRef.current.open({
                    dialog: EntryDialogName.Rename,
                    dialogProps: {
                        entryId: entry.entryId,
                        initName: entry.name,
                    },
                });
                if (response.status === EntryDialogResolveStatus.Success) {
                    const renamedEntry = response.data?.find(
                        (item: GetEntryResponse) => item.entryId === entry.entryId,
                    );
                    if (renamedEntry) {
                        onChangeLocation?.(PLACE.ROOT, renamedEntry.key);
                    }
                    if (isCurrentPageEntryInside) {
                        const entryData = response.data ? response.data[0] : null;
                        if (!entryData) {
                            window.location.reload();
                        }
                        setEntryKey(entryData);
                    }
                }
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.MOVE: {
                const response = await entryDialoguesRef.current.open({
                    dialog: EntryDialogName.Move,
                    dialogProps: {
                        entryId: entry.entryId,
                        initDestination: Utils.getPathBefore({path: entry.key}),
                        inactiveEntryKeys: [entry.key],
                    },
                });
                if (response.status === EntryDialogResolveStatus.Success) {
                    const destination = response.data?.destination;
                    onChangeLocation?.(PLACE.ROOT, destination ? destination : DL.USER_FOLDER);
                    if (isCurrentPageEntryInside) {
                        const entryData = response.data ? response.data.result[0] : null;
                        if (!entryData) {
                            window.location.reload();
                        }
                        setEntryKey({...entryData, withRouting: false});
                    }
                }
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.COPY: {
                const response = await entryDialoguesRef.current.open({
                    dialog: EntryDialogName.Copy,
                    dialogProps: {
                        entryId: entry.entryId,
                        scope: entry.scope,
                        initDestination: Utils.getPathBefore({path: entry.key}),
                        initName: entry.name,
                    },
                });
                if (response.status === EntryDialogResolveStatus.Success) {
                    refresh?.();
                }
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.COPY_LINK: {
                copyTextWithToast({
                    copyText: navigateHelper.redirectUrlSwitcher(entry),
                    successText: contextMenuI18n('toast_copy-link-success'),
                    errorText: contextMenuI18n('toast_copy-error'),
                    toastName: 'toast-menu-copy-link',
                });
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.DELETE: {
                const response = await entryDialoguesRef.current.open({
                    dialog: EntryDialogName.Delete,
                    dialogProps: {
                        entry,
                    },
                });
                if (response.status === EntryDialogResolveStatus.Success) {
                    const breadCrumbBefore = breadCrumbs[breadCrumbs.length - 2];
                    onChangeLocation?.(
                        PLACE.ROOT,
                        breadCrumbBefore?.isLocked === false
                            ? breadCrumbBefore.path
                            : DL.USER_FOLDER,
                    );
                    if (isCurrentPageEntryInside) {
                        navigateHelper.openNavigation();
                    }
                }
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.ACCESS: {
                await entryDialoguesRef.current.open({
                    dialog: EntryDialogName.Access,
                    dialogProps: {
                        entry: entry as unknown as GetEntryResponse,
                    },
                });
                break;
            }
        }
    };

    return (
        <React.Fragment>
            <Button
                className={b()}
                view="flat"
                ref={btnRef}
                onClick={() => setShow((prevShow) => !prevShow)}
            >
                <Icon data={Ellipsis} size={16} className={b('icon')} />
            </Button>
            {btnRef.current && (
                <EntryContextMenuBase
                    visible={show}
                    entry={breadCrumbEntry}
                    anchorRef={btnRef}
                    items={getContextMenuItems({entry: breadCrumbEntry})}
                    onMenuClick={handleMenuClick}
                    onClose={() => setShow(false)}
                    hasTail={true}
                    popupPlacement={placement}
                />
            )}
        </React.Fragment>
    );
};
