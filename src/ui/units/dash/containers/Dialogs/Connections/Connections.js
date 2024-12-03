import React from 'react';

import {Plus, Xmark} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Loader, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Collapse} from 'components/Collapse/Collapse';
import {i18n} from 'i18n';
import intersection from 'lodash/intersection';
import intersectionWith from 'lodash/intersectionWith';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ConnectionsDialogQA, DashTabItemControlSourceType, WidgetKind} from 'shared';

import {addAlias, getNormalizedAliases} from '../../../../../components/DialogRelations/helpers';
import {ITEM_TYPE} from '../../../../../constants/dialogs';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {CONNECTION_KIND} from '../../../modules/constants';
import {updateCurrentTabData} from '../../../store/actions/dashTyped';
import {closeDialog} from '../../../store/actions/dialogs/actions';
import {
    selectCurrentTab,
    selectCurrentTabConnectableItems,
    selectDashWorkbookId,
} from '../../../store/selectors/dashTypedSelectors';

import ConnectByAlias from './ConnectByAlias/ConnectByAlias';
import Context from './Context/Context';
import Item from './Item/Item';
import ManageAlias from './ManageAlias/ManageAlias';
import Param from './Param/Param';

import iconAlert from 'ui/assets/icons/alert.svg';
import iconArrowLeft from 'ui/assets/icons/arrow-left.svg';
import iconArrowRight from 'ui/assets/icons/arrow-right.svg';
import iconArrowOpposite from 'ui/assets/icons/arrows-opposite.svg';
import iconCancel from 'ui/assets/icons/cancel.svg';

import './Connections.scss';

const CONNECTION_TYPE = {
    CONNECTED: {
        key: 'connected',
        get title() {
            return i18n('dash.connections-dialog.edit', 'value_connected');
        },
        icon: iconArrowOpposite,
        qa: ConnectionsDialogQA.TypeSelectConnectedOption,
    },
    INPUT: {
        key: 'input',
        get title() {
            return i18n('dash.connections-dialog.edit', 'value_input');
        },
        icon: iconArrowLeft,
        qa: ConnectionsDialogQA.TypeSelectInputOption,
    },
    OUTPUT: {
        key: 'output',
        get title() {
            return i18n('dash.connections-dialog.edit', 'value_output');
        },
        icon: iconArrowRight,
        qa: ConnectionsDialogQA.TypeSelectOutputOption,
    },
    IGNORE: {
        key: 'ignore',
        get title() {
            return i18n('dash.connections-dialog.edit', 'value_ignore');
        },
        icon: Xmark,
        qa: ConnectionsDialogQA.TypeSelectIgnoreOption,
    },
};

const b = block('dialog-connections');

function wrapToArray(data) {
    return Array.isArray(data) ? data : [data];
}

