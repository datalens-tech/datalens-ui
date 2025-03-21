import React, {Fragment} from 'react';

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {ENTRY_TYPES, EntryScope, Feature} from 'shared';
import {closeNavigation} from 'store/actions/asideHeader/navigation';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import Utils from 'ui/utils/utils';

import {DIALOG_CREATE_ENTRY_IN_WORKBOOK} from '../../../components/CollectionsStructure';
import {URL_QUERY} from '../../../constants/common';
import navigateHelper from '../../../libs/navigateHelper';
import {registry} from '../../../registry';
import {closeDialog, openDialog} from '../../../store/actions/dialog';
import {ENTRY_CONTEXT_MENU_ACTION, getEntryContextMenuItems} from '../../EntryContextMenu';
import {getGroupedMenu} from '../../EntryContextMenu/helpers';
import {EntryDialogName, EntryDialogResolveStatus, EntryDialogues} from '../../EntryDialogues';
import {CreateMenuValue} from '../Core/CreateEntry/CreateEntry';
import NavigationInline from '../Core/NavigationInline';
import {PLACE, ROOT_PATH} from '../constants';

import {getPlaceConfig} from './configure';

import './NavigationBase.scss';

const SPA_ENTRIES_TYPES = new Set([
    ...ENTRY_TYPES.wizard,
    ...ENTRY_TYPES.ql,
    ...ENTRY_TYPES.editor,
]);

const isSPAEntry = (entry) => {
    const {getTopLevelEntryScopes} = registry.common.functions.getAll();

    const spaEntriesScopes = [
        EntryScope.Connection,
        EntryScope.Dataset,
        ...getTopLevelEntryScopes(),
    ];

    return spaEntriesScopes.includes(entry.scope) || SPA_ENTRIES_TYPES.has(entry.type);
};

const getEntryUrl = (entry, navigationUrl) => {
    const link = navigateHelper.redirectUrlSwitcher(entry);
    const folderLink = navigationUrl
        ? `${navigationUrl}/${PLACE.ROOT}/${entry.entryId}`
        : `${new window.URL(link, 'http://stub').pathname}`;
    return entry.scope === EntryScope.Folder || isSPAEntry(entry) ? folderLink : link;
};

class LinkWrapper extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        entry: PropTypes.object,
        children: PropTypes.node,
        onClick: PropTypes.func,
        navigationUrl: PropTypes.string,
        closeNavigation: PropTypes.func,
    };
    renderEntryLink() {
        const {entry, className, onClick, navigationUrl} = this.props;
        const link = getEntryUrl(entry, navigationUrl);
        return entry.scope === EntryScope.Folder || isSPAEntry(entry) ? (
            <Link
                to={link}
                className={className}
                onClick={isSPAEntry(entry) && !entry.isLocked ? this.closeNavigation : undefined}
            >
                {this.props.children}
            </Link>
        ) : (
            <a href={link} className={className} onClick={onClick}>
                {this.props.children}
            </a>
        );
    }
    renderUrl() {
        const {entry, className} = this.props;
        return (
            <a href={entry.url} className={className}>
                {this.props.children}
            </a>
        );
    }
    closeNavigation = (event) => {
        if (event.ctrlKey || event.metaKey) {
            return;
        }
        this.props.onClose?.();
        this.props.closeNavigation?.();
    };
    render() {
        const {className, onClick, entry} = this.props;
        if (entry.entryId) {
            return this.renderEntryLink();
        }
        if (entry.url) {
            return this.renderUrl();
        }
        return (
            <span className={className} onClick={onClick}>
                {this.props.children}
            </span>
        );
    }
}

// eslint-disable-next-line react/display-name
export const linkWrapper = (propsBefore) => (propsAfter) => {
    return <LinkWrapper {...propsBefore} {...propsAfter} />;
};

