import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {DatalensGlobalState} from 'ui';

import {getIsAsideHeaderEnabled} from '../../../../../components/AsideHeaderAdapter';
import {newConnectionSelector} from '../../../store';

import {FilesList, Workspace} from './components';
import {FileContext} from './context';
import {useHandlers} from './useHandlers';
import {getListItemById, getListItemId} from './utils';

import './File.scss';

const b = block('conn-form-file');

type DispatchState = ReturnType<typeof mapStateToProps>;
type FileProps = DispatchState;

const FileComponent = (props: FileProps) => {
    const {
        uploadedFiles,
        sources,
        replaceSources,
        selectedItemId,
        columnFilter,
        beingDeletedSourceId,
        replaceSourceActionData,
        newConnection,
    } = props;
    const {setSelectedItemId, setInitialFormData, ...contextHandlers} = useHandlers({
        uploadedFiles,
        sources,
        replaceSources,
    });
    const contextValue = {...contextHandlers, beingDeletedSourceId, replaceSourceActionData};
    const items = React.useMemo(() => [...uploadedFiles, ...sources], [uploadedFiles, sources]);
    const selectedItem = React.useMemo(() => {
        return getListItemById(items, selectedItemId).item;
    }, [items, selectedItemId]);
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    React.useEffect(() => {
        setInitialFormData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const {item} = getListItemById(items, selectedItemId);

        if (!item && items.length) {
            const nextSelectedItemId = getListItemId(items[0]);
            setSelectedItemId(nextSelectedItemId);
        }
    }, [setSelectedItemId, items, selectedItemId]);

    return (
        <FileContext.Provider value={contextValue}>
            <div className={b({'with-aside-header': isAsideHeaderEnabled})}>
                <FilesList
                    items={items}
                    selectedItemId={selectedItemId}
                    beingDeletedSourceId={beingDeletedSourceId}
                    newConnection={newConnection}
                    setSelectedItemId={setSelectedItemId}
                />
                <Workspace item={selectedItem} columnFilter={columnFilter} />
            </div>
        </FileContext.Provider>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        uploadedFiles: state.connections.file.uploadedFiles,
        sources: state.connections.file.sources,
        replaceSources: state.connections.file.replaceSources,
        selectedItemId: state.connections.file.selectedItemId,
        columnFilter: state.connections.file.columnFilter,
        beingDeletedSourceId: state.connections.file.beingDeletedSourceId,
        replaceSourceActionData: state.connections.file.replaceSourceActionData,
        newConnection: newConnectionSelector(state),
    };
};

export const File = connect(mapStateToProps)(FileComponent);
