import React from 'react';

import type {PopupAnchorElement, PopupPlacement} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {type DatalensGlobalState, navigateHelper} from 'ui';
import {selectWorkbookLimitedView} from 'ui/units/workbooks/store/selectors';
import {copyTextWithToast} from 'ui/utils/copyText';

import type {GetEntryResponse} from '../../../shared/schema';
import {registry} from '../../registry';
import {toggleRevisionsMode} from '../../store/actions/entryContent';
import {selectIsEditMode} from '../../store/selectors/entryContent';
import {EntryDialogues} from '../EntryDialogues';

import EntryContextMenuBase from './EntryContextMenuBase/EntryContextMenuBase';
import {ENTRY_CONTEXT_MENU_ACTION} from './constants';
import type {EntryContextMenuItems, EntryDialoguesRef} from './helpers';
import {
    accessEntry,
    copyEntry,
    deleteEntry,
    migrateToWorkbookEntry,
    moveEntry,
    renameEntry,
    showRelatedEntities,
    showShareDialog,
} from './helpers';
import {withConfiguredEntryContextMenu} from './withConfiguredEntryContextMenu/withConfiguredEntryContextMenu';

const contextMenuI18n = I18n.keyset('component.entry-context-menu.view');

const ConfiguredEntryContextMenu = withConfiguredEntryContextMenu(EntryContextMenuBase);
const defaultPopupPlacement: PopupPlacement = ['bottom', 'bottom-start', 'bottom-end'];

type StateProps = ReturnType<typeof mapsStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type RefProps = {
    forwardRef: React.RefObject<EntryContextMenuProps>;
    entryDialogsRef?: EntryDialoguesRef;
};

type OwnProps = {
    onClose: () => void;
    anchorElement: PopupAnchorElement;
    visible?: boolean;
    entry?: GetEntryResponse;
};

type EntryContextMenuDefaultProps = {
    popupPlacement: PopupPlacement;
    hasTail: boolean;
    additionalItems: EntryContextMenuItems;
    showSpecificItems: boolean;
};

export type EntryContextMenuNestedProps = OwnProps & EntryContextMenuDefaultProps;

type Props = RefProps & OwnProps & StateProps & DispatchProps & EntryContextMenuDefaultProps;

export interface EntryContextMenuProps extends OwnProps, Partial<EntryContextMenuDefaultProps> {
    entryDialoguesRef: EntryDialoguesRef;
}

type ActionFunctionType<T> = (param: T) => void;
type ActionType<T> = string | ActionFunctionType<T>;

type MenuClickParams<T> = {entry: T; action: ActionType<T>};
export type MenuClickHandler<T> = (params: MenuClickParams<T>) => void;

class EntryContextMenu extends React.PureComponent<Props> {
    static defaultProps: EntryContextMenuDefaultProps = {
        hasTail: true,
        popupPlacement: defaultPopupPlacement,
        additionalItems: [],
        showSpecificItems: false,
    };

    entryDialoguesRef = this.props.entryDialogsRef || React.createRef<EntryDialogues>();

    render() {
        return (
            Boolean(this.props.anchorElement) && (
                <React.Fragment>
                    <ConfiguredEntryContextMenu
                        hasTail={this.props.hasTail}
                        visible={this.props.visible}
                        entry={this.props.entry}
                        isEditMode={this.props.isEditMode}
                        anchorElement={this.props.anchorElement}
                        onMenuClick={this.handlerMenuClick}
                        onClose={this.props.onClose}
                        popupPlacement={this.props.popupPlacement}
                        additionalItems={this.props.additionalItems}
                        showSpecificItems={this.props.showSpecificItems}
                        isLimitedView={this.props.isLimitedView}
                    />
                    <EntryDialogues ref={this.entryDialoguesRef} />
                </React.Fragment>
            )
        );
    }

    handlerMenuClick: MenuClickHandler<GetEntryResponse> = (params) => {
        const {entry, action} = params;

        if (typeof action === 'function') {
            action(entry);
            return;
        }

        switch (action) {
            case ENTRY_CONTEXT_MENU_ACTION.RENAME: {
                renameEntry(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.MOVE: {
                moveEntry(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.COPY: {
                copyEntry(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.DELETE: {
                deleteEntry(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.ACCESS: {
                accessEntry(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.REVISIONS: {
                this.props.actions.toggleRevisionsMode();
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
            case ENTRY_CONTEXT_MENU_ACTION.COPY_ID: {
                copyTextWithToast({
                    copyText: entry.entryId,
                    successText: contextMenuI18n('toast_copy-id-success'),
                    errorText: contextMenuI18n('toast_copy-error'),
                    toastName: 'toast-menu-copy-link',
                });
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.SHARE: {
                showShareDialog(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.MIGRATE_TO_WORKBOOK: {
                migrateToWorkbookEntry(this.entryDialoguesRef, entry);
                break;
            }
            case ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES: {
                showRelatedEntities(this.entryDialoguesRef, entry);
                break;
            }
            default: {
                const {getAdditionalEntryContextMenuAction} = registry.common.functions.getAll();
                getAdditionalEntryContextMenuAction(action, {
                    entry,
                    entryDialoguesRef: this.entryDialoguesRef,
                });
                break;
            }
        }
    };
}

const mapsStateToProps = (state: DatalensGlobalState) => {
    return {
        isEditMode: selectIsEditMode(state),
        isLimitedView: selectWorkbookLimitedView(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                toggleRevisionsMode,
            },
            dispatch,
        ),
    };
};

export default connect(mapsStateToProps, mapDispatchToProps)(EntryContextMenu);