class NavigationBase extends React.Component {
    static propTypes = {
        sdk: PropTypes.object,
        root: PropTypes.string,
        path: PropTypes.string,
        history: PropTypes.object,
        onUpdate: PropTypes.func,
        navConstructor: PropTypes.func,
        navigationUrl: PropTypes.string,
        onCreateMenuClick: PropTypes.func,
        onCrumbClick: PropTypes.func,
        onEntryClick: PropTypes.func,
        currentPageEntry: PropTypes.object,
        isOnlyCollectionsMode: PropTypes.bool,
        openDialog: PropTypes.func,
        closeDialog: PropTypes.func,

        onPermissionError: PropTypes.func,
    };
    static defaultProps = {
        navConstructor: NavigationInline,
        root: PLACE.ROOT,
        isOnlyCollectionsMode: false,
    };
    constructor(props) {
        super(props);
        const {getNavigationQuickItems} = registry.common.functions.getAll();
        this.quickItems = getNavigationQuickItems();
    }
    refNavigation = React.createRef();
    refDialogues = React.createRef();
    update(response, entryDialog, entry = {}) {
        const {currentPageEntry} = this.props;
        if (response.status === EntryDialogResolveStatus.Success) {
            this.refNavigation.current.refresh();
            const setEntryKey = registry.common.functions.get('setEntryKey');
            if (this.props.onUpdate) {
                this.props.onUpdate(response);
            } else if (currentPageEntry) {
                switch (entryDialog) {
                    case EntryDialogName.Rename:
                        if (currentPageEntry.entryId === entry.entryId) {
                            const entryData = response.data ? response.data[0] : null;
                            if (!entryData) {
                                window.location.reload();
                            }
                            setEntryKey(entryData);
                        }
                        break;
                    case EntryDialogName.Move:
                        if ((currentPageEntry.key || '').startsWith(entry.key)) {
                            const entryData = response.data ? response.data.result[0] : null;
                            if (!entryData) {
                                window.location.reload();
                            }
                            setEntryKey({...entryData, withRouting: false});
                        }
                        break;
                    case EntryDialogName.Delete:
                        if ((currentPageEntry.key || '').startsWith(entry.key)) {
                            navigateHelper.openPlace(entry);
                        }
                        break;
                }
            }
        }
    }
    async createFolder() {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.CreateFolder,
            dialogProps: {
                initDestination: this.getOnCreateDestination(),
            },
        });
        this.update(response, EntryDialogName.CreateFolder);
    }
    async renameEntry(entry) {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.Rename,
            dialogProps: {
                entryId: entry.entryId,
                initName: entry.name,
            },
        });
        this.update(response, EntryDialogName.Rename, entry);
    }
    async editFavoritesAliasEntry(entry) {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.EditFavoritesAlias,
            dialogProps: {
                entryId: entry.entryId,
                displayAlias: entry.displayAlias,
            },
        });
        this.update(response, EntryDialogName.EditFavoritesAlias, entry);
    }
    async moveEntry(entry) {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.Move,
            dialogProps: {
                entryId: entry.entryId,
                initDestination: this.getOnActionDestination(entry),
                inactiveEntryKeys: entry.scope === EntryScope.Folder ? [entry.key] : undefined,
            },
        });
        this.update(response, EntryDialogName.Move, entry);
    }
    async copyEntry(entry) {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.Copy,
            dialogProps: {
                entryId: entry.entryId,
                workbookId: entry.workbookId,
                scope: entry.scope,
                initDestination: this.getOnActionDestination(entry),
                initName: Utils.getEntryNameFromKey(entry.key, true),
            },
        });
        this.update(response, EntryDialogName.Copy, entry);
    }
    async deleteEntry(entry) {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.Delete,
            dialogProps: {
                entry,
            },
        });
        this.update(response, EntryDialogName.Delete, entry);
    }
    async accessEntry(entry) {
        const hasEditPermissions = entry.permissions?.edit || entry.permissions?.admin;

        await this.refDialogues.current.open({
            dialog: EntryDialogName.Access,
            dialogProps: {
                entry,
                showCustomAccess: !hasEditPermissions,
            },
        });
    }
    async unlockEntry(entry) {
        await this.refDialogues.current.open({
            dialog: EntryDialogName.Unlock,
            dialogProps: {
                entry,
                showCustomAccess: true,
            },
        });
    }
    async migrateToWorkbookEntry(entry) {
        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.MigrateToWorkbook,
            dialogProps: {
                entryId: entry.entryId,
            },
        });
        if (response.status === EntryDialogResolveStatus.Success) {
            this.closeNavigation();
        }
    }
    async showRelatedEntities(entry) {
        await this.refDialogues.current.open({
            dialog: EntryDialogName.ShowRelatedEntities,
            dialogProps: {
                entry,
            },
        });
    }
    getOnActionDestination(entry) {
        const {path} = this.props;
        return !path || path === ROOT_PATH ? Utils.getPathBefore({path: entry.key}) : path;
    }
    getOnCreateDestination() {
        const {path} = this.props;

        const {getInitDestination} = registry.common.functions.getAll();

        return getInitDestination(path);
    }

    openOnlyCollectionsDialog = (entryType, onApply) => {
        this.props.openDialog({
            id: DIALOG_CREATE_ENTRY_IN_WORKBOOK,
            props: {
                entryType,
                initialCollectionId: null,
                onApply: (targetWorkbookId) => {
                    onApply?.(targetWorkbookId, entryType);
                    this.closeNavigation();
                },
                onClose: () => {
                    this.props.closeDialog();
                },
            },
        });
    };

    // eslint-disable-next-line complexity
    onCreateMenuClick = (type) => {
        const {path, history} = this.props;
        const searchParams = new URLSearchParams();

        let query = '';

        if (path) {
            searchParams.append(URL_QUERY.CURRENT_PATH, path);
            query = '?' + searchParams.toString();
        }

        switch (type) {
            case CreateMenuValue.Folder: {
                if (!this.props.isOnlyCollectionsMode) {
                    this.createFolder();
                }
                break;
            }
            case CreateMenuValue.Dashboard: {
                if (this.props.isOnlyCollectionsMode) {
                    this.openOnlyCollectionsDialog('dashboard');
                } else {
                    history.push(`/dashboards/new${query}`);
                    this.closeNavigation();
                }
                break;
            }
            case CreateMenuValue.Connection: {
                // special ignoring of isOnlyCollectionsMode, because
                // connections creation page doesn't belong to folders or workbooks
                history.push(`/connections/new${query}`);
                this.closeNavigation();
                break;
            }
            case CreateMenuValue.Dataset: {
                if (this.props.isOnlyCollectionsMode) {
                    this.openOnlyCollectionsDialog('dataset');
                } else {
                    history.push(`/datasets/new${query}`);
                    this.closeNavigation();
                }
                break;
            }
            case CreateMenuValue.Widget: {
                if (this.props.isOnlyCollectionsMode) {
                    this.openOnlyCollectionsDialog('wizard');
                } else {
                    history.push(`/wizard${query}`);
                    this.closeNavigation();
                }
                break;
            }
            case CreateMenuValue.QL: {
                if (this.props.isOnlyCollectionsMode) {
                    this.openOnlyCollectionsDialog('ql');
                } else {
                    history.push(`/ql${query}`);
                    this.closeNavigation();
                }
                break;
            }
        }

        if (this.props.onCreateMenuClick) {
            this.props.onCreateMenuClick({
                type,
                query,
                openOnlyCollectionsDialog: this.openOnlyCollectionsDialog,
                closeNavigation: this.closeNavigation,
                history,
            });
        }
    };

    closeNavigation = () => {
        this.props.onClose?.();
        this.props.closeNavigation?.();
    };
    onContextMenuClick = ({entry, action}) => {
        switch (action) {
            case ENTRY_CONTEXT_MENU_ACTION.RENAME: {
                return this.renameEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.ADD_FAVORITES_ALIAS:
            case ENTRY_CONTEXT_MENU_ACTION.EDIT_FAVORITES_ALIAS: {
                return this.editFavoritesAliasEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.MOVE: {
                return this.moveEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.COPY: {
                return this.copyEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.DELETE: {
                return this.deleteEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.ACCESS: {
                return this.accessEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.COPY_LINK: {
                // do nothing
                return false;
            }
            case ENTRY_CONTEXT_MENU_ACTION.MIGRATE_TO_WORKBOOK: {
                return this.migrateToWorkbookEntry(entry);
            }
            case ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES: {
                return this.showRelatedEntities(entry);
            }
            default:
                return false;
        }
    };
    onEntryClick = (entry, event) => {
        if (entry.isLocked) {
            event.preventDefault();
            this.unlockEntry(entry);
        } else if (this.props.onEntryClick) {
            this.props.onEntryClick(entry, event);
        }
    };
    onCrumbClick = (item, event, last) => {
        if (last) {
            event.preventDefault();
            this.refresh();
        } else if (this.props.onCrumbClick) {
            this.props.onCrumbClick(item, event, last);
        }
    };
    refresh() {
        if (this.refNavigation.current) {
            this.refNavigation.current.refresh();
        }
    }
    render() {
        const {root, navConstructor, sdk, navigationUrl, closeNavigation, ...props} = this.props;

        const getMenuItems = (params) => {
            const items = getEntryContextMenuItems(params);
            const menu = getGroupedMenu(items, {
                type: 'entry',
                isFlat: isEnabledFeature(Feature.MenuItemsFlatView),
            });
            return menu;
        };

        const {getNavigationPlacesConfig} = registry.common.functions.getAll();

        const getPlaceParameters = (place) => {
            return getPlaceConfig({place, placesConfig: getNavigationPlacesConfig()});
        };

        const navigationNode = React.createElement(navConstructor, {
            ref: this.refNavigation,
            sdk,
            place: root,
            quickItems: this.quickItems,
            linkWrapper: linkWrapper({navigationUrl, closeNavigation, onClose: this.props.onClose}),
            getContextMenuItems: getMenuItems,
            onContextMenuClick: this.onContextMenuClick,
            getPlaceParameters: getPlaceParameters,
            ...props,
            onCreateMenuClick: this.onCreateMenuClick,
            onEntryClick: this.onEntryClick,
            onCrumbClick: this.onCrumbClick,
        });
        return (
            <Fragment>
                {navigationNode}
                <EntryDialogues ref={this.refDialogues} sdk={sdk} />
            </Fragment>
        );
    }
}

const mapDispatchToProps = {
    closeNavigation,
    openDialog,
    closeDialog,
};
export default connect(null, mapDispatchToProps)(withRouter(NavigationBase));
