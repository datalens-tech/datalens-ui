import React, {useRef, useState} from 'react';

import {Ellipsis, Plus} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {CollectionId, ConnectorType, DatasetOptions, Permissions, WorkbookId} from 'shared';
import {CollectionItemEntities, DatasetSourcesLeftPanelQA, EntryScope, PLACE} from 'shared';
import type {BaseSource, GetEntryResponse, SharedEntryPermissions} from 'shared/schema';
import {NavigationMinimal, type SDK} from 'ui';
import {ConnectorIcon} from 'ui/components/ConnectorIcon/ConnectorIcon';
import {DIALOG_SELECT_SHARED_ENTRY} from 'ui/components/DialogSelectSharedEntry/DialogSelectSharedEntry';
import {SharedEntryIcon} from 'ui/components/SharedEntryIcon/SharedEntryIcon';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';
import {registry} from 'ui/registry';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import Utils, {getConnectorIconData} from 'ui/utils';

import {
    type SelectedConnections,
    type SortedSourcePrototypes,
    selectedConnectionDelegationStatusSelector,
} from '../../store/selectors';
import type {
    ConnectionEntry,
    DatasetError,
    FreeformSource,
    SourcePrototype,
} from '../../store/types';

import {SourcesTable} from './SourcesTable';
import {ICON_PLUS_SIZE} from './constants';
import {getClickableTypes} from './utils';

import './SelectSourcePrototypes.scss';

const b = block('select-sources-prototypes');
const i18n = I18n.keyset('dataset.sources-tab.modify');

function getConnectionType(connection: Partial<SelectedConnections[number]> = {}) {
    const {db_type: dbType, type} = connection;

    return dbType || type;
}

function getConnectionName(connection: SelectedConnections[number]) {
    if (!connection) {
        return '';
    }

    return Utils.getEntryNameFromKey(connection.key);
}

function checkAccessibilityAddConnectionButton({
    connections = [],
}: {
    connections?: SelectedConnections;
}) {
    let isAllowedAddConnection = connections.length < 1;

    const isArrayContainOnlyCSV = connections.every(({type}) => type === 'csv');

    if (isArrayContainOnlyCSV) {
        isAllowedAddConnection = true;
    }

    return isAllowedAddConnection;
}

function hasEnabledFreeformSources(freeformSources: FreeformSource[]) {
    if (!freeformSources.length) {
        return false;
    }

    return freeformSources.some(({disabled}) => !disabled);
}

function getInactiveEntryIds(connections: SelectedConnections = []) {
    return connections.map(({entryId}) => entryId);
}
type PartialEntryResponse = Partial<Omit<GetEntryResponse, 'permissions'>> & {
    entryId: string;
    permissions?: Permissions | SharedEntryPermissions;
};
type DeleteConnectionHandle = (props: {connectionId: string}) => void;
type OpenConnectionHandle = (connectionId?: string) => void;
type ReplaceConnectionHandle = (connection: {id?: string}, args: PartialEntryResponse) => void;
type DeleteSourceHandle = (props: {id: string}) => void;
type EditSourceHandle = (source: BaseSource) => void;
type ClickConnectionHandle = (connectionId: string) => Promise<BaseSource[] | SourcePrototype[]>;
type SelectConnectionHandle = (props: PartialEntryResponse) => void;
type OnSharedDatasetCreationHandle = (
    onApply: (entry: PartialEntryResponse) => Promise<void> | void,
) => void;

type ConnectionMenuProps = {
    sdk: SDK;
    openEnabled: boolean;
    deleteEnabled: boolean;
    connectionId: string;
    inactiveEntryIds: string[];
    onClickDeleteConnection: DeleteConnectionHandle;
    onClickOpenConnection: OpenConnectionHandle;
    onClickReplaceConnectionMenuItem: ReplaceConnectionHandle;
    clickableTypes?: ConnectorType[];
    workbookId: WorkbookId;
    collectionId: CollectionId;
    onSharedDatasetCreationHandle: OnSharedDatasetCreationHandle;
    readonly: boolean;
};

