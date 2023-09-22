import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import SearchPanel from './SearchPanel/SearchPanel';
import SearchView from './SearchView/SearchView';
import {EditorSearchContext, useEditorSearchProviderValue} from './state';

import './EditorSearch.scss';

const b = block('editor-search');

export function EditorSearch({tabsData, scriptsValues, paneId, className, onOpenFound, onClear}) {
    const providerValue = useEditorSearchProviderValue({
        tabsData,
        scriptsValues,
        paneId,
        onOpenFound,
        onClear,
    });
    return (
        <EditorSearchContext.Provider value={providerValue}>
            <div className={b(false, className)}>
                <SearchPanel className={b('panel')} />
                <SearchView className={b('view')} />
            </div>
        </EditorSearchContext.Provider>
    );
}

EditorSearch.propTypes = {
    onOpenFound: PropTypes.func,
    onClear: PropTypes.func,
    tabsData: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            language: PropTypes.string,
        }),
    ),
    scriptsValues: PropTypes.objectOf(PropTypes.string),
    paneId: PropTypes.string,
    className: PropTypes.string,
};

export default React.memo(EditorSearch);
