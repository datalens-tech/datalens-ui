import React, {useRef, useState} from 'react';

import {Ellipsis, Plus} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import {DatasetSourcesLeftPanelQA, EntryScope, PLACE} from 'shared';
import {NavigationMinimal} from 'ui';
import {ConnectorIcon} from 'ui/components/ConnectorIcon/ConnectorIcon';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';
import {registry} from 'ui/registry';
import Utils, {getConnectorIconData} from 'ui/utils';

import {SourcesTable} from './SourcesTable';
import {ICON_PLUS_SIZE} from './constants';
import {getClickableTypes} from './utils';

import './SelectSourcePrototypes.scss';

const b = block('select-sources-prototypes');
const i18n = I18n.keyset('dataset.sources-tab.modify');

function getConnectionType(connection = {}) {
    const {db_type: dbType, type} = connection;

    return dbType || type;
}

function getConnectionName(connection) {
    if (!connection) {
        return '';
    }

    return Utils.getEntryNameFromKey(connection.key);
}

function checkAccessibilityAddConnectionButton({connections = []}) {
    let isAllowedAddConnection = connections.length < 1;

    const isArrayContainOnlyCSV = connections.every(({type}) => type === 'csv');

    if (isArrayContainOnlyCSV) {
        isAllowedAddConnection = true;
    }

    return isAllowedAddConnection;
}

function hasEnabledFreeformSources(freeformSources) {
    if (!freeformSources.length) {
        return false;
    }

    return freeformSources.some(({disabled}) => !disabled);
}

function getInactiveEntryIds(connections = []) {
    return connections.map(({entryId}) => entryId);
}

function ConnectionMenu(props) {
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
    } = props;
    const menuControlBtnRef = React.useRef(null);
    const [isNavVisible, setNavVisibility] = useState(false);

    function onEntryClick(connection, e) {
        e?.stopPropagation();
        setNavVisibility(false);
        onClickReplaceConnectionMenuItem({id: connectionId}, connection);
    }

    const {getPlaceSelectParameters} = registry.common.functions.getAll();

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
                        action: (e) => {
                            e.stopPropagation();
                            setNavVisibility(true);
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

function ConnectionsList(props) {
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
    } = props;

    return connections.map((connection) => {
        const {id, entryId, type, deleted, deleteEnabled} = connection;

        const existedConnectionId = id || entryId;
        const active = existedConnectionId === connectionId;
        const connectionName = getConnectionName(connection);

        return (
            // 'connection-wrap' is needed in order for clicks within navigation
            // did not trigger the click event on the 'connection' element
            <div key={existedConnectionId} className={b('connection-wrap')}>
                <div
                    className={b('connection', {active})}
                    onClick={() => onClickConnection(existedConnectionId, type)}
                >
                    <ConnectorIcon
                        className={b('icon-connection')}
                        data={getConnectorIconData(getConnectionType(connection))}
                        height={24}
                        width={24}
                    />
                    <span
                        className={b('connection-title', {deleted})}
                        title={connectionName}
                        data-qa="select-sources-prototypes-connection-title"
                    >
                        {connectionName}
                    </span>
                </div>
                <ConnectionMenu
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
                />
            </div>
        );
    });
}