function ConnectionMenu(props: ConnectionMenuProps) {
    const {
        connectionId,
        openEnabled,
        deleteEnabled,
        onClickDeleteConnection,
        onClickOpenConnection,
        onClickReplaceConnectionMenuItem,
        sdk,
        clickableTypes,
        inactiveEntryIds,
        workbookId,
        collectionId,
        onSharedDatasetCreationHandle,
        readonly,
    } = props;
    const menuControlBtnRef = React.useRef(null);
    const [isNavVisible, setNavVisibility] = useState(false);

    function onEntryClick(connection: PartialEntryResponse, e?: React.MouseEvent) {
        e?.stopPropagation();
        setNavVisibility(false);
        onClickReplaceConnectionMenuItem({id: connectionId}, connection);
    }

    const {getPlaceSelectParameters} = registry.common.functions.getAll();

    const onReplaceConnectionClick = React.useCallback(() => {
        if (collectionId) {
            onSharedDatasetCreationHandle((entry) =>
                onClickReplaceConnectionMenuItem({id: connectionId}, entry),
            );
        } else {
            setNavVisibility(true);
        }
    }, [
        collectionId,
        onSharedDatasetCreationHandle,
        onClickReplaceConnectionMenuItem,
        connectionId,
    ]);

    return (
        <React.Fragment>
            <DropdownMenu
                size="s"
                switcherWrapperClassName={b('btn-menu-control')}
                renderSwitcher={({onClick, onKeyDown}) => (
                    <Button
                        ref={menuControlBtnRef}
                        size="s"
                        view="flat"
                        onClick={onClick}
                        onKeyDown={onKeyDown}
                    >
                        <Icon className={b('icon-more')} data={Ellipsis} width={14} />
                    </Button>
                )}
                popupProps={{placement: ['bottom-start', 'top-start']}}
                items={[
                    {
                        text: i18n('label_menu-popup-open-connection'),
                        disabled: !openEnabled,
                        action: (e) => {
                            e.stopPropagation();
                            onClickOpenConnection(connectionId);
                        },
                    },
                    {
                        text: i18n('label_menu-popup-replace-connection'),
                        disabled: readonly,
                        action: (e) => {
                            e.stopPropagation();
                            onReplaceConnectionClick();
                        },
                    },
                    {
                        text: i18n('label_menu-popup-delete-connection'),
                        disabled: !deleteEnabled,
                        action: (e) => {
                            e.stopPropagation();
                            onClickDeleteConnection({connectionId});
                        },
                    },
                ]}
            />
            {workbookId ? (
                <WorkbookNavigationMinimal
                    anchor={menuControlBtnRef}
                    visible={isNavVisible}
                    onClose={() => setNavVisibility(false)}
                    onEntryClick={onEntryClick}
                    workbookId={workbookId}
                    scope={EntryScope.Connection}
                    includeClickableType={clickableTypes}
                    inactiveEntryIds={inactiveEntryIds}
                />
            ) : (
                <NavigationMinimal
                    sdk={sdk}
                    anchor={menuControlBtnRef}
                    visible={isNavVisible}
                    onClose={() => setNavVisibility(false)}
                    onEntryClick={onEntryClick}
                    clickableScope="connection"
                    scope="connection"
                    startFrom="connections"
                    popupPlacement="auto"
                    includeClickableType={clickableTypes}
                    inactiveEntryIds={inactiveEntryIds}
                    ignoreWorkbookEntries={true}
                    ignoreSharedEntries={true}
                    placeSelectParameters={getPlaceSelectParameters([
                        PLACE.ROOT,
                        PLACE.FAVORITES,
                        PLACE.CONNECTIONS,
                    ])}
                />
            )}
        </React.Fragment>
    );
}

