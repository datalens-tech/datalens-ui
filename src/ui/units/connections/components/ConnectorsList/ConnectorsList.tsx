import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {registry} from 'ui/registry';

import type {
    ConnectorItem,
    ConnectorItemSection,
    GetConnectorsResponse,
} from '../../../../../shared/schema';

import {ListItem} from './ListItem';
import {getFilteredConnectors, getVisibleConnectors} from './utils';

const b = block('conn-list');
const MIN_CONNECTORS_COUNT = 20; // CHARTS-4770

type ListProps = {
    flattenConnectors: ConnectorItem[];
    groupedConnectors: GetConnectorsResponse;
    workbookId?: string;
};

const UncategorizedList = (props: {connectors: ConnectorItem[]; workbookId?: string}) => {
    const {connectors, workbookId} = props;

    if (!connectors.length) {
        return null;
    }

    const {getConnectionItemRender} = registry.connections.functions.getAll();

    return (
        <div className={b('list')}>
            {connectors.map((connector) => (
                <ListItem
                    key={connector.conn_type}
                    connector={connector}
                    workbookId={workbookId}
                    render={getConnectionItemRender}
                />
            ))}
        </div>
    );
};

const GroupedList = (props: {
    filter: string;
    sections?: ConnectorItemSection[];
    workbookId?: string;
}) => {
    const {filter, sections, workbookId} = props;

    if (!sections || !sections.length) {
        return null;
    }

    return (
        <React.Fragment>
            {sections.map((section) => {
                const filteredConnectors = getFilteredConnectors(section.connectors, filter);

                if (!filteredConnectors.length) {
                    return null;
                }

                return (
                    <React.Fragment key={section.title}>
                        <h3 className={b('list-title')}>{section.title}</h3>
                        <UncategorizedList
                            connectors={filteredConnectors}
                            workbookId={workbookId}
                        />
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};

export const ConnectorsList = ({flattenConnectors, groupedConnectors, workbookId}: ListProps) => {
    const [filter, setFilter] = React.useState('');
    const showFilter = getVisibleConnectors(flattenConnectors).length >= MIN_CONNECTORS_COUNT;

    const inputHandler = (nextFilter: string) => setFilter(nextFilter);

    return (
        <div className={b()}>
            {showFilter && (
                <TextInput
                    className={b('filter')}
                    placeholder={i18n('connections.form', 'button_connection-name')}
                    value={filter}
                    autoFocus={true}
                    hasClear={true}
                    onUpdate={inputHandler}
                />
            )}
            {(Object.keys(groupedConnectors) as Array<keyof GetConnectorsResponse>).map(
                (key, i) => {
                    switch (key) {
                        case 'uncategorized': {
                            const filteredConnectors = getFilteredConnectors(
                                groupedConnectors[key],
                                filter,
                            );

                            return (
                                <UncategorizedList
                                    key={`uncategorized-list-${i}`}
                                    connectors={filteredConnectors}
                                    workbookId={workbookId}
                                />
                            );
                        }
                        case 'sections': {
                            return (
                                <GroupedList
                                    key={`grouped-list-${i}`}
                                    filter={filter}
                                    sections={groupedConnectors[key]}
                                    workbookId={workbookId}
                                />
                            );
                        }
                        case 'result': {
                            // In case of using old API without uncategorized & sections properties
                            if (Object.keys(groupedConnectors).length === 1) {
                                return (
                                    <UncategorizedList
                                        key={`old-uncategorized-list-${i}`}
                                        connectors={groupedConnectors[key]}
                                        workbookId={workbookId}
                                    />
                                );
                            }

                            return null;
                        }
                        default: {
                            return null;
                        }
                    }
                },
            )}
        </div>
    );
};