class Connections extends React.PureComponent {
    static propTypes = {
        items: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
                type: PropTypes.oneOf(Object.values(ITEM_TYPE)).isRequired,
                namespace: PropTypes.string.isRequired,
            }),
        ).isRequired,
        connections: PropTypes.arrayOf(
            PropTypes.shape({
                from: PropTypes.string.isRequired, // who
                to: PropTypes.string.isRequired, // whom
                kind: PropTypes.oneOf(Object.values(CONNECTION_KIND)).isRequired,
            }),
        ).isRequired,
        aliases: PropTypes.object.isRequired,
        dashKitRef: PropTypes.object.isRequired,
        workbookId: PropTypes.string,
        closeDialog: PropTypes.func.isRequired,
        updateCurrentTabData: PropTypes.func.isRequired,
    };

    state = {
        loading: true,

        namespace: 'default',
        itemId: null,

        aliases: this.props.aliases,
        connections: this.props.connections,

        metas: {},
        datasets: {},

        showConnectByAliasDialog: false,
        connectingItemId: null,

        showAliasDialog: false,
        selectedAlias: null,
    };

    async componentDidMount() {
        const itemsMetas = await Promise.all(this.props.dashKitRef.current?.getItemsMeta() || []);

        const {processedItems, metas, datasets} = itemsMetas.reduce(
            (result, meta) => {
                wrapToArray(meta).forEach((data) => {
                    const {
                        id,
                        type,
                        sourceType,
                        usedParams,
                        enableFiltering,
                        datasets,
                        datasetId,
                        datasetFields, // deprecated
                    } = data;

                    if (usedParams) {
                        if (datasets) {
                            result.metas = {
                                ...result.metas,
                                [id]: {
                                    usedParams,
                                    type,
                                    sourceType,
                                    datasetId: datasets[0].id,
                                    enableFiltering,
                                },
                            };
                        } else {
                            result.metas = {
                                ...result.metas,
                                [id]: {usedParams, type, sourceType, datasetId, enableFiltering},
                            };
                        }
                    }

                    result.processedItems.push(data);

                    // deprecated
                    if (datasetId) {
                        result.datasets[datasetId] = {fields: datasetFields};
                    }

                    if (datasets) {
                        datasets.forEach(({id, fields}) => {
                            result.datasets[id] = {fields};
                        });
                    }
                });
                return result;
            },
            {processedItems: [], metas: {}, datasets: {}},
        );

        let entriesDatasetsFields = [];
        try {
            let entriesIds = [];
            const controlsIds = [];
            for (let i = 0; i < processedItems.length; i++) {
                const processedItem = processedItems[i];
                if (processedItem?.entryId) {
                    entriesIds.push(processedItem?.entryId);
                }

                if (
                    processedItem?.type === WidgetKind.Control &&
                    processedItem?.sourceType !== DashTabItemControlSourceType.Dataset
                ) {
                    controlsIds.push(processedItem?.id);
                }
            }

            entriesIds = [...new Set(entriesIds)];
            const datasetsIds = Object.keys(datasets);

            if (!isEmpty(entriesIds) && (!isEmpty(datasetsIds) || !isEmpty(controlsIds))) {
                entriesDatasetsFields = await getSdk().mix.getEntriesDatasetsFields({
                    entriesIds,
                    datasetsIds,
                    workbookId: this.props.workbookId,
                });
            }
        } catch (error) {
            logger.logError('Connections: init getEntriesDatasetsFields failed', error);
            console.error('GET_ENTRIES_DATASETS_FIELDS', error);
        }

        processedItems.forEach((item) => {
            const data = entriesDatasetsFields.find(({entryId}) => entryId === item.entryId);
            if (data) {
                const {type, datasetId, datasetName, datasetFields} = data;
                if (datasetFields) {
                    datasets[datasetId] = datasets[datasetId] || {};
                    datasets[datasetId].name = datasetName;
                    datasets[datasetId].fields = datasetFields.reduce(
                        (result, {guid, title}) => ({...result, [guid]: title}),
                        {},
                    );
                }
                if (datasetId && datasets[datasetId]) {
                    metas[item.id] = {
                        usedParams: Object.keys(datasets[datasetId].fields),
                        datasetId,
                        type: type || metas[item.id].type,
                        enableFiltering: item.enableFiltering,
                    };
                }
            }
        });

        this.setState({loading: false, metas, datasets});
    }

    get namespacedItems() {
        return this.props.items.filter(({namespace}) => namespace === this.state.namespace);
    }

    get namespacedAliases() {
        return this.state.aliases[this.state.namespace] || [];
    }

    get filteredAliases() {
        return this.namespacedAliases.filter(
            (alias) => !this.state.selectedAlias.every((param) => alias.includes(param)),
        );
    }

    get connections() {
        const {itemId, metas, connections} = this.state;
        const filteringChartsIds = this.getFilteringChartsIds();
        const currentItemWithEnabledFiltering = metas[itemId].enableFiltering;

        if (itemId && metas[itemId]) {
            const item = this.namespacedItems.find(({id}) => id === itemId);
            return this.namespacedItems
                .filter(({id, type}) => {
                    // filter chart widget types by design
                    let filterChartsWidgetsCondition =
                        type === ITEM_TYPE.WIDGET &&
                        (item.type === ITEM_TYPE.CONTROL || item.type === ITEM_TYPE.GROUP_CONTROL);

                    // if selected current chart with enableFiltering setting
                    // then don't filter all other charts
                    filterChartsWidgetsCondition = Boolean(
                        (currentItemWithEnabledFiltering && type === ITEM_TYPE.WIDGET) ||
                            (filteringChartsIds.includes(id) && item.type === ITEM_TYPE.WIDGET),
                    );

                    return (
                        id !== itemId &&
                        (type === ITEM_TYPE.CONTROL ||
                            type === ITEM_TYPE.GROUP_CONTROL ||
                            filterChartsWidgetsCondition)
                    );
                })
                .map(({id, title, type}) => {
                    if (!metas[id]) {
                        return {id, title, type, noMeta: true};
                    }

                    const itemUsedParams = metas[itemId].usedParams;
                    const iteratedUsedParams = metas[id].usedParams;

                    const intersectionByUsedParams = intersection(
                        itemUsedParams,
                        iteratedUsedParams,
                    );
                    const isConnectedByUsedParams = intersectionByUsedParams.length !== 0;
                    // && intersectionByUsedParams.length === Math.min(itemUsedParams.length, iteratedUsedParams.length);

                    const intersectionByAliases = intersectionWith(
                        itemUsedParams,
                        iteratedUsedParams,
                        (a, b) =>
                            this.namespacedAliases.some(
                                (array) => array.includes(a) && array.includes(b),
                            ),
                    ).map((intersect) => {
                        const index = this.namespacedAliases.findIndex((array) =>
                            array.includes(intersect),
                        );
                        return this.namespacedAliases[index];
                    });
                    const isConnectedByAlias = intersectionByAliases.length !== 0;
                    // && intersectionByAliases.length === Math.min(itemUsedParams.length, iteratedUsedParams.length);

                    // the selected element ignores the iterated element
                    const isIgnoring = connections
                        .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
                        .some(({from, to}) => from === itemId && to === id);
                    // the selected element is ignored by the iterated element
                    const isIgnored = connections
                        .filter(({kind}) => kind === CONNECTION_KIND.IGNORE)
                        .some(({from, to}) => from === id && to === itemId);

                    return {
                        id,
                        title,
                        type,
                        isIgnored,
                        isIgnoring,
                        isConnectedByUsedParams,
                        intersectionByUsedParams,
                        isConnectedByAlias,
                        intersectionByAliases,
                        datasetId: metas[id].datasetId,
                        noMeta: false,
                        enableFiltering: metas[itemId].enableFiltering,
                    };
                });
        }

        return null;
    }

    getFilteringChartsIds() {
        const {metas} = this.state;
        const res = [];
        for (const [key, item] of Object.entries(metas)) {
            if (item.enableFiltering) {
                res.push(key);
            }
        }
        return res;
    }

    getParamTitle = (param) =>
        Object.values(this.state.datasets).reduce(
            (result, {fields}) => ({...result, ...fields}),
            {},
        )[param] || param;

    getParamDataset = (param) => {
        const dataset = Object.entries(this.state.datasets)
            // eslint-disable-next-line no-unused-vars
            .find(([id, {fields}]) => Object.keys(fields).includes(param));
        return dataset ? dataset[1].name || dataset[0] : null;
    };

    renderConnections() {
        if (!this.state.itemId) {
            return null;
        }

        if (Array.isArray(this.connections) && this.connections.length) {
            return (
                <div className={b('connections')} data-qa={ConnectionsDialogQA.Content}>
                    {this.connections.map((connection) => (
                        <div className={b('connection')} key={connection.id}>
                            {this.renderConnectionType(connection)}
                            <div className={b('column')}>
                                <Item
                                    id={connection.id}
                                    onClick={() => this.setState({itemId: connection.id})}
                                />
                            </div>
                            <div className={b('column', {connector: true})}>
                                {this.renderConnectionConnector(connection)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div
                className={b('connections', {empty: true})}
                data-qa={ConnectionsDialogQA.EmptyContent}
            >
                {i18n('dash.connections-dialog.edit', 'label_no-connections')}
            </div>
        );
    }

    connectByAlias(id) {
        this.setState({showConnectByAliasDialog: true, connectingItemId: id});
    }

    changeConnectionType(type, {id, isConnectedByUsedParams, isConnectedByAlias}) {
        const {itemId, connections} = this.state;

        const filteredIgnores = connections.filter(
            ({from, to, kind}) =>
                kind === CONNECTION_KIND.IGNORE &&
                (from !== id || to !== itemId) &&
                (from !== itemId || to !== id),
        );

        switch (type) {
            case CONNECTION_TYPE.IGNORE.key: {
                this.setState({
                    connections: filteredIgnores.concat([
                        {from: itemId, to: id, kind: CONNECTION_KIND.IGNORE},
                        {from: id, to: itemId, kind: CONNECTION_KIND.IGNORE},
                    ]),
                });
                break;
            }
            case CONNECTION_TYPE.CONNECTED.key:
                if (!isConnectedByUsedParams && !isConnectedByAlias) {
                    this.connectByAlias(id);
                } else {
                    this.setState({connections: filteredIgnores});
                }
                break;
            case CONNECTION_TYPE.INPUT.key:
                if (!isConnectedByUsedParams && !isConnectedByAlias) {
                    this.connectByAlias(id);
                } else {
                    this.setState({
                        connections: filteredIgnores.concat([
                            {from: id, to: itemId, kind: CONNECTION_KIND.IGNORE},
                        ]),
                    });
                }
                break;
            case CONNECTION_TYPE.OUTPUT.key:
                if (!isConnectedByUsedParams && !isConnectedByAlias) {
                    this.connectByAlias(id);
                } else {
                    this.setState({
                        connections: filteredIgnores.concat([
                            {from: itemId, to: id, kind: CONNECTION_KIND.IGNORE},
                        ]),
                    });
                }
                break;
        }
    }

    renderConnectionType(connect) {
        const {
            type,
            noMeta,
            isIgnored,
            isIgnoring,
            isConnectedByUsedParams,
            isConnectedByAlias,
            enableFiltering,
        } = connect;

        if (noMeta) {
            return (
                <span className={b('empty')}>
                    {i18n('dash.connections-dialog.edit', 'label_no-information')}
                </span>
            );
        }

        let connectionType;

        if (isConnectedByAlias || isConnectedByUsedParams) {
            if (isIgnored) {
                connectionType = CONNECTION_TYPE.INPUT.key;
            } else if (isIgnoring) {
                connectionType = CONNECTION_TYPE.OUTPUT.key;
            } else {
                connectionType = CONNECTION_TYPE.CONNECTED.key;
            }
        }

        if (isIgnored && isIgnoring) {
            connectionType = CONNECTION_TYPE.IGNORE.key;
        }

        let connectionTypes = Object.values(CONNECTION_TYPE);

        const selectedItem = this.namespacedItems.find(({id}) => id === this.state.itemId);

        if (
            selectedItem.type === ITEM_TYPE.WIDGET &&
            (type === ITEM_TYPE.CONTROL || type === ITEM_TYPE.GROUP_CONTROL)
        ) {
            connectionTypes = [
                {
                    key: 'connected',
                    title: i18n('dash.connections-dialog.edit', 'value_input'),
                    icon: iconArrowLeft,
                    qa: ConnectionsDialogQA.TypeSelectInputOption,
                },
                CONNECTION_TYPE.IGNORE,
            ];
        } else if (
            (selectedItem.type === ITEM_TYPE.CONTROL ||
                selectedItem.type === ITEM_TYPE.GROUP_CONTROL) &&
            type === ITEM_TYPE.WIDGET
        ) {
            connectionTypes = [
                {
                    key: 'connected',
                    title: i18n('dash.connections-dialog.edit', 'value_output'),
                    icon: iconArrowRight,
                    qa: ConnectionsDialogQA.TypeSelectOutputOption,
                },
                CONNECTION_TYPE.IGNORE,
            ];
        } else if (selectedItem.type === ITEM_TYPE.WIDGET && type === ITEM_TYPE.WIDGET) {
            if (
                connectionType === CONNECTION_TYPE.INPUT.key ||
                connectionType === CONNECTION_TYPE.OUTPUT.key
            ) {
                connectionType = 'connected';
            }
            connectionTypes = [
                {
                    key: 'connected',
                    title: i18n(
                        'dash.connections-dialog.edit',
                        enableFiltering ? 'value_output' : 'value_input',
                    ),
                    qa: enableFiltering
                        ? ConnectionsDialogQA.TypeSelectOutputOption
                        : ConnectionsDialogQA.TypeSelectInputOption,
                    icon: enableFiltering ? iconArrowRight : iconArrowLeft,
                },
                CONNECTION_TYPE.IGNORE,
            ];
        }

        const SelectItem = (props) => (
            <div className={b('select-item')}>
                {props.icon ? (
                    <Icon
                        size={16}
                        className={b('select-item-icon', {[props.mod || 'none']: true})}
                        data={props.icon}
                    />
                ) : (
                    <Icon
                        size={16}
                        className={b('select-item-icon', {['error']: true})}
                        data={iconAlert}
                    />
                )}

                <span>{props.title || i18n('dash.connections-dialog.edit', 'value_error')}</span>
            </div>
        );

        const renderOption = (opt) => <SelectItem {...opt.data} />;

        const mappedOptions = connectionTypes.map((type) => ({
            value: type.key,
            content: type.title,
            data: {...type, mod: type.key},
            qa: type.qa,
        }));

        return (
            <Select
                qa={ConnectionsDialogQA.TypeSelect}
                width="max"
                controlClassName={b('select-control')}
                value={connectionType ? [connectionType] : undefined}
                onUpdate={([type]) => this.changeConnectionType(type, connect)}
                options={mappedOptions}
                renderOption={renderOption}
                placeholder={
                    <SelectItem
                        icon={iconCancel}
                        key="none"
                        title={i18n('dash.connections-dialog.edit', 'value_none')}
                    />
                }
                renderSelectedOption={renderOption}
            />
        );
    }

    renderConnectionConnector({
        id,
        noMeta,
        isIgnored,
        isIgnoring,
        isConnectedByUsedParams,
        intersectionByUsedParams,
        isConnectedByAlias,
        intersectionByAliases,
    }) {
        if (noMeta) {
            return null;
        }

        const isIgnore = isIgnoring && isIgnored;

        if (isConnectedByUsedParams || isConnectedByAlias) {
            const connectorParams =
                isConnectedByUsedParams &&
                intersectionByUsedParams.map((param) => (
                    <span className={b('connector', {ignor: isIgnore})} key={param}>
                        <Param value={param} />
                    </span>
                ));

            const connectorAliases =
                isConnectedByAlias &&
                intersectionByAliases.map((alias, index) => (
                    <span
                        className={b('connector', {clickable: true, ignor: isIgnore})}
                        onClick={() => this.setState({showAliasDialog: true, selectedAlias: alias})}
                        key={index}
                    >
                        {alias.map((param, index) => (
                            <React.Fragment key={param}>
                                <Param value={param} />
                                {index === alias.length - 1 ? null : (
                                    <span className={b('eq')}>=</span>
                                )}
                            </React.Fragment>
                        ))}
                    </span>
                ));

            const addButton = !isIgnore && (
                <span className={b('add-connector')}>
                    <Button view="normal" size="m" onClick={() => this.connectByAlias(id)}>
                        <Icon data={Plus} size={16} />
                        {i18n('dash.connections-dialog.edit', 'button_add-alias')}
                    </Button>
                </span>
            );

            return (
                <React.Fragment>
                    <div>
                        <div>{addButton}</div>
                        {connectorAliases && <div>{connectorAliases}</div>}
                        {connectorParams && (
                            <div>
                                <Collapse
                                    arrowPosition="left"
                                    title={
                                        <span className={b('collapse-connector-button')}>
                                            {i18n(
                                                'dash.connections-dialog.edit',
                                                'button_collapse-params',
                                            )}
                                        </span>
                                    }
                                    arrowView="icon"
                                    isSecondary={true}
                                    className={b('collapse-connector')}
                                    titleSize="s"
                                >
                                    {connectorParams}
                                </Collapse>
                            </div>
                        )}
                    </div>
                </React.Fragment>
            );
        }

        return null;
    }

    closeConnectByAliasDialog = () =>
        this.setState({showConnectByAliasDialog: false, connectingItemId: null});

    addAlias = (first, second) => {
        const {aliases, namespace} = this.state;

        const newNamespacedAliases = addAlias(first, second, this.namespacedAliases);

        this.setState({aliases: {...aliases, [namespace]: newNamespacedAliases}});

        this.closeConnectByAliasDialog();
    };

    closeAliasDialog = () => this.setState({showAliasDialog: false});

    updateAlias = (alias) => {
        this.setState({
            aliases: {
                ...this.state.aliases,
                [this.state.namespace]: [...this.filteredAliases, alias],
            },
        });
        this.closeAliasDialog();
    };

    removeAlias = () => {
        this.setState({
            aliases: {...this.state.aliases, [this.state.namespace]: this.filteredAliases},
        });
        this.closeAliasDialog();
    };

    onApply = () => {
        const normalizedAliases = {...this.state.aliases};

        const namespaceAliases = normalizedAliases[this.state.namespace];
        if (namespaceAliases !== undefined) {
            // perform normalization and combine aliases with common fields
            normalizedAliases[this.state.namespace] = getNormalizedAliases(namespaceAliases);
        }

        this.props.updateCurrentTabData({
            aliases: normalizedAliases,
            connections: this.state.connections,
        });
        this.props.closeDialog();
    };

    renderBody() {
        if (this.state.loading) {
            return (
                <div className={b('loader')}>
                    <Loader size="m" />
                </div>
            );
        }

        const {
            itemId,
            connectingItemId,
            showConnectByAliasDialog,
            selectedAlias,
            showAliasDialog,
            metas,
        } = this.state;

        return (
            <React.Fragment>
                <div className={b('header')}>
                    <Select
                        qa={ConnectionsDialogQA.ElementSelect}
                        popupClassName={b('element-select-popup')}
                        width="max"
                        filterable
                        filterPlaceholder={i18n('dash.control-dialog.edit', 'placeholder_search')}
                        value={[itemId]}
                        disabled={!this.namespacedItems.length}
                        onUpdate={([itemId]) => this.setState({itemId})}
                        placeholder={i18n('dash.connections-dialog.edit', 'context_choose-element')}
                        options={this.namespacedItems.map(({id, title}) => ({
                            value: id,
                            content: title,
                            disabled: !metas[id],
                        }))}
                    />
                </div>
                <Dialog.Divider />
                <Context.Provider
                    value={{
                        namespacedItems: this.namespacedItems,
                        metas: this.state.metas,
                        getParamTitle: this.getParamTitle,
                        getParamDataset: this.getParamDataset,
                    }}
                >
                    {this.renderConnections()}
                    <ConnectByAlias
                        visible={showConnectByAliasDialog}
                        firstItemId={itemId}
                        secondItemId={connectingItemId}
                        onClose={this.closeConnectByAliasDialog}
                        onApply={this.addAlias}
                    />
                    <ManageAlias
                        visible={showAliasDialog}
                        alias={selectedAlias}
                        onClose={this.closeAliasDialog}
                        onApply={this.updateAlias}
                        removeAlias={this.removeAlias}
                    />
                </Context.Provider>
            </React.Fragment>
        );
    }

    render() {
        const {closeDialog} = this.props;

        const propsButtonCancel = {
            qa: ConnectionsDialogQA.Cancel,
        };

        const propsButtonApply = {
            disabled: this.state.loading,
            qa: ConnectionsDialogQA.Apply,
        };

        return (
            <Dialog open={true} autoclosable={false} onClose={closeDialog} disableFocusTrap={true}>
                <Dialog.Header
                    caption={i18n('dash.connections-dialog.edit', 'label_connections')}
                />
                <Dialog.Body className={b()}>{this.renderBody()}</Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('dash.connections-dialog.edit', 'button_save')}
                    propsButtonCancel={propsButtonCancel}
                    propsButtonApply={propsButtonApply}
                    onClickButtonApply={this.onApply}
                    textButtonCancel={i18n('dash.connections-dialog.edit', 'button_cancel')}
                    onClickButtonCancel={closeDialog}
                />
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => ({
    items: selectCurrentTabConnectableItems(state),
    connections: selectCurrentTab(state).connections,
    aliases: selectCurrentTab(state).aliases,
    dashKitRef: state.dash.dashKitRef,
    workbookId: selectDashWorkbookId(state),
});

const mapDispatchToProps = {
    closeDialog,
    updateCurrentTabData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Connections);