type ConnectionsListProps = {
    sdk: SDK;
    connections: SelectedConnections;
    connectionId?: string;
    onClickConnection: ClickConnectionHandle;
    onClickConnectionDeleteButton: DeleteConnectionHandle;
    workbookId: WorkbookId;
    collectionId: CollectionId;
    openConnection: OpenConnectionHandle;
    onClickReplaceConnectionMenuItem: ReplaceConnectionHandle;
    clickableTypes?: ConnectorType[];
    onSharedDatasetCreationHandle: OnSharedDatasetCreationHandle;
    isLoading: boolean;
    readonly: boolean;
};

function ConnectionsList(props: ConnectionsListProps) {
    const {
        sdk,
        connections,
        connectionId,
        onClickConnection,
        onClickConnectionDeleteButton,
        openConnection,
        onClickReplaceConnectionMenuItem,
        clickableTypes,
        workbookId,
        collectionId,
        onSharedDatasetCreationHandle,
        isLoading,
        readonly,
    } = props;
    const connectionDelegation = useSelector(selectedConnectionDelegationStatusSelector);

    return (
        <>
            {isLoading ? (
                <SmartLoader size="s" />
            ) : (
                connections.map((connection) => {
                    const {id, entryId, deleted, deleteEnabled} = connection;
                    const isSharedConnection = connection.collectionId;
                    const isShowSharedEntryIcon = isSharedConnection;

                    const existedConnectionId = id || entryId;
                    const active = existedConnectionId === connectionId;
                    const connectionName = getConnectionName(connection);

                    return (
                        // 'connection-wrap' is needed in order for clicks within navigation
                        // did not trigger the click event on the 'connection' element
                        <div key={existedConnectionId} className={b('connection-wrap')}>
                            <div
                                className={b('connection', {active})}
                                onClick={() => onClickConnection(existedConnectionId)}
                            >
                                <ConnectorIcon
                                    className={b('icon-connection')}
                                    data={getConnectorIconData(getConnectionType(connection))}
                                    height={24}
                                    width={24}
                                />
                                <div className={b('connection-title-container', {deleted})}>
                                    <span
                                        className={b('connection-title', {deleted})}
                                        title={connectionName}
                                        data-qa="select-sources-prototypes-connection-title"
                                    >
                                        {connectionName}
                                    </span>
                                    {isShowSharedEntryIcon && (
                                        <SharedEntryIcon
                                            className={b('connection-shared-icon')}
                                            isDelegated={connectionDelegation}
                                            noBinding={connectionDelegation === null}
                                        />
                                    )}
                                </div>
                            </div>
                            <ConnectionMenu
                                readonly={readonly}
                                sdk={sdk}
                                connectionId={existedConnectionId}
                                openEnabled={!deleted}
                                deleteEnabled={deleteEnabled}
                                onClickDeleteConnection={onClickConnectionDeleteButton}
                                onClickOpenConnection={openConnection}
                                onClickReplaceConnectionMenuItem={onClickReplaceConnectionMenuItem}
                                clickableTypes={clickableTypes}
                                inactiveEntryIds={getInactiveEntryIds(connections)}
                                workbookId={workbookId}
                                collectionId={collectionId}
                                onSharedDatasetCreationHandle={onSharedDatasetCreationHandle}
                            />
                        </div>
                    );
                })
            )}
        </>
    );
}

type SelectConnectionsProps = {
    sdk: SDK;
    connections: SelectedConnections;
    onSelectConnection: SelectConnectionHandle;
    onClickConnection: ClickConnectionHandle;
    onClickConnectionDeleteButton: DeleteConnectionHandle;
    openConnection: OpenConnectionHandle;
    replaceConnection: ReplaceConnectionHandle;
    connectionId?: string;
    workbookId: WorkbookId;
    collectionId: CollectionId;
    options: Partial<DatasetOptions>;
    isLoadingConnectionInfo: boolean;
    readonly: boolean;
};

