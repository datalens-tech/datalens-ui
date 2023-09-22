import {batch} from 'react-redux';
import type {Dispatch} from 'redux';
import type {MdbAvailableDatabase} from 'shared';
import type {CountersRowItem} from 'shared/schema/types';

import type {Application, Counter} from '../../../../../shared/schema';
import {SelectItemsKey} from '../constants';
import type {ConnectionsReduxAction} from '../typings';
import {
    shapeBaseEntryItems,
    shapeClusterItems,
    shapeCounterItems,
    shapeHostItems,
    shapeItemsWithId,
    shapeYdbDatabaseItems,
} from '../utils';

import {api} from './api';
import {setSelectItems, setSelectItemsLoading} from './base';

export function getCounters(token: string, type: CountersRowItem['type']) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.Counters, loading: true}));
        let counters: Application[] | Counter[];

        if (type === 'metrica_counter') {
            counters = await api.fetchMetricaCounters(token);
        } else {
            counters = await api.fetchAppmetricaCounters(token);
        }

        batch(() => {
            dispatch(
                setSelectItems({key: SelectItemsKey.Counters, items: shapeCounterItems(counters)}),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.Counters, loading: false}));
        });
    };
}

export function getMdbClusters(dbType: MdbAvailableDatabase, folderId?: string) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbClusters, loading: true}));
        const {clusters, error} = await api.fetchMdbClusters(dbType, folderId);

        batch(() => {
            dispatch(
                setSelectItems({
                    key: SelectItemsKey.MdbClusters,
                    items: shapeClusterItems(clusters),
                    error,
                }),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbClusters, loading: false}));
        });
    };
}

export function getMdbHosts(dbType: MdbAvailableDatabase, clusterId: string, tenantId?: string) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbHosts, loading: true}));
        const {hosts, error} = await api.fetchMdbHosts(dbType, clusterId, tenantId);

        batch(() => {
            dispatch(
                setSelectItems({
                    key: SelectItemsKey.MdbHosts,
                    items: shapeHostItems(hosts),
                    error,
                }),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbHosts, loading: false}));
        });
    };
}

export function getMdbUsers(dbType: MdbAvailableDatabase, clusterId: string, tenantId?: string) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbUsers, loading: true}));
        const {users, error} = await api.fetchMdbUsers(dbType, clusterId, tenantId);

        batch(() => {
            dispatch(
                setSelectItems({
                    key: SelectItemsKey.MdbUsers,
                    items: shapeBaseEntryItems(users),
                    error,
                }),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbUsers, loading: false}));
        });
    };
}

export function getMdbDatabases(
    dbType: MdbAvailableDatabase,
    clusterId: string,
    tenantId?: string,
) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbDatabases, loading: true}));
        const {databases, error} = await api.fetchMdbDatabases(dbType, clusterId, tenantId);

        batch(() => {
            dispatch(
                setSelectItems({
                    key: SelectItemsKey.MdbDatabases,
                    items: shapeBaseEntryItems(databases),
                    error,
                }),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.MdbDatabases, loading: false}));
        });
    };
}

export function getServiceAccounts(tenantId: string) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.ServiceAccounts, loading: true}));
        const {serviceAccounts, error} = await api.fetchServiceAccounts(tenantId);

        batch(() => {
            dispatch(
                setSelectItems({
                    key: SelectItemsKey.ServiceAccounts,
                    items: shapeItemsWithId(serviceAccounts),
                    error,
                }),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.ServiceAccounts, loading: false}));
        });
    };
}

export function getYdbDatabases(tenantId: string) {
    return async (dispatch: Dispatch<ConnectionsReduxAction>) => {
        dispatch(setSelectItemsLoading({key: SelectItemsKey.YdbDatabases, loading: true}));
        const {databases, error} = await api.fetchYdbDatabases(tenantId);

        batch(() => {
            dispatch(
                setSelectItems({
                    key: SelectItemsKey.YdbDatabases,
                    items: shapeYdbDatabaseItems(databases),
                    error,
                }),
            );
            dispatch(setSelectItemsLoading({key: SelectItemsKey.YdbDatabases, loading: false}));
        });
    };
}