function SelectConnections(props) {
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
    } = props;
    const [isNavVisible, setNavVisibility] = useState(false);
    const connectionBtnRef = useRef(null);

    function onEntryClick(entry) {
        onSelectConnection(entry);
        setNavVisibility(false);
    }

    const isVisibleAddConnectionButton = checkAccessibilityAddConnectionButton({connections});
    const clickableTypes = getClickableTypes(connectionId, options?.connections?.items);

    const {getPlaceSelectParameters} = registry.common.functions.getAll();

    return (
        <div className={b('connections')}>
            <div className={b('top-section')}>
                <span>{i18n('label_sources')}</span>
            </div>
            <ConnectionsList
                sdk={sdk}
                connectionId={connectionId}
                connections={connections}
                onClickConnection={onClickConnection}
                onClickConnectionDeleteButton={onClickConnectionDeleteButton}
                openConnection={openConnection}
                onClickReplaceConnectionMenuItem={replaceConnection}
                clickableTypes={clickableTypes}
                workbookId={workbookId}
            />
            {isVisibleAddConnectionButton && (
                <div className={b('bottom-section')}>
                    <Button
                        ref={connectionBtnRef}
                        qa={DatasetSourcesLeftPanelQA.ConnSelection}
                        className={b('btn-add-connection')}
                        view="flat"
                        onClick={() => setNavVisibility(!isNavVisible)}
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

function SelectSourcePrototypes(props) {
    const {
        sdk,
        error,
        selectedConnection: {id, entryId} = {},
        connections,
        sourcePrototypes,
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
        options,
    } = props;

    const connectionId = id || entryId;
    const allowAddSource =
        hasEnabledFreeformSources(freeformSources) && !error && !isSourcesLoading;

    return (
        <div className={b()}>
            <SelectConnections
                sdk={sdk}
                connections={connections}
                connectionId={connectionId}
                isSourcesLoading={isSourcesLoading}
                onClickConnection={onClickConnection}
                onClickConnectionDeleteButton={onClickConnectionDeleteButton}
                onSelectConnection={onSelectConnection}
                openConnection={openConnection}
                replaceConnection={replaceConnection}
                workbookId={workbookId}
                options={options}
            />
            <SourcesTable
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

ConnectionsList.propTypes = {
    sdk: PropTypes.object.isRequired,
    connections: PropTypes.array.isRequired,
    onClickConnection: PropTypes.func.isRequired,
    onClickConnectionDeleteButton: PropTypes.func.isRequired,
    openConnection: PropTypes.func.isRequired,
    onClickReplaceConnectionMenuItem: PropTypes.func.isRequired,
    clickableTypes: PropTypes.array,
    workbookId: PropTypes.string,
};

SelectConnections.propTypes = {
    sdk: PropTypes.object.isRequired,
    connections: PropTypes.array.isRequired,
    onSelectConnection: PropTypes.func.isRequired,
    onClickConnection: PropTypes.func.isRequired,
    onClickConnectionDeleteButton: PropTypes.func.isRequired,
    openConnection: PropTypes.func.isRequired,
    replaceConnection: PropTypes.func.isRequired,
    connectionId: PropTypes.string,
    workbookId: PropTypes.string,
    options: PropTypes.object,
};

ConnectionMenu.propTypes = {
    openEnabled: PropTypes.bool.isRequired,
    deleteEnabled: PropTypes.bool.isRequired,
    connectionId: PropTypes.string.isRequired,
    sdk: PropTypes.object.isRequired,
    inactiveEntryIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onClickDeleteConnection: PropTypes.func.isRequired,
    onClickOpenConnection: PropTypes.func.isRequired,
    onClickReplaceConnectionMenuItem: PropTypes.func.isRequired,
    clickableTypes: PropTypes.array,
    workbookId: PropTypes.string,
};

SelectSourcePrototypes.propTypes = {
    sdk: PropTypes.object.isRequired,
    connections: PropTypes.array.isRequired,
    sourcePrototypes: PropTypes.array.isRequired,
    freeformSources: PropTypes.array.isRequired,
    onSelectConnection: PropTypes.func.isRequired,
    onClickConnection: PropTypes.func.isRequired,
    openConnection: PropTypes.func.isRequired,
    onClickConnectionDeleteButton: PropTypes.func.isRequired,
    onClickEditSource: PropTypes.func.isRequired,
    onClickAddSource: PropTypes.func.isRequired,
    onDeleteSource: PropTypes.func.isRequired,
    replaceConnection: PropTypes.func.isRequired,
    getSources: PropTypes.func.isRequired,
    selectedConnection: PropTypes.object,
    isDisabledDropSource: PropTypes.bool.isRequired,
    isDisabledAddSource: PropTypes.bool,
    isSourcesLoading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    workbookId: PropTypes.string,
    options: PropTypes.object,
};
SelectSourcePrototypes.defaultProps = {
    connections: [],
    sourcePrototypes: [],
};

export default SelectSourcePrototypes;