function SelectConnections(props: SelectConnectionsProps) {
    const {
        connectionId,
        sdk,
        connections,
        onSelectConnection,
        onClickConnection,
        onClickConnectionDeleteButton,
        openConnection,
        replaceConnection,
        workbookId,
        options,
        collectionId,
        isLoadingConnectionInfo,
        readonly,
    } = props;
    const dispatch = useDispatch();
    const connectionDelegation = useSelector(selectedConnectionDelegationStatusSelector);
    const [isNavVisible, setNavVisibility] = useState(false);
    const connectionBtnRef = useRef(null);

    function onEntryClick(entry: PartialEntryResponse) {
        onSelectConnection(entry);
        setNavVisibility(false);
    }

    const onSharedDatasetCreationHandle: OnSharedDatasetCreationHandle = React.useCallback(
        (onApply) => {
            if (collectionId) {
                dispatch(
                    openDialog({
                        id: DIALOG_SELECT_SHARED_ENTRY,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            collectionId,
                            dialogTitle: getSharedEntryMockText(
                                'title-select-shared-entry-dialog-connection',
                            ),
                            getIsInactiveEntity: (entry) => {
                                if (entry.entity !== CollectionItemEntities.ENTRY) {
                                    return false;
                                }

                                const canCreateBinding =
                                    entry.permissions?.createEntryBinding ||
                                    entry.permissions?.createLimitedEntryBinding;
                                const isAlreadySelectedConnection =
                                    entry.entryId === connectionId && connectionDelegation !== null;
                                return (
                                    entry.scope === EntryScope.Dataset ||
                                    isAlreadySelectedConnection ||
                                    !canCreateBinding
                                );
                            },
                            onSelectEntry: async (connection) => {
                                await onApply(connection);
                            },
                        },
                    }),
                );
            }
        },
        [collectionId, dispatch, connectionId],
    );

    const onAddConnectionClick = React.useCallback(() => {
        if (collectionId) {
            onSharedDatasetCreationHandle(onSelectConnection);
        } else {
            setNavVisibility((visible) => !visible);
        }
    }, [collectionId, onSharedDatasetCreationHandle, onSelectConnection]);

    const isVisibleAddConnectionButton = checkAccessibilityAddConnectionButton({connections});
    const clickableTypes = getClickableTypes(connectionId, options?.connections?.items);

    const {getPlaceSelectParameters} = registry.common.functions.getAll();

    return (
        <div className={b('connections')}>
            <div className={b('top-section')}>
                <span>{i18n('label_sources')}</span>
            </div>
            <ConnectionsList
                readonly={readonly}
                sdk={sdk}
                connectionId={connectionId}
                connections={connections}
                onClickConnection={onClickConnection}
                onClickConnectionDeleteButton={onClickConnectionDeleteButton}
                openConnection={openConnection}
                onClickReplaceConnectionMenuItem={replaceConnection}
                clickableTypes={clickableTypes}
                workbookId={workbookId}
                collectionId={collectionId}
                onSharedDatasetCreationHandle={onSharedDatasetCreationHandle}
                isLoading={isLoadingConnectionInfo}
            />
            {isVisibleAddConnectionButton && (
                <div className={b('bottom-section')}>
                    <Button
                        ref={connectionBtnRef}
                        qa={DatasetSourcesLeftPanelQA.ConnSelection}
                        className={b('btn-add-connection')}
                        view="flat"
                        onClick={onAddConnectionClick}
                    >
                        <Icon data={Plus} width={ICON_PLUS_SIZE} />
                        {i18n('button_add-connection')}
                    </Button>
                </div>
            )}
            {workbookId ? (
                <WorkbookNavigationMinimal
                    anchor={connectionBtnRef}
                    visible={isNavVisible}
                    onClose={() => setNavVisibility(false)}
                    onEntryClick={onEntryClick}
                    workbookId={workbookId}
                    scope={EntryScope.Connection}
                    includeClickableType={clickableTypes}
                    inactiveEntryIds={getInactiveEntryIds(connections)}
                />
            ) : (
                <NavigationMinimal
                    sdk={sdk}
                    anchor={connectionBtnRef}
                    visible={isNavVisible}
                    onClose={() => setNavVisibility(false)}
                    onEntryClick={onEntryClick}
                    clickableScope="connection"
                    scope="connection"
                    startFrom="connections"
                    popupPlacement="auto"
                    includeClickableType={clickableTypes}
                    ignoreWorkbookEntries={true}
                    ignoreSharedEntries={true}
                    inactiveEntryIds={getInactiveEntryIds(connections)}
                    placeSelectParameters={getPlaceSelectParameters([
                        PLACE.ROOT,
                        PLACE.FAVORITES,
                        PLACE.CONNECTIONS,
                    ])}
                    hasTail={false}
                />
            )}
        </div>
    );
}

type SelectSourcePrototypesProps = SelectConnectionsProps & {
    sdk: SDK;
    connections: SelectedConnections;
    sourcePrototypes: SortedSourcePrototypes;
    freeformSources: FreeformSource[];
    onSelectConnection: SelectConnectionHandle;
    onClickConnection: ClickConnectionHandle;
    openConnection: OpenConnectionHandle;
    onClickConnectionDeleteButton: DeleteConnectionHandle;
    onClickEditSource: EditSourceHandle;
    onClickAddSource: () => void;
    onDeleteSource: DeleteSourceHandle;
    replaceConnection: ReplaceConnectionHandle;
    getSources: () => void;
    selectedConnection?: ConnectionEntry;
    isDisabledDropSource: boolean;
    isDisabledAddSource?: boolean;
    isSourcesLoading: boolean;
    error?: DatasetError;
    workbookId: WorkbookId;
    collectionId: CollectionId;
    options: Partial<DatasetOptions>;
    isLoadingConnectionInfo: boolean;
    readonly: boolean;
    bindedWorkbookId?: WorkbookId;
};

function SelectSourcePrototypes(props: SelectSourcePrototypesProps) {
    const {
        sdk,
        error,
        selectedConnection: {id, entryId} = {},
        connections = [],
        sourcePrototypes = [],
        freeformSources,
        onSelectConnection,
        onClickConnection,
        onClickConnectionDeleteButton,
        onClickEditSource,
        onClickAddSource,
        onDeleteSource,
        openConnection,
        replaceConnection,
        getSources,
        isDisabledAddSource,
        isDisabledDropSource,
        isSourcesLoading,
        workbookId,
        collectionId,
        options,
        isLoadingConnectionInfo,
        readonly,
        bindedWorkbookId,
    } = props;

    const connectionId = id || entryId;
    const allowAddSource =
        hasEnabledFreeformSources(freeformSources) && !error && !isSourcesLoading;

    return (
        <div className={b()}>
            <SelectConnections
                isLoadingConnectionInfo={isLoadingConnectionInfo}
                sdk={sdk}
                connections={connections}
                connectionId={connectionId}
                onClickConnection={onClickConnection}
                onClickConnectionDeleteButton={onClickConnectionDeleteButton}
                onSelectConnection={onSelectConnection}
                openConnection={openConnection}
                replaceConnection={replaceConnection}
                workbookId={workbookId}
                collectionId={collectionId}
                options={options}
                readonly={readonly}
            />
            <SourcesTable
                bindedWorkbookId={bindedWorkbookId}
                readonly={readonly}
                error={error}
                sources={sourcePrototypes}
                loading={isSourcesLoading}
                dragDisabled={isDisabledAddSource}
                dropDisabled={isDisabledDropSource}
                allowAddSource={allowAddSource}
                onAdd={onClickAddSource}
                onEdit={onClickEditSource}
                onDelete={onDeleteSource}
                onRetry={getSources}
            />
        </div>
    );
}

export default SelectSourcePrototypes;
